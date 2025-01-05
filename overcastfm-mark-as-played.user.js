// ==UserScript==
// @name        Overcast.fm Mark as Played
// @namespace   https://github.com/MattFaz/Userscripts
// @match       https://overcast.fm/*
// @grant       none
// @version     1.0
// @author      https://github.com/MattFaz
// @description Adds a Mark As Played button to Overcast.fm website
// @downloadURL  https://github.com/MattFaz/Userscripts/raw/refs/heads/main/overcastfm-mark-as-played.user.js
// @updateURL    https://github.com/MattFaz/Userscripts/raw/refs/heads/main/overcastfm-mark-as-played.user.js
// ==/UserScript==

(function () {
    "use strict";

    /**
     * Handles click events on "Mark as Played" buttons.
     * Updates UI and makes API call to mark episode as played.
     * @param {Event} ev - Click event object
     */
    function handleButtonClicks(ev) {
        ev.preventDefault();
        const link = findParentWithTag("A", ev.target);

        if (null === link) {
            window.console.error("Unable to find link for podcast", el);
        }

        getEpisodeId(link.href)
            .then(markEpisodeAsPlayed)
            .then(function () {
                const parent = ev.target.parentElement;
                ev.target.remove();
                // Update text to show played status and modify CSS classes
                parent.innerText =
                    parent.innerText.replace(/\s*•.+$/, "") + " • Played";
                link.classList.add("userdeletedepisode");
                link.classList.remove("usernewepisode");
            })
            .catch((err) => {
                window.console.error("Unable to mark episode as played:", err);
            });
    }

    /**
     * Recursively finds the nearest parent element with specified tag
     * @param {string} tag - HTML tag to search for
     * @param {Element} el - Starting element
     * @returns {Element|null} Found element or null
     */
    function findParentWithTag(tag, el) {
        tag = tag.toUpperCase();
        while (el.parentNode) {
            el = el.parentNode;
            if (el.tagName === tag) {
                return el;
            }
        }
        return null;
    }

    /**
     * Fetches episode page and extracts episode ID from HTML
     * @param {string} href - Episode URL
     * @returns {Promise<string>} Episode ID
     */
    function getEpisodeId(href) {
        return fetch(href)
            .then((resp) => resp.text())
            .then((data) => {
                const episodeId = data.match(/data-item-id="(\d+)"/);
                return episodeId[1];
            })
            .catch((err) => {
                window.console.error(
                    `Unable to get episode ID for URL ${href}:`,
                    err
                );
            });
    }

    /**
     * Makes API call to mark episode as played
     * Sets progress to maximum value to mark as complete
     * @param {string} episodeId - Episode identifier
     * @returns {Promise} Fetch promise
     */
    function markEpisodeAsPlayed(episodeId) {
        return fetch(`https://overcast.fm/podcasts/set_progress/${episodeId}`, {
            method: "POST",
            credentials: "same-origin",
            body: "p=2147483647&speed=0&v=0",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
        }).catch((err) => {
            window.console.error(
                `Unable to mark episode ${episodeId} as played:`,
                err
            );
        });
    }

    /**
     * Applies hover effects and styling to button
     * @param {Element} btn - Button element to style
     */
    function addInlineStyles(btn) {
        Object.assign(btn.style, {
            marginLeft: "8px",
            padding: "4px 8px",
            fontFamily: "-apple-system, system-ui, sans-serif",
            color: "#ff9500",
            background: "transparent",
            border: "1px solid #ff9500",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "12px",
        });

        btn.addEventListener("mouseover", () => {
            Object.assign(btn.style, {
                background: "#ff9500",
                color: "white",
            });
        });

        btn.addEventListener("mouseout", () => {
            Object.assign(btn.style, {
                background: "transparent",
                color: "#ff9500",
            });
        });
    }

    /**
     * Marks all episodes as played with random delays
     * Processes buttons in visual order (top to bottom, left to right)
     */
    async function markAllAsPlayed() {
        const buttons = Array.from(
            document.querySelectorAll(".overcast-mark-as-played-btn")
        );

        // Add random delay between 50-2000ms to avoid rate limiting
        function getRandomDelay() {
            return Math.floor(Math.random() * 1950) + 50;
        }

        // Sort buttons by visual position
        const sortedButtons = buttons.sort((buttonA, buttonB) => {
            const rectA = buttonA.getBoundingClientRect();
            const rectB = buttonB.getBoundingClientRect();
            return rectA.top - rectB.top || rectA.left - rectB.left;
        });

        for (let i = 0; i < sortedButtons.length; i++) {
            await new Promise((resolve) =>
                setTimeout(resolve, getRandomDelay())
            );
            sortedButtons[i].click();
            console.log(`${i + 1}/${sortedButtons.length}`);
        }
    }

    /**
     * Initializes the script by adding buttons to UI
     * Adds individual "Mark as Played" buttons to episodes
     * and global "Mark All as Played" button
     */
    function init() {
        const playedRegex = /played$/i;
        const markAsPlayedBtn = document.createElement("button");
        markAsPlayedBtn.innerText = "Mark as Played";
        markAsPlayedBtn.classList.add("overcast-mark-as-played-btn");

        // Add global "Mark All as Played" button next to delete button
        const deleteButton = document.querySelector(
            "#deletepodcastform > button"
        );
        if (deleteButton && !document.querySelector(".mark-all-played-btn")) {
            const markAllBtn = document.createElement("button");
            markAllBtn.innerText = "Mark All as Played";
            markAllBtn.onclick = markAllAsPlayed;
            markAllBtn.className = "ocborderedbutton mark-all-played-btn";
            Object.assign(markAllBtn.style, {
                marginRight: "8px",
            });
            deleteButton.parentNode.insertBefore(markAllBtn, deleteButton);
        }

        // Add individual "Mark as Played" buttons to each unplayed episode
        document
            .querySelectorAll(".titlestack .title + .caption2")
            .forEach((el) => {
                if (playedRegex.test(el.innerText)) {
                    return;
                }

                const btn = markAsPlayedBtn.cloneNode(true);
                btn.onclick = handleButtonClicks;
                addInlineStyles(btn);
                el.appendChild(btn);
            });
    }

    // Initialize and watch for dynamic content changes
    init();
    new MutationObserver((mutations) => {
        for (const mutation of mutations) {
            if (mutation.addedNodes.length) {
                init();
                break;
            }
        }
    }).observe(document.body, { childList: true, subtree: true });
})();
