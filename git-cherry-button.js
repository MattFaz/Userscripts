// ==UserScript==
// @name        Copy Git Cherry-Pick Command Button
// @namespace   https://github.com/MattFaz/Userscripts
// @match       https://github.com/*/*/pull/*
// @grant       none
// @version     1.4
// @author      https://github.com/MattFaz
// @description Copy the latest commit ref to clipboard for cherry-picking
// ==/UserScript==
(function () {
    "use strict";
    function getLatestCommitRef() {
        const commitElements = document.querySelectorAll(
            ".TimelineItem-body a code"
        );
        for (let i = commitElements.length - 1; i >= 0; i--) {
            const commitRef = commitElements[i].textContent;
            if (/^[a-f0-9]{7}$/.test(commitRef)) {
                return commitRef;
            }
        }
        return null;
    }
    function addCopyButton() {
        const headerDiv = document.querySelector(
            "#partial-discussion-header > div.gh-header-show > div > div"
        );
        if (headerDiv && !document.getElementById("copyGitCherryPickBtn")) {
            const latestCommitRef = getLatestCommitRef();
            const button = document.createElement("button");
            button.id = "copyGitCherryPickBtn";
            button.textContent = latestCommitRef
                ? `Copy Commit Ref: ${latestCommitRef}`
                : "No Commit Ref Found";
            button.className =
                "flex-md-order-2 Button--secondary Button--small Button m-0 mr-md-0";
            // Add custom styles
            button.style.marginLeft = "8px";
            button.style.verticalAlign = "middle";
            button.style.backgroundColor = "#4492F4";
            button.style.color = "black";
            button.style.border = "none";
            button.onclick = function () {
                const currentCommitRef = getLatestCommitRef();
                if (currentCommitRef) {
                    const cherryPickCommand = `git cherry-pick ${currentCommitRef} -m 1`;
                    navigator.clipboard
                        .writeText(cherryPickCommand)
                        .then(function () {
                            const originalText = button.textContent;
                            button.textContent = "Copied!";
                            const originalBgColor =
                                button.style.backgroundColor;
                            button.style.backgroundColor = "#4CAF50"; // Green background for success
                            setTimeout(function () {
                                button.textContent = `Copy Commit Ref: ${currentCommitRef}`;
                                button.style.backgroundColor = "#4492F4"; // Reset to original blue
                            }, 2000);
                        })
                        .catch(function (err) {
                            console.error("Failed to copy: ", err);
                        });
                } else {
                    button.textContent = "No commit ref found";
                    setTimeout(function () {
                        button.textContent =
                            "Copy Git Cherry-Pick Command: N/A";
                    }, 2000);
                }
            };
            headerDiv.appendChild(button);
        }
    }
    // Initial check
    addCopyButton();
    // Set up a MutationObserver to check for changes
    const observer = new MutationObserver(addCopyButton);
    observer.observe(document.body, { childList: true, subtree: true });
})();
