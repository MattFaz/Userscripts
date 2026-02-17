// ==UserScript==
// @name         Github Actions Comment Deleter
// @namespace    https://github.com/MattFaz/Userscripts
// @version      1.04
// @description  Delete all Github Actions bot comments and resolve review threads
// @author       https://github.com/MattFaz
// @match        https://github.com/*
// @grant        none
// @downloadURL  https://github.com/MattFaz/Userscripts/raw/refs/heads/main/github-actions-comment-deleter.user.js
// @updateURL    https://github.com/MattFaz/Userscripts/raw/refs/heads/main/github-actions-comment-deleter.user.js
// ==/UserScript==

(function () {
  "use strict";

  function isPullRequestPage() {
    return /\/pull\/\d+/.test(location.pathname);
  }

  function addDeleteButton() {
    if (!isPullRequestPage()) return;

    // New React-based PR layout uses data-component="PH_Actions", fall back to legacy selector
    const header =
      document.querySelector('[data-component="PH_Actions"]') ||
      document.querySelector(".gh-header-actions");
    if (!header) return;

    // Prevent duplicate buttons
    if (header.querySelector(".bot-comment-deleter-btn")) return;

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete Bot Comments";
    deleteBtn.className = "btn btn-sm bot-comment-deleter-btn";
    deleteBtn.style.marginLeft = "10px";
    deleteBtn.onclick = deleteAllBotComments;
    header.appendChild(deleteBtn);

    const resolveBtn = document.createElement("button");
    resolveBtn.textContent = "Resolve All Comments";
    resolveBtn.className = "btn btn-sm bot-comment-deleter-btn";
    resolveBtn.style.marginLeft = "10px";
    resolveBtn.onclick = resolveAllComments;
    header.appendChild(resolveBtn);
  }

  async function deleteAllBotComments() {
    const comments = Array.from(document.querySelectorAll(".TimelineItem")).filter((item) => {
      const appAuthor = item.querySelector('.author[href^="/apps/"]');
      const botLabel = item.querySelector(".Label--secondary");
      return appAuthor && botLabel && botLabel.textContent.trim() === "bot";
    });

    console.log(`Found ${comments.length} bot comments`);

    for (const comment of comments) {
      try {
        const menuButton = comment.querySelector(".timeline-comment-action");
        if (!menuButton) continue;
        menuButton.click();

        await new Promise((resolve) => setTimeout(resolve, 1000));

        const deleteForm = document.querySelector("form.js-comment-delete");
        if (!deleteForm) continue;
        const deleteButton = deleteForm.querySelector('button[type="submit"]');
        if (deleteButton) {
          deleteButton.click();
          await new Promise((resolve) => setTimeout(resolve, 500));

          // Click confirm button in popup
          const confirmButton = document.querySelector('[data-confirm-text="Are you sure you want to delete this?"]');
          if (confirmButton) {
            confirmButton.click();
          }

          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      } catch (error) {
        console.error("Error deleting comment:", error);
      }
    }
  }

  async function resolveAllComments() {
    // Find all resolve conversation buttons
    const resolveButtons = document.querySelectorAll(
      'button[name="comment[resolve]"], form.js-resolvable-timeline-thread-form button[type="submit"]'
    );

    console.log(`Found ${resolveButtons.length} resolve buttons`);

    for (const button of resolveButtons) {
      try {
        // Check if the button text indicates it's a resolve button (not unresolve)
        const buttonText = button.textContent.trim().toLowerCase();
        if (buttonText.includes("resolve") && !buttonText.includes("unresolve")) {
          button.click();
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      } catch (error) {
        console.error("Error resolving comment:", error);
      }
    }

    console.log("Finished resolving comments");
  }

  // Run on initial load
  addDeleteButton();

  // Re-run on GitHub SPA navigation (Turbo Drive)
  document.addEventListener("turbo:load", addDeleteButton);
  document.addEventListener("pjax:end", addDeleteButton); // legacy fallback

  // Fallback: observe DOM for the header appearing after dynamic render
  new MutationObserver(() => addDeleteButton()).observe(document.body, {
    childList: true,
    subtree: true,
  });
})();
