// ==UserScript==
// @name        Salesforce Setup - Add Custom Tabs
// @namespace   https://github.com/MattFaz/Userscripts
// @match       https://*.force.com/lightning/setup/*
// @match       https://*.salesforce.com/lightning/setup/*
// @match       https://*.my.salesforce.com/lightning/setup/*
// @grant       none
// @version     1.2
// @author      https://github.com/MattFaz
// @description Adds custom tabs to the Salesforce Setup page
// @downloadURL https://github.com/MattFaz/Userscripts/raw/refs/heads/main/sf-custom-tabs.user.js
// @updateURL   https://github.com/MattFaz/Userscripts/raw/refs/heads/main/sf-custom-tabs.user.js
// ==/UserScript==

(function () {
    "use strict";

    // Define constants for selectors and class names
    const SELECTORS = {
        tabList: "ul.tabBarItems.slds-grid",
        tabItem: ".oneConsoleTabItem",
        tabHeader: ".tabHeader",
        customTab: ".custom-tab",
        removeTabBtn: ".remove-tab-btn",
        pageHeader: ".slds-page-header__title, .entityNameTitle, h1.pageType",
    };

    // Initial tabs to be added on first run
    const initialTabs = [
        { name: "Classes", url: "/lightning/setup/ApexClasses/home" },
        { name: "Profiles", url: "/lightning/setup/EnhancedProfiles/home" },
        { name: "Users", url: "/lightning/setup/ManageUsers/home" },
    ];

    /**
     * Gets the current page name from the page header or title.
     * @returns {string} The current page name.
     */
    const getCurrentPageName = () => {
        // Try to get the page header title from Lightning pages
        const pageHeader = document.querySelector(SELECTORS.pageHeader);
        if (pageHeader && pageHeader.textContent) {
            return pageHeader.textContent.trim();
        }

        // Fallback to document.title (e.g., "Profiles | Salesforce Setup")
        const title = document.title;
        if (title.includes("|")) {
            return title.split("|")[0].trim();
        }
        return title.trim();
    };

    /**
     * Generates a unique ID for tabs.
     * @returns {string} Unique ID string.
     */
    const generateUniqueId = () => {
        return `customTab-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    };

    /**
     * Displays a non-blocking notification message at the top center of the page.
     * @param {string} message - The message to display.
     * @param {string} [type='info'] - The type of message ('info', 'success', 'warning').
     */
    const showNotification = (message, type = "info") => {
        const notification = document.createElement("div");
        notification.className = `custom-notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);
        setTimeout(() => {
            notification.remove();
        }, 3000);
    };

    // CSS styles for notifications
    const notificationStyles = `
        .custom-notification {
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background-color: #444;
            color: #fff;
            padding: 10px 20px;
            border-radius: 5px;
            z-index: 1000;
        }
        .custom-notification.success { background-color: #28a745; }
        .custom-notification.warning { background-color: #ffc107; }
    `;

    /**
     * Injects custom CSS styles into the page.
     */
    const injectStyles = () => {
        if (document.getElementById("custom-tab-styles")) return;

        const style = document.createElement("style");
        style.id = "custom-tab-styles";
        style.textContent = `
            .custom-tab {
                padding-left: 8px !important;
                padding-right: 8px !important;
            }
            .custom-tab .tabHeader {
                padding-left: 4px !important;
                padding-right: 4px !important;
            }
            .remove-tab-btn {
                margin-left: 8px;
                background: none;
                border: none;
                color: gray;
                cursor: pointer;
                font-size: 14px;
                line-height: 1;
                padding: 0;
                display: inline-block;
                vertical-align: middle;
            }
            .remove-tab-btn:hover {
                color: darkgray;
            }
            /* Notification styles */
            ${notificationStyles}
        `;
        document.head.appendChild(style);
    };

    /**
     * Loads user tabs from localStorage.
     * @returns {Array} Array of user tabs.
     */
    const loadUserTabs = () => {
        try {
            return JSON.parse(localStorage.getItem("userCustomTabs")) || [];
        } catch (e) {
            console.error("Could not access localStorage:", e);
            return [];
        }
    };

    /**
     * Saves user tabs to localStorage.
     * @param {Array} tabs - Array of tabs to save.
     */
    const saveUserTabs = (tabs) => {
        try {
            localStorage.setItem("userCustomTabs", JSON.stringify(tabs));
        } catch (e) {
            console.error("Could not save to localStorage:", e);
        }
    };

    /**
     * Adds a user-defined tab with the current URL and page title.
     */
    const addUserTabFromCurrentPage = () => {
        const currentPageURL =
            window.location.pathname + window.location.search; // Get current page URL
        const userTabName = getCurrentPageName(); // Get the page title

        if (userTabName && currentPageURL) {
            const savedTabs = loadUserTabs();
            const isDuplicate = savedTabs.some(
                (tab) => tab.name === userTabName || tab.url === currentPageURL
            );

            if (isDuplicate) {
                showNotification(
                    `The tab "${userTabName}" already exists.`,
                    "warning"
                );
                return;
            }

            const userTab = { name: userTabName, url: currentPageURL };
            savedTabs.push(userTab);
            saveUserTabs(savedTabs);

            showNotification(`"${userTabName}" tab has been added!`, "success");
            addCustomTabs(); // Refresh tabs after adding
        }
    };

    /**
     * Removes a tab from localStorage and refreshes the DOM.
     * @param {string} tabName - The name of the tab to remove.
     */
    const removeTab = (tabName) => {
        const savedTabs = loadUserTabs();
        const updatedTabs = savedTabs.filter((tab) => tab.name !== tabName); // Remove the tab by name
        saveUserTabs(updatedTabs); // Update localStorage

        // Re-render the tab list to reflect changes
        addCustomTabs();
    };

    /**
     * Creates a custom tab element.
     * @param {Object} tab - The tab object containing name and url.
     * @returns {HTMLElement} The custom tab element.
     */
    const createTabElement = (tab) => {
        const dataTabId = generateUniqueId();

        const newTab = document.createElement("li");
        newTab.className =
            "oneConsoleTabItem tabItem slds-context-bar__item borderRight navexConsoleTabItem custom-tab";
        newTab.setAttribute("data-url", tab.url);
        newTab.setAttribute("role", "presentation");
        newTab.setAttribute("data-tabid", dataTabId);
        newTab.setAttribute("data-aura-class", "navexConsoleTabItem");

        newTab.innerHTML = `
            <a href="#" data-url="${tab.url}" class="tabHeader slds-context-bar__label-action" role="tab" aria-selected="false" tabindex="-1" title="${tab.name}" data-tabid="${dataTabId}">
                <span class="title slds-truncate" title="${tab.name}">${tab.name}</span>
            </a>
        `;

        return newTab;
    };

    /**
     * Creates the "+" tab element for adding new tabs.
     * @returns {HTMLElement} The "+" tab element.
     */
    const createPlusTabElement = () => {
        const plusTab = document.createElement("li");
        plusTab.className =
            "oneConsoleTabItem tabItem slds-context-bar__item borderRight navexConsoleTabItem custom-tab";
        plusTab.setAttribute("role", "presentation");
        plusTab.setAttribute("data-tabid", "addNewTab");

        plusTab.innerHTML = `
            <a href="#" class="tabHeader slds-context-bar__label-action" role="tab" aria-selected="false" tabindex="-1" title="Add New Tab" data-tabid="addNewTab">
                <span class="title slds-truncate">+</span>
            </a>
        `;

        return plusTab;
    };

    /**
     * Activates a tab using Salesforce's internal methods.
     * @param {HTMLElement} tabElement - The tab element to activate.
     * @param {string} url - The URL to navigate to.
     * @param {string} tabId - The unique ID of the tab.
     */
    const activateTab = (tabElement, url, tabId) => {
        try {
            // Deselect all tabs
            const allTabs = document.querySelectorAll(SELECTORS.tabItem);
            allTabs.forEach((tab) => {
                tab.classList.remove(
                    "slds-is-active",
                    "active",
                    "hideAnimation"
                );
                const link = tab.querySelector(SELECTORS.tabHeader);
                if (link) {
                    link.setAttribute("aria-selected", "false");
                    link.setAttribute("tabindex", "-1");
                }
                // Remove "X" button from previously active custom tabs only
                if (tab.classList.contains("custom-tab")) {
                    const removeBtn = tab.querySelector(SELECTORS.removeTabBtn);
                    if (removeBtn) {
                        removeBtn.remove();
                    }
                }
            });

            // Activate the selected tab
            tabElement.classList.add(
                "slds-is-active",
                "active",
                "hideAnimation"
            );
            const link = tabElement.querySelector(SELECTORS.tabHeader);
            if (link) {
                link.setAttribute("aria-selected", "true");
                link.setAttribute("tabindex", "0");
            }

            // Add "X" button to the active tab if it's a custom tab
            if (tabElement.classList.contains("custom-tab")) {
                const removeBtn = document.createElement("button");
                removeBtn.className = "remove-tab-btn";
                removeBtn.innerHTML = "×";
                removeBtn.title = `Remove ${
                    tabElement.querySelector("span.title").textContent
                }`;
                removeBtn.addEventListener("click", (event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    const tabName =
                        tabElement.querySelector("span.title").textContent;
                    // Use custom notification instead of confirm
                    if (
                        confirm(
                            `Are you sure you want to remove the "${tabName}" tab?`
                        )
                    ) {
                        removeTab(tabName); // Remove the tab
                    }
                });

                tabElement.appendChild(removeBtn);
            }

            // Use Salesforce's navigation service (keep as per your request)
            if (window.$A && $A.get && $A.get("e.force:navigateToURL")) {
                $A.get("e.force:navigateToURL").setParams({ url: url }).fire();
            } else {
                // Fallback to full page load if the navigation event is not available
                window.location.href = url;
            }
        } catch (e) {
            console.error("Error activating tab:", e);
            showNotification(
                "An error occurred while activating the tab.",
                "warning"
            );
        }
    };

    /**
     * Waits for an element to appear in the DOM within a timeout.
     * @param {string} selector - The CSS selector of the element to wait for.
     * @param {number} [timeout=5000] - The maximum time to wait in milliseconds.
     * @returns {Promise<HTMLElement>} Promise that resolves with the element.
     */
    const waitForElement = (selector, timeout = 5000) => {
        return new Promise((resolve, reject) => {
            const startTime = Date.now();
            const checkExist = setInterval(() => {
                const element = document.querySelector(selector);
                if (element) {
                    clearInterval(checkExist);
                    resolve(element);
                } else if (Date.now() - startTime > timeout) {
                    clearInterval(checkExist);
                    console.warn(
                        `Element ${selector} not found within timeout.`
                    );
                    reject();
                }
            }, 100);
        });
    };

    /**
     * Adds custom tabs to the Salesforce Setup page.
     */
    const addCustomTabs = async () => {
        try {
            const tabList = await waitForElement(SELECTORS.tabList);
            injectStyles();

            // Clear existing custom tabs first
            const existingCustomTabs = tabList.querySelectorAll(
                SELECTORS.customTab
            );
            existingCustomTabs.forEach((tab) => tab.remove());

            const allTabs = loadUserTabs();
            const fragment = document.createDocumentFragment();

            // Insert custom tabs
            allTabs.forEach((tab) => {
                const newTab = createTabElement(tab);
                fragment.appendChild(newTab);
            });

            // Append the "+" tab
            fragment.appendChild(createPlusTabElement());

            // Append all new tabs at once
            tabList.appendChild(fragment);

            // Attach event listener to the parent tab list for event delegation
            tabList.addEventListener("click", (event) => {
                const target = event.target.closest("a.tabHeader");
                if (!target) return;

                const tabElement = target.closest("li.oneConsoleTabItem");

                // Only handle clicks on custom tabs
                if (!tabElement.classList.contains("custom-tab")) {
                    // Let default behavior proceed for default tabs
                    return;
                }

                event.preventDefault();
                const url = target.getAttribute("data-url");
                const tabId = target.getAttribute("data-tabid");

                if (tabId === "addNewTab") {
                    addUserTabFromCurrentPage();
                } else {
                    activateTab(tabElement, url, tabId);
                }
            });
        } catch (e) {
            console.error("Error adding custom tabs:", e);
        }
    };

    /**
     * Initializes and runs the script.
     */
    const runScript = () => {
        // Check if it's the first run by checking localStorage
        if (!localStorage.getItem("userCustomTabs")) {
            // First run, populate localStorage with initialTabs
            saveUserTabs(initialTabs);
        }
        addCustomTabs();
    };

    // Execute the script
    runScript();
})();
