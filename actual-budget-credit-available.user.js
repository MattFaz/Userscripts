// ==UserScript==
// @name        Actual Budget - Credit Card Available
// @namespace   https://github.com/MattFaz/Userscripts
// @match       https://*/accounts/*
// @grant       GM_setValue
// @grant       GM_getValue
// @grant       GM_registerMenuCommand
// @version     1.1
// @author      https://github.com/MattFaz
// @description Adds an "Available" total to an Actual Budget credit card account header (credit limit minus current balance). Set the limit per account from the userscript menu.
// @downloadURL https://github.com/MattFaz/Userscripts/raw/refs/heads/main/actual-budget-credit-available.user.js
// @updateURL   https://github.com/MattFaz/Userscripts/raw/refs/heads/main/actual-budget-credit-available.user.js
// ==/UserScript==

(function () {
    "use strict";

    const STORAGE_KEY = "creditLimits";
    const BALANCE_PREFIX = "__global!balance-query-";

    // Credit limits are stored per account id: { "<uuid>": 15000 }
    const getLimits = () => JSON.parse(GM_getValue(STORAGE_KEY, "{}"));
    const setLimit = (accountId, limit) =>
        GM_setValue(
            STORAGE_KEY,
            JSON.stringify({ ...getLimits(), [accountId]: limit })
        );

    const currentAccountId = () =>
        location.pathname.match(/\/accounts\/([0-9a-f-]{36})/)?.[1];

    // Actual wraps amounts in LTR marks, e.g. "-‪A$‬5,939.27"
    const extractNumber = (str) =>
        parseFloat(str.replace(/[^0-9.-]/g, "")) || 0;

    // Reuse whatever currency Actual is already rendering in the balance
    const formatLike = (sample, number) => {
        const symbol = sample.replace(/[‪-‮\s\d.,+-]/g, "") || "$";
        const formatted = new Intl.NumberFormat(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(Math.abs(number));
        return `${number < 0 ? "-" : ""}${symbol}${formatted}`;
    };

    const balanceEl = () =>
        document.querySelector(
            `[data-testid="${BALANCE_PREFIX}${currentAccountId()}"]`
        );

    function promptForLimit() {
        const accountId = currentAccountId();
        if (!accountId) {
            alert("Open an Actual Budget account page first.");
            return;
        }

        const current = getLimits()[accountId];
        const input = prompt(
            "Credit limit for this account (blank to remove):",
            current ?? ""
        );
        if (input === null) return;

        const limit = parseFloat(input.replace(/[^0-9.-]/g, ""));
        setLimit(accountId, isNaN(limit) ? undefined : limit);
        render();
    }

    function render() {
        const existing = document.getElementById("available-credit");
        const accountId = currentAccountId();
        const limit = accountId && getLimits()[accountId];
        const balance = balanceEl();

        if (typeof limit !== "number" || !balance) {
            existing?.remove();
            return;
        }

        const container = balance.closest("button")?.parentElement;
        if (!container) return;

        // Balance is negative when money is owed, so adding it deducts the debt
        const available = formatLike(
            balance.textContent,
            limit + extractNumber(balance.textContent)
        );

        if (existing) {
            const valueEl = existing.querySelector("span");
            if (valueEl.textContent !== available)
                valueEl.textContent = available;
            return;
        }

        // Clone the "Cleared total" span so it picks up Actual's styling
        const template = container.querySelector(":scope > span");
        if (!template) return;

        const el = template.cloneNode(true);
        el.id = "available-credit";
        el.firstChild.nodeValue = "Available: ";
        el.querySelector("span").textContent = available;
        el.style.cursor = "pointer";
        el.title = "Click to change the credit limit";
        el.addEventListener("click", promptForLimit);
        container.appendChild(el);
    }

    GM_registerMenuCommand("Set credit limit for this account", promptForLimit);

    new MutationObserver(render).observe(document.body, {
        childList: true,
        subtree: true,
        characterData: true,
    });

    render();
})();
