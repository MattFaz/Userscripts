// ==UserScript==
// @name         Github Actions Comment Deleter
// @namespace    https://github.com/MattFaz/Userscripts
// @version      1.0
// @description  Delete all Github Actions bot comments
// @author       https://github.com/MattFaz
// @match        https://github.com/*
// @grant        none
// @downloadURL  https://github.com/MattFaz/Userscripts/raw/refs/heads/main/github-actions-comment-deleter.user.js
// @updateURL    https://github.com/MattFaz/Userscripts/raw/refs/heads/main/github-actions-comment-deleter.user.js
// ==/UserScript==

(function () {
    "use strict";

    function addDeleteButton() {
        const header = document.querySelector(".gh-header-actions");
        if (!header) return;

        const button = document.createElement("button");
        button.textContent = "Delete Bot Comments";
        button.className = "btn btn-sm";
        button.style.marginLeft = "10px";
        button.onclick = deleteAllBotComments;
        header.appendChild(button);
    }

    async function deleteAllBotComments() {
        const comments = Array.from(
            document.querySelectorAll(".TimelineItem")
        ).filter((item) => {
            const botName = item.querySelector(
                '.author[href="/apps/github-actions"]'
            );
            const botLabel = item.querySelector(".Label--secondary");
            return botName && botLabel && botLabel.textContent.trim() === "bot";
        });

        console.log(`Found ${comments.length} bot comments`);

        for (const comment of comments) {
            try {
                const menuButton = comment.querySelector(
                    ".timeline-comment-action"
                );
                if (!menuButton) continue;
                menuButton.click();

                await new Promise((resolve) => setTimeout(resolve, 1000));

                const deleteForm = document.querySelector(
                    "form.js-comment-delete"
                );
                if (!deleteForm) continue;
                const deleteButton = deleteForm.querySelector(
                    'button[type="submit"]'
                );
                if (deleteButton) {
                    deleteButton.click();
                    await new Promise((resolve) => setTimeout(resolve, 500));

                    // Click confirm button in popup
                    const confirmButton = document.querySelector(
                        '[data-confirm-text="Are you sure you want to delete this?"]'
                    );
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

    addDeleteButton();
})();
