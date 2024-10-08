// ==UserScript==
// @name         Salesforce Object Manager Pinner
// @namespace    https://github.com/MattFaz/Userscripts
// @version      1.5
// @description  Pin frequently used objects to the top in Salesforce Object Manager
// @author       https://github.com/MattFaz
// @match        https://*.force.com/lightning/setup/*
// @match        https://*.salesforce.com/lightning/setup/*
// @match        https://*.my.salesforce.com/lightning/setup/*
// @grant        none
// @downloadURL  https://github.com/MattFaz/Userscripts/raw/refs/heads/main/sf-pin-object.user.js
// @updateURL    https://github.com/MattFaz/Userscripts/raw/refs/heads/main/sf-pin-object.user.js
// ==/UserScript==

(() => {
    "use strict";

    const STORAGE_KEY = "objectManagerItems";

    // Function to check the page title
    const checkTitle = () => {
        const titleElement = document.querySelector("head > title");
        if (
            titleElement &&
            titleElement.textContent.includes("Object Manager")
        ) {
            console.log("Script is triggered: Object Manager page detected");
            waitForTableAndHeader();
        }
    };

    // Function to check for table row presence and header presence
    const checkTableAndHeaderPopulation = () => {
        const tableBody = document.querySelector(
            "#setupComponent > div.setupcontent > div > div.scroller.uiScroller.scroller-wrapper.scroll-bidirectional.native > div > table > tbody"
        );
        const headerElement = document.querySelector(".slds-page-header");
        if (tableBody && headerElement) {
            console.log("Table and header are detected and populated");
            addCirclesToRows(); // Add circles after table is populated
            observeTableChanges(); // Start observing table changes for dynamic rows
            addButtonsToTable(); // Add buttons to the table
            return true;
        }
        return false;
    };

    // Function to wait for the table and header to be populated
    const waitForTableAndHeader = () => {
        const interval = setInterval(() => {
            if (checkTableAndHeaderPopulation()) {
                clearInterval(interval);
            }
        }, 1000);
    };

    // Function to get the color based on local storage state
    const getCircleColor = (id) => {
        const storedItems = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
        const item = storedItems.find((item) => item.id === id);
        return item ? (item.saved ? "green" : "lightgray") : "lightgray";
    };

    // Function to add circles to each row
    const addCirclesToRows = () => {
        const rows = document.querySelectorAll(
            "#setupComponent > div.setupcontent > div > div.scroller.uiScroller.scroller-wrapper.scroll-bidirectional.native > div > table > tbody > tr"
        );
        rows.forEach((row) => {
            const thElement = row.querySelector("th");
            if (thElement && !thElement.querySelector(".status-circle")) {
                const aTag = thElement.querySelector("a");
                if (aTag) {
                    // Create and style the circle
                    const circle = document.createElement("span");
                    circle.className = "status-circle";
                    circle.style.width = "10px";
                    circle.style.height = "10px";
                    circle.style.borderRadius = "50%";
                    circle.style.backgroundColor = getCircleColor(
                        aTag.getAttribute("href")
                    );
                    circle.style.display = "inline-block";
                    circle.style.marginRight = "8px";
                    circle.style.cursor = "pointer";

                    // Set the circle color based on local storage
                    const href = aTag.getAttribute("href");
                    const idMatch = href.match(/\/ObjectManager\/(.*?)\/view/);
                    const id = idMatch ? idMatch[1] : aTag.textContent.trim();
                    circle.style.backgroundColor = getCircleColor(id);

                    // Add click event listener
                    circle.addEventListener("click", () => {
                        const currentColor = circle.style.backgroundColor;
                        const saved =
                            currentColor === "lightgray" ? true : false;
                        circle.style.backgroundColor = saved
                            ? "green"
                            : "lightgray";

                        // Update the storage
                        let items =
                            JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
                        const itemIndex = items.findIndex(
                            (item) => item.id === id
                        );
                        if (itemIndex > -1) {
                            items[itemIndex].saved = saved;
                        } else {
                            items.push({
                                label: aTag.textContent.trim(),
                                id,
                                saved,
                            });
                        }
                        localStorage.setItem(
                            STORAGE_KEY,
                            JSON.stringify(items)
                        );
                        console.log(
                            `Saved to local storage: ${aTag.textContent.trim()} (${id})`
                        );

                        // Update buttons in the table
                        addButtonsToTable();
                    });

                    // Insert the circle before the label
                    thElement.insertBefore(circle, aTag);
                }
            }
        });
    };

    // Function to observe changes in the table for dynamic row loading
    const observeTableChanges = () => {
        const tableBody = document.querySelector(
            "#setupComponent > div.setupcontent > div > div.scroller.uiScroller.scroller-wrapper.scroll-bidirectional.native > div > table > tbody"
        );
        if (tableBody) {
            const observer = new MutationObserver((mutationsList) => {
                for (const mutation of mutationsList) {
                    if (mutation.type === "childList") {
                        addCirclesToRows(); // Reapply circles to new rows
                    }
                }
            });

            observer.observe(tableBody, { childList: true });
        }
    };

    // Function to remove an item from storage and update UI
    const removeItem = (id) => {
        let items = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
        items = items.filter((item) => item.id !== id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));

        // Update the circle color in the corresponding row
        const rows = document.querySelectorAll(
            "#setupComponent > div.setupcontent > div > div.scroller.uiScroller.scroller-wrapper.scroll-bidirectional.native > div > table > tbody > tr"
        );
        rows.forEach((row) => {
            const aTag = row.querySelector("th a");
            if (aTag) {
                const href = aTag.getAttribute("href");
                const idMatch = href.match(/\/ObjectManager\/(.*?)\/view/);
                const rowId = idMatch ? idMatch[1] : aTag.textContent.trim();
                if (rowId === id) {
                    const circle = row.querySelector(".status-circle");
                    if (circle) {
                        circle.style.backgroundColor = "lightgray";
                    }
                }
            }
        });

        // Refresh the buttons in the table
        addButtonsToTable();
    };

    // Function to navigate to Object Manager
    const navigateToObjectManager = (id) => {
        const url = `/lightning/setup/ObjectManager/${id}/view`;
        if (typeof $A !== "undefined" && $A.get) {
            // Try to use Salesforce's Lightning navigation if available
            const navService = $A.get("e.force:navigateToURL");
            if (navService) {
                navService.setParams({
                    url: url,
                });
                navService.fire();
            } else {
                // Fallback to history.pushState
                history.pushState(null, "", url);
            }
        } else {
            // If Salesforce's API is not available, use history.pushState
            history.pushState(null, "", url);
        }
    };

    // Function to add buttons to the table
    const addButtonsToTable = () => {
        const table = document.querySelector(
            "#setupComponent > div.setupcontent > div > div.scroller.uiScroller.scroller-wrapper.scroll-bidirectional.native > div > table"
        );
        if (!table) {
            console.log("Table not found.");
            return;
        }

        // Remove existing buttons row if it exists
        const existingButtonsRow = table.querySelector(".saved-buttons-row");
        if (existingButtonsRow) {
            existingButtonsRow.remove();
        }

        const storedItems = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
        const savedItems = storedItems.filter((item) => item.saved);

        if (savedItems.length === 0) {
            return; // No saved items, don't add the buttons row
        }

        // Sort saved items alphabetically by label
        savedItems.sort((a, b) => a.label.localeCompare(b.label));

        // Create a new row for buttons
        const buttonsRow = document.createElement("tr");
        buttonsRow.className = "saved-buttons-row";
        const buttonsCell = document.createElement("td");
        buttonsCell.colSpan = "7"; // Span across all 7 columns
        buttonsCell.style.padding = "10px";
        buttonsCell.style.backgroundColor = "#f3f3f3";
        buttonsCell.style.borderBottom = "2px solid #dddddd"; // Add a divider
        buttonsCell.style.textAlign = "center"; // Center the buttons

        // Create a container for the buttons to allow for flexbox centering
        const buttonContainer = document.createElement("div");
        buttonContainer.style.display = "flex";
        buttonContainer.style.flexWrap = "wrap";
        buttonContainer.style.justifyContent = "center";
        buttonContainer.style.alignItems = "center";

        // Add buttons for each saved item
        savedItems.forEach((item) => {
            const buttonWrapper = document.createElement("div");
            buttonWrapper.style.position = "relative";
            buttonWrapper.style.display = "inline-block";
            buttonWrapper.style.margin = "5px"; // Add some margin around each button

            const button = document.createElement("button");
            button.textContent = item.label;
            button.className = "slds-button slds-button_neutral";
            button.style.paddingRight = "30px"; // Make room for the 'X'
            button.addEventListener("click", (e) => {
                e.preventDefault();
                navigateToObjectManager(item.id);
            });

            const removeButton = document.createElement("span");
            removeButton.textContent = "×"; // Use '×' character for the X
            removeButton.style.position = "absolute";
            removeButton.style.right = "8px";
            removeButton.style.top = "50%";
            removeButton.style.transform = "translateY(-50%)";
            removeButton.style.cursor = "pointer";
            removeButton.style.fontSize = "16px";
            removeButton.style.color = "#999";
            removeButton.style.padding = "0 5px";
            removeButton.addEventListener("click", (e) => {
                e.stopPropagation(); // Prevent button click
                removeItem(item.id);
            });

            buttonWrapper.appendChild(button);
            buttonWrapper.appendChild(removeButton);
            buttonContainer.appendChild(buttonWrapper);
        });

        buttonsCell.appendChild(buttonContainer);
        buttonsRow.appendChild(buttonsCell);

        // Insert the buttons row at the top of the table
        table.insertBefore(buttonsRow, table.firstChild);
    };

    // Initial check when the script loads
    checkTitle();

    // Observe changes to the DOM for the title changes
    const observer = new MutationObserver((mutationsList) => {
        for (const mutation of mutationsList) {
            if (
                mutation.type === "childList" &&
                mutation.target.nodeName === "TITLE"
            ) {
                checkTitle();
            }
        }
    });

    // Start observing the title element
    const titleElement = document.querySelector("head > title");
    if (titleElement) {
        observer.observe(titleElement, { childList: true });
    }
})();
