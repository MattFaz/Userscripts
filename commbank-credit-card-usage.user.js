// ==UserScript==
// @name        CommBank - Credit Card Usage
// @namespace   https://github.com/MattFaz/Userscripts
// @match       https://www1.my.commbank.com.au/netbank/TransactionHistory/History.aspx*
// @match       https://www2.my.commbank.com.au/netbank/TransactionHistory/History.aspx*
// @grant       none
// @version     1.1
// @author      https://github.com/MattFaz
// @description Displays a custom box with Credit Card Balance (including pending).
// @downloadURL https://github.com/MattFaz/Userscripts/raw/refs/heads/main/commbank-credit-card-usage.user.js
// @updateURL   https://github.com/MattFaz/Userscripts/raw/refs/heads/main/commbank-credit-card-usage.user.js
// ==/UserScript==

(function () {
    "use strict";

    // Function to extract number from currency string
    function extractNumber(str) {
        if (!str) {
            // console.log('No string provided to extractNumber');
            return 0;
        }
        // console.log('Processing string:', str);

        // Handle the + sign and currency format
        let cleaned = str
            .replace(/[+$,]/g, "") // Remove +, $, and commas
            .trim(); // Remove any whitespace

        // console.log('Cleaned string:', cleaned);
        return parseFloat(cleaned) || 0;
    }

    // Function to format number as currency
    function formatCurrency(number) {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(number);
    }

    // Function to calculate and display the difference
    function calculateUsage() {
        // Remove any existing display boxes
        const existingBox = document.getElementById("credit-usage-display");
        if (existingBox) {
            existingBox.remove();
        }

        // Get credit limit
        const creditLimitElement = document.querySelector(
            ".liCardLimit .currencyUICredit span"
        );
        // console.log('Credit limit element found:', creditLimitElement);

        // Get available amount - get the parent element to include the decimal part
        const availableElement = document.querySelector(
            "#ctl00_BodyPlaceHolder_summaryAvailableBalance_CC"
        );
        // console.log('Available element found:', availableElement);

        // Only proceed if both elements are found
        if (!creditLimitElement || !availableElement) {
            console.log("Required elements not found yet");
            return false;
        }

        // Get the text content carefully
        const creditLimitText = creditLimitElement.textContent || "";
        const availableText = availableElement.textContent || "";

        // console.log('Credit limit text:', creditLimitText);
        // console.log('Available text:', availableText);

        // Extract numbers
        const creditLimit = extractNumber(creditLimitText);
        const available = extractNumber(availableText);

        // console.log('Parsed credit limit:', creditLimit);
        // console.log('Parsed available:', available);

        // Calculate the difference
        const used = creditLimit - available;

        // Create display element
        const displayDiv = document.createElement("div");
        displayDiv.id = "credit-usage-display";
        displayDiv.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            background-color: #f0f0f0;
            padding: 10px;
            border-radius: 5px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
            z-index: 9999;
            font-family: Arial, sans-serif;
        `;

        displayDiv.innerHTML = `
            <div style="margin-bottom: 5px"><strong>Credit Card Usage:</strong></div>
            <div>Credit Limit: ${formatCurrency(creditLimit)}</div>
            <div>Available: ${formatCurrency(available)}</div>
            <div style="border-top: 1px solid #ccc; margin: 5px 0;"></div>
            <div><strong>Currently Used: ${formatCurrency(used)}</strong></div>
        `;

        // Add to page
        document.body.appendChild(displayDiv);
        return true;
    }

    // Function to start observing DOM changes
    function startObserving() {
        let attempts = 0;
        const maxAttempts = 25; // Maximum number of attempts

        // console.log('Starting observation of DOM changes...');

        // Create an observer instance
        const observer = new MutationObserver((mutations, obs) => {
            attempts++;
            console.log(`Attempt ${attempts} to find elements...`);

            if (calculateUsage()) {
                // If calculation succeeds, disconnect the observer
                // console.log('Elements found and calculation complete!');
                obs.disconnect();
                return;
            }

            if (attempts >= maxAttempts) {
                // console.log('Maximum attempts reached, stopping observation');
                obs.disconnect();
                return;
            }
        });

        // Start observing the document with the configured parameters
        observer.observe(document.body, {
            childList: true,
            subtree: true,
        });

        // Try immediate calculation in case elements are already present
        calculateUsage();
    }

    // Start when the DOM is ready
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", startObserving);
    } else {
        startObserving();
    }
})();
