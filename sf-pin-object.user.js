// ==UserScript==
// @name         Salesforce Object Manager Pinner
// @namespace    https://github.com/MattFaz/Userscripts
// @version      1.2
// @description  Pin frequently used objects to the top in Salesforce Object Manager
// @author       https://github.com/MattFaz
// @match        https://*force.com/lightning/setup/ObjectManager/home*
// @grant        none
// @downloadURL  https://github.com/MattFaz/Userscripts/raw/refs/heads/main/sf-pin-object.user.js
// @updateURL    https://github.com/MattFaz/Userscripts/raw/refs/heads/main/sf-pin-object.user.js
// ==/UserScript==

(function () {
    "use strict";

    // Function to wait for an element to be available
    function waitForElement(selector, timeout = 10000) {
        return new Promise((resolve, reject) => {
            const element = document.querySelector(selector);
            if (element) {
                return resolve(element);
            }

            const observer = new MutationObserver((mutations, observer) => {
                const element = document.querySelector(selector);
                if (element) {
                    observer.disconnect();
                    resolve(element);
                }
            });

            observer.observe(document.documentElement, {
                childList: true,
                subtree: true,
            });

            // Timeout after a certain period
            setTimeout(() => {
                observer.disconnect();
                reject(`Element ${selector} not found within timeout`);
            }, timeout);
        });
    }

    // Initialize the script when the necessary elements are available
    async function init() {
        try {
            // Wait for the table and header elements
            await waitForElement("#setupComponent table");
            await waitForElement(
                "#setupComponent > div.slds-page-header.branding-setup.onesetupSetupHeader"
            );

            addPinHeader();
            updatePinnedObjectsBox();
            addPinIcons();

            // Observe for changes in the table (e.g., when scrolling loads more objects)
            const tableContainer = document.querySelector(
                "#setupComponent div.scroller-wrapper"
            );
            if (!tableContainer) {
                console.log("Table container not found");
                return;
            }

            const observer = new MutationObserver(() => {
                addPinIcons();
            });

            observer.observe(tableContainer, {
                childList: true,
                subtree: true,
            });

            // Observe changes to the table header
            const tableSelector = "#setupComponent table";
            const table = document.querySelector(tableSelector);
            if (table) {
                const headerObserver = new MutationObserver(() => {
                    addPinHeader();
                });

                const thead = table.querySelector("thead");
                if (thead) {
                    headerObserver.observe(thead, {
                        childList: true,
                        subtree: true,
                    });
                }
            }
        } catch (error) {
            console.error(error);
        }
    }

    // Start the initialization
    init();

    // Function to add pin header to the table
    function addPinHeader() {
        const tableSelector = "#setupComponent table";
        const table = document.querySelector(tableSelector);
        if (!table) {
            console.log("Table not found for header");
            return;
        }

        const thead = table.querySelector("thead");
        if (!thead) {
            console.log("Table header not found");
            return;
        }

        const headerRow = thead.querySelector("tr");
        if (!headerRow) {
            console.log("Header row not found");
            return;
        }

        // Check if the first cell is already the pin header
        const firstTh = headerRow.querySelector("th");
        if (firstTh && firstTh.classList.contains("pin-header")) {
            // Pin header already added
            return;
        }

        // Create a new header cell for the pin icon
        const pinHeader = document.createElement("th");
        pinHeader.classList.add("pin-header");
        pinHeader.style.textAlign = "center";
        pinHeader.style.width = "40px"; // Adjust width if necessary

        // Insert the pin header at the beginning
        headerRow.insertBefore(pinHeader, headerRow.firstChild);
    }

    // Function to add pin icons to each row
    function addPinIcons() {
        const tableSelector = "#setupComponent table";
        const table = document.querySelector(tableSelector);
        if (!table) {
            console.log("Table not found");
            return;
        }

        const rows = table.querySelectorAll("tbody > tr");
        rows.forEach((row) => {
            // Check if pin icon is already added
            if (row.querySelector(".pin-cell")) return;

            // Create a new cell for the pin icon
            const pinCell = document.createElement("td");
            pinCell.classList.add("pin-cell");
            pinCell.style.textAlign = "center";
            pinCell.style.width = "40px"; // Adjust width if necessary

            // Create the pin icon element
            const pinIcon = document.createElement("span");
            pinIcon.style.cursor = "pointer";
            pinIcon.style.fontSize = "18px";

            // Get the object name
            const objectNameCell = row.querySelector("th a");
            if (!objectNameCell) return;
            const objectName = objectNameCell.textContent.trim();

            // Check if the object is pinned
            const pinnedObjects = JSON.parse(
                localStorage.getItem("pinnedObjects") || "[]"
            );
            if (pinnedObjects.includes(objectName)) {
                pinIcon.textContent = "📍";
            } else {
                pinIcon.textContent = "📌";
            }

            // Add click event listener to the pin icon
            pinIcon.addEventListener("click", function () {
                const pinnedObjects = JSON.parse(
                    localStorage.getItem("pinnedObjects") || "[]"
                );
                if (pinnedObjects.includes(objectName)) {
                    // Unpin the object
                    const index = pinnedObjects.indexOf(objectName);
                    pinnedObjects.splice(index, 1);
                    pinIcon.textContent = "📌";
                } else {
                    // Pin the object
                    pinnedObjects.push(objectName);
                    pinIcon.textContent = "📍";
                }
                localStorage.setItem(
                    "pinnedObjects",
                    JSON.stringify(pinnedObjects)
                );
                updatePinnedObjectsBox();
            });

            pinCell.appendChild(pinIcon);
            row.insertBefore(pinCell, row.firstChild);
        });
    }

    // Function to create/update the pinned objects box
    function updatePinnedObjectsBox() {
        const headerSelector =
            "#setupComponent > div.slds-page-header.branding-setup.onesetupSetupHeader";
        const header = document.querySelector(headerSelector);
        if (!header) {
            console.log("Header not found");
            return;
        }

        // Remove existing pinned objects box if present
        let pinnedBox = document.getElementById("pinned-objects-box");
        if (pinnedBox) {
            pinnedBox.remove();
        }

        // Get pinned objects
        const pinnedObjects = JSON.parse(
            localStorage.getItem("pinnedObjects") || "[]"
        );
        if (pinnedObjects.length === 0) return;

        // Create the box container
        pinnedBox = document.createElement("div");
        pinnedBox.id = "pinned-objects-box";
        pinnedBox.style.display = "flex";
        pinnedBox.style.flexWrap = "wrap";
        pinnedBox.style.marginTop = "5px";
        pinnedBox.style.justifyContent = "center"; // Center the pinned buttons
        pinnedBox.style.padding = "10px 0"; // Optional: add padding
        pinnedBox.style.borderBottom = "1px solid #ddd"; // Optional: add a bottom border

        // Create buttons for each pinned object
        pinnedObjects.forEach((objectName) => {
            const button = document.createElement("button");
            button.textContent = objectName;
            button.style.marginRight = "10px";
            button.style.marginBottom = "5px";
            button.classList.add("slds-button", "slds-button_neutral");
            button.addEventListener("click", function () {
                // Navigate to the object's page
                const link = findObjectLink(objectName);
                if (link) {
                    link.click();
                } else {
                    alert(
                        "Object not found in the table. Please scroll down to load more objects."
                    );
                }
            });
            pinnedBox.appendChild(button);
        });

        // Insert the pinned box after the header
        header.parentNode.insertBefore(pinnedBox, header.nextSibling);
    }

    // Helper function to find the object link
    function findObjectLink(objectName) {
        const tableSelector = "#setupComponent table";
        const table = document.querySelector(tableSelector);
        if (!table) return null;

        const rows = table.querySelectorAll("tbody > tr");
        for (let row of rows) {
            const cell = row.querySelector("th a");
            if (cell && cell.textContent.trim() === objectName) {
                return cell;
            }
        }
        return null;
    }
})();
