// ==UserScript==
// @name         Salesforce Object Manager Pinner
// @namespace    https://github.com/MattFaz/Userscripts
// @version      1.3
// @description  Pin frequently used objects to the top in Salesforce Object Manager
// @author       https://github.com/MattFaz
// @match        https://*force.com/lightning/setup/ObjectManager/home*
// @grant        none
// @downloadURL  https://github.com/MattFaz/Userscripts/raw/refs/heads/main/sf-pin-object.user.js
// @updateURL    https://github.com/MattFaz/Userscripts/raw/refs/heads/main/sf-pin-object.user.js
// ==/UserScript==

(() => {
    "use strict";

    /**
     * Waits for a DOM element matching the selector to be available.
     * @param {string} selector - The CSS selector of the element to wait for.
     * @param {number} timeout - Maximum time to wait for the element (in milliseconds).
     * @returns {Promise<Element>} - A promise that resolves to the found element.
     */
    const waitForElement = (selector, timeout = 10000) => {
        return new Promise((resolve, reject) => {
            const element = document.querySelector(selector);
            if (element) return resolve(element);

            const observer = new MutationObserver(() => {
                const el = document.querySelector(selector);
                if (el) {
                    observer.disconnect();
                    resolve(el);
                }
            });

            observer.observe(document.body, { childList: true, subtree: true });

            setTimeout(() => {
                observer.disconnect();
                reject(
                    new Error(
                        `Element ${selector} not found within ${timeout}ms`
                    )
                );
            }, timeout);
        });
    };

    /**
     * Overrides the click event on the Object Manager tab using event capturing to force a full page reload.
     */
    const overrideObjectManagerTab = async () => {
        try {
            // Wait for the Object Manager tab to appear
            await waitForElement(
                "a[title='Object Manager'][href='/lightning/setup/ObjectManager/home']"
            );
            const objectManagerTab = document.querySelector(
                "a[title='Object Manager'][href='/lightning/setup/ObjectManager/home']"
            );

            if (!objectManagerTab) {
                console.error("Object Manager tab not found");
                return;
            }

            // Prevent multiple event listeners
            if (objectManagerTab.dataset.overridden) {
                return;
            }
            objectManagerTab.dataset.overridden = "true";

            // Override the click event with event capturing
            objectManagerTab.addEventListener(
                "click",
                (event) => {
                    event.preventDefault();
                    event.stopPropagation();

                    // Construct the full URL to the Object Manager page
                    let baseUrl = window.location.origin;
                    const objectManagerUrl = `${baseUrl}/lightning/setup/ObjectManager/home`;

                    // Perform a full page reload
                    window.location.href = objectManagerUrl;
                },
                true // Use event capturing
            );

            console.log(
                "Object Manager tab click event overridden with event capturing."
            );
        } catch (error) {
            console.error("Error overriding Object Manager tab:", error);
        }
    };

    /**
     * Initializes the script after ensuring necessary elements are loaded.
     */
    const init = async () => {
        if (!isObjectManagerPage()) {
            return;
        }

        // Prevent multiple initializations
        if (window.sfObjectManagerPinnerInitialized) {
            return;
        }
        window.sfObjectManagerPinnerInitialized = true;

        try {
            // Selectors for necessary elements
            const tableSelector = "#setupComponent table";
            const headerSelector =
                "#setupComponent > div.slds-page-header.branding-setup.onesetupSetupHeader";
            const scrollerSelector = "#setupComponent div.scroller-wrapper";

            // Wait for the essential elements to be available
            await waitForElement(tableSelector);
            await waitForElement(headerSelector);

            // Add pin functionalities
            addPinHeader();
            addPinIcons();
            updatePinnedObjectsBox();

            // Observe the table container for dynamic content loading (e.g., infinite scroll)
            const tableContainer = document.querySelector(scrollerSelector);
            if (tableContainer && !tableContainer.dataset.observing) {
                const tableObserver = new MutationObserver(() => {
                    addPinIcons();
                });

                tableObserver.observe(tableContainer, {
                    childList: true,
                    subtree: true,
                });
                tableContainer.dataset.observing = "true";
            }

            // Observe the table header for any changes
            const table = document.querySelector(tableSelector);
            if (table) {
                const thead = table.querySelector("thead");
                if (thead && !thead.dataset.observing) {
                    const headerObserver = new MutationObserver(() => {
                        addPinHeader();
                    });
                    headerObserver.observe(thead, {
                        childList: true,
                        subtree: true,
                    });
                    thead.dataset.observing = "true";
                }
            }
        } catch (error) {
            console.error("Initialization error:", error);
        }
    };

    /**
     * Checks if the current page is the Object Manager page.
     * @returns {boolean} - True if on the Object Manager page, false otherwise.
     */
    const isObjectManagerPage = () => {
        const isCorrectURL = /^\/lightning\/setup\/ObjectManager\/home/.test(
            window.location.pathname
        );
        const hasSetupComponent = !!document.querySelector("#setupComponent");
        return isCorrectURL && hasSetupComponent;
    };

    /**
     * Monitors the DOM for the presence of the Object Manager tab and page elements.
     */
    const monitorDOMChanges = () => {
        const observer = new MutationObserver(() => {
            // Override the Object Manager tab click event
            overrideObjectManagerTab();

            // Initialize the script if we're on the Object Manager page
            if (isObjectManagerPage()) {
                init();
            } else {
                // Reset initialization flag when navigating away
                window.sfObjectManagerPinnerInitialized = false;
                // Remove pinned objects box if it exists
                removePinnedObjectsBox();
            }
        });

        observer.observe(document.body, { childList: true, subtree: true });
    };

    // Start monitoring the DOM
    monitorDOMChanges();

    // If we are already on the Object Manager page, initialize the script
    if (isObjectManagerPage()) {
        init();
    }

    // Attempt to override the Object Manager tab on initial load
    overrideObjectManagerTab();

    /**
     * Adds a pin header column to the object manager table.
     */
    const addPinHeader = () => {
        const table = document.querySelector("#setupComponent table");
        if (!table) {
            console.error("Table not found for header");
            return;
        }

        const thead = table.querySelector("thead");
        if (!thead) {
            console.error("Table header not found");
            return;
        }

        const headerRow = thead.querySelector("tr");
        if (!headerRow) {
            console.error("Header row not found");
            return;
        }

        // Check if the pin header already exists
        if (headerRow.querySelector(".pin-header")) return;

        // Create and insert the pin header cell
        const pinHeader = document.createElement("th");
        pinHeader.classList.add("pin-header");
        pinHeader.style.cssText = "text-align: center; width: 40px;";
        headerRow.insertAdjacentElement("afterbegin", pinHeader);
    };

    /**
     * Adds pin icons to each object row in the table.
     */
    const addPinIcons = () => {
        const table = document.querySelector("#setupComponent table");
        if (!table) {
            console.error("Table not found");
            return;
        }

        const rows = table.querySelectorAll("tbody > tr");
        rows.forEach((row) => {
            // Skip if the pin cell already exists
            if (row.querySelector(".pin-cell")) return;

            // Create the pin cell
            const pinCell = document.createElement("td");
            pinCell.classList.add("pin-cell");
            pinCell.style.cssText = "text-align: center; width: 40px;";

            // Create the pin icon
            const pinIcon = document.createElement("span");
            pinIcon.style.cssText = "cursor: pointer; font-size: 18px;";

            // Get the object name
            const objectNameCell = row.querySelector("th a");
            if (!objectNameCell) return;
            const objectName = objectNameCell.textContent.trim();

            // Set the pin icon based on pinned status
            const pinnedObjects = getPinnedObjects();
            pinIcon.textContent = pinnedObjects.includes(objectName)
                ? "📍"
                : "📌";

            // Add click event to toggle pin status
            pinIcon.addEventListener("click", () => {
                togglePinStatus(objectName, pinIcon);
            });

            pinCell.appendChild(pinIcon);
            row.insertAdjacentElement("afterbegin", pinCell);
        });
    };

    /**
     * Updates the pinned objects box displayed on the page.
     */
    const updatePinnedObjectsBox = () => {
        // Ensure we're on the Object Manager page
        if (!isObjectManagerPage()) return;

        const header = document.querySelector(
            "#setupComponent > div.slds-page-header.branding-setup.onesetupSetupHeader"
        );
        if (!header) {
            console.error("Header not found");
            return;
        }

        // Remove existing pinned objects box if present
        removePinnedObjectsBox();

        const pinnedObjects = getPinnedObjects();
        if (pinnedObjects.length === 0) return;

        // Create the pinned objects container
        const pinnedBox = document.createElement("div");
        pinnedBox.id = "pinned-objects-box";
        pinnedBox.style.cssText =
            "display: flex; flex-wrap: wrap; margin-top: 5px; justify-content: center; padding: 10px 0; border-bottom: 1px solid #ddd;";

        // Create buttons for each pinned object
        pinnedObjects.forEach((objectName) => {
            const button = document.createElement("button");
            button.textContent = objectName;
            button.style.margin = "0 10px 5px 0";
            button.classList.add("slds-button", "slds-button_neutral");
            button.addEventListener("click", () => {
                navigateToObject(objectName);
            });
            pinnedBox.appendChild(button);
        });

        // Insert the pinned box after the header
        header.insertAdjacentElement("afterend", pinnedBox);
    };

    /**
     * Removes the pinned objects box from the page.
     */
    const removePinnedObjectsBox = () => {
        const pinnedBox = document.getElementById("pinned-objects-box");
        if (pinnedBox) {
            pinnedBox.remove();
        }
    };

    /**
     * Retrieves the list of pinned objects from localStorage.
     * @returns {string[]} - Array of pinned object names.
     */
    const getPinnedObjects = () => {
        return JSON.parse(localStorage.getItem("pinnedObjects") || "[]");
    };

    /**
     * Saves the list of pinned objects to localStorage.
     * @param {string[]} pinnedObjects - Array of pinned object names.
     */
    const setPinnedObjects = (pinnedObjects) => {
        localStorage.setItem("pinnedObjects", JSON.stringify(pinnedObjects));
    };

    /**
     * Toggles the pin status of an object and updates the UI accordingly.
     * @param {string} objectName - The name of the object to toggle.
     * @param {Element} pinIcon - The pin icon element to update.
     */
    const togglePinStatus = (objectName, pinIcon) => {
        const pinnedObjects = getPinnedObjects();
        const index = pinnedObjects.indexOf(objectName);
        if (index !== -1) {
            // Unpin the object
            pinnedObjects.splice(index, 1);
            pinIcon.textContent = "📌";
        } else {
            // Pin the object
            pinnedObjects.push(objectName);
            pinIcon.textContent = "📍";
        }
        setPinnedObjects(pinnedObjects);
        updatePinnedObjectsBox();
    };

    /**
     * Navigates to the specified object's page.
     * @param {string} objectName - The name of the object to navigate to.
     */
    const navigateToObject = (objectName) => {
        const link = findObjectLink(objectName);
        if (link) {
            link.click();
        } else {
            alert(
                "Object not found in the table. Please scroll down to load more objects."
            );
        }
    };

    /**
     * Finds the link element for the specified object name.
     * @param {string} objectName - The name of the object to find.
     * @returns {Element|null} - The anchor element linking to the object, or null if not found.
     */
    const findObjectLink = (objectName) => {
        const table = document.querySelector("#setupComponent table");
        if (!table) return null;

        const rows = table.querySelectorAll("tbody > tr");
        for (const row of rows) {
            const cell = row.querySelector("th a");
            if (cell && cell.textContent.trim() === objectName) {
                return cell;
            }
        }
        return null;
    };
})();
