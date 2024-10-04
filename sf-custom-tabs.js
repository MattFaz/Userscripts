// ==UserScript==
// @name        Salesforce Setup - Add Custom Tabs
// @namespace   https://github.com/MattFaz/Userscripts
// @match       https://*force.com/lightning/setup/*
// @grant       none
// @version     1.0
// @author      https://github.com/MattFaz
// @description Adds custom tabs to the Salesforce Setup page
// ==/UserScript==

(function () {
    "use strict";

    console.log("Script started");

    const customTabs = [
        { name: "Classes", url: "/lightning/setup/ApexClasses/home" },
        { name: "Deployments", url: "/lightning/setup/DeployStatus/home" },
        { name: "Flows", url: "/lightning/setup/Flows/home" },
        { name: "Profiles", url: "/lightning/setup/EnhancedProfiles/home" },
        { name: "Users", url: "/lightning/setup/ManageUsers/home" },
    ];

    let tabIdCounter = 1000; // Starting point for unique data-tabid values

    // Function to wait for an element to appear in the DOM
    function waitForElement(selector, callback) {
        const element = document.querySelector(selector);
        if (element) {
            callback(element);
            return;
        }

        const observer = new MutationObserver((mutations, me) => {
            const element = document.querySelector(selector);
            if (element) {
                me.disconnect();
                callback(element);
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
        });
    }

    function addCustomTabs() {
        const tabList = document.querySelector("ul.tabBarItems.slds-grid");

        if (tabList) {
            console.log("Found Tab List");

            // Insert after the last tab
            customTabs.forEach((tab) => {
                // Check if the tab already exists
                if (
                    !tabList.querySelector(
                        `span.title.slds-truncate[title="${tab.name}"]`
                    )
                ) {
                    // Generate a unique data-tabid
                    tabIdCounter++;
                    const dataTabId = `customTab${tabIdCounter}`;

                    // Create the new tab element
                    const newTab = document.createElement("li");
                    newTab.className =
                        "oneConsoleTabItem tabItem slds-context-bar__item borderRight navexConsoleTabItem custom-tab";
                    newTab.setAttribute("data-url", tab.url);
                    newTab.setAttribute("role", "presentation");
                    newTab.setAttribute("data-tabid", dataTabId);
                    newTab.setAttribute(
                        "data-aura-class",
                        "navexConsoleTabItem"
                    );

                    newTab.innerHTML = `
                        <a href="#" data-url="${tab.url}" class="tabHeader slds-context-bar__label-action" role="tab" aria-selected="false" tabindex="-1" title="${tab.name}" data-tabid="${dataTabId}">
                            <span class="title slds-truncate">${tab.name}</span>
                        </a>
                    `;

                    // Add click event listener
                    newTab
                        .querySelector("a")
                        .addEventListener("click", function (event) {
                            event.preventDefault();
                            var url =
                                event.currentTarget.getAttribute("data-url");
                            var tabId =
                                event.currentTarget.getAttribute("data-tabid");

                            // Use Salesforce's internal method to activate the tab
                            activateTab(newTab, url, tabId);
                        });

                    // Append the new tab to the tab list
                    tabList.appendChild(newTab);

                    console.log(`${tab.name} tab added successfully`);
                }
            });

            // Add custom CSS for padding
            const style = document.createElement("style");
            style.textContent = `
                .custom-tab {
                    padding-left: 8px !important;
                    padding-right: 8px !important;
                }
                .custom-tab .tabHeader {
                    padding-left: 4px !important;
                    padding-right: 4px !important;
                }
            `;
            document.head.appendChild(style);
        } else {
            console.log("Tab list not found");
            // Wait for the tab list to be available
            waitForElement("ul.tabBarItems.slds-grid", addCustomTabs);
        }
    }

    // Function to activate a tab using Salesforce's internal methods
    function activateTab(tabElement, url, tabId) {
        // Deselect all tabs
        const allTabs = document.querySelectorAll("li.oneConsoleTabItem");
        allTabs.forEach((tab) => {
            tab.classList.remove("slds-is-active", "active", "hideAnimation");
            const link = tab.querySelector("a.tabHeader");
            if (link) {
                link.setAttribute("aria-selected", "false");
                link.setAttribute("tabindex", "-1");
            }
        });

        // Activate the selected tab
        tabElement.classList.add("slds-is-active", "active", "hideAnimation");
        const link = tabElement.querySelector("a.tabHeader");
        if (link) {
            link.setAttribute("aria-selected", "true");
            link.setAttribute("tabindex", "0");
        }

        // Use Salesforce's navigation service
        if (window.$A && $A.get && $A.get("e.force:navigateToURL")) {
            $A.get("e.force:navigateToURL").setParams({ url: url }).fire();
        } else {
            // Fallback to full page load if the navigation event is not available
            window.location.href = url;
        }
    }

    // Function to run the script
    function runScript() {
        waitForElement("ul.tabBarItems.slds-grid", function () {
            addCustomTabs();
        });
    }

    // Run the script
    runScript();
})();
