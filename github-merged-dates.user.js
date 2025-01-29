// ==UserScript==
// @name         GitHub Merged Dates
// @namespace    https://github.com/MattFaz/Userscripts
// @version      1.1
// @description  Show exact date and time instead of relative dates on GitHub pull requests page.
// @author       https://github.com/MattFaz
// @match        https://github.com/*
// @grant        none
// @downloadURL  https://github.com/MattFaz/Userscripts/raw/refs/heads/main/github-merged-dates.user.js
// @updateURL    https://github.com/MattFaz/Userscripts/raw/refs/heads/main/github-merged-dates.user.js
// ==/UserScript==

(function () {
    "use strict";

    function updateDates() {
        const relativeTimes = document.querySelectorAll(
            ".js-issue-row relative-time[datetime]"
        );
        relativeTimes.forEach((time) => {
            if (
                !time.nextElementSibling ||
                !time.nextElementSibling.classList.contains("exact-date-time")
            ) {
                const exactDate = new Date(time.getAttribute("datetime"));
                const formattedDateTime = exactDate.toLocaleString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                });
                const exactDateTimeSpan = document.createElement("span");
                exactDateTimeSpan.textContent = ` (${formattedDateTime})`;
                exactDateTimeSpan.classList.add("exact-date-time");
                exactDateTimeSpan.style.marginLeft = "5px";
                time.parentNode.insertBefore(
                    exactDateTimeSpan,
                    time.nextSibling
                );
            }
        });
    }

    function runUpdateDates() {
        updateDates();
        setTimeout(runUpdateDates, 1000); // Run every second
    }

    // Run on page load
    runUpdateDates();

    // Watch for navigation events (for single-page app navigation)
    window.addEventListener("popstate", updateDates);
    window.addEventListener("pushstate", updateDates);
    window.addEventListener("replacestate", updateDates);

    // Watch for dynamic content changes
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === "childList") {
                updateDates();
            }
        });
    });

    observer.observe(document.body, { childList: true, subtree: true });
})();
