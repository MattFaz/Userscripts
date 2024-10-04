// ==UserScript==
// @name         Salesforce Object Manager Pinning
// @namespace    https://github.com/MattFaz/Userscripts
// @version      1.0
// @description  Add pinning functionality to Salesforce Object Manager
// @author       https://github.com/MattFaz
// @match        https://*force.com/lightning/setup/ObjectManager/home*
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_registerMenuCommand
// ==/UserScript==

(function () {
    "use strict";

    const OBJECT_STATES_KEY = "sfObjectStates";
    let isProcessing = false;
    let lastTableLength = 0;

    function getObjectStates() {
        return GM_getValue(OBJECT_STATES_KEY, {});
    }

    function setObjectStates(states) {
        GM_setValue(OBJECT_STATES_KEY, states);
    }

    function updateObjectState(apiName, state) {
        // console.log(`Updating state for ${apiName}:`, state);
        const states = getObjectStates();
        states[apiName] = { ...states[apiName], ...state };
        setObjectStates(states);
    }

    function createPinButton(apiName, label, isPinned) {
        const button = document.createElement("button");
        button.innerHTML = isPinned ? "📌" : "📍";
        button.style.background = "none";
        button.style.border = "1px solid #d8dde6";
        button.style.borderRadius = "4px";
        button.style.padding = "5px 10px";
        button.style.margin = "0 5px";
        button.style.cursor = "pointer";
        button.onclick = function (e) {
            e.preventDefault();
            e.stopPropagation();
            togglePinState(apiName, label);
        };
        return button;
    }

    function togglePinState(apiName, label) {
        // console.log(`Toggling pin state for ${apiName} (${label})`);
        const states = getObjectStates();
        const currentState = states[apiName] || { pinned: false };
        const newPinnedState = !currentState.pinned;
        updateObjectState(apiName, { pinned: newPinnedState, label: label });
        refreshPinnedArea();
        updateTableButtons();
    }

    function createPinnedArea() {
        let pinnedArea = document.getElementById("pinnedObjectsArea");
        if (!pinnedArea) {
            pinnedArea = document.createElement("div");
            pinnedArea.id = "pinnedObjectsArea";
            pinnedArea.style.margin = "20px";
            pinnedArea.style.padding = "10px";
            pinnedArea.style.border = "1px solid #d8dde6";
            pinnedArea.style.borderRadius = "4px";
            pinnedArea.style.backgroundColor = "#f3f2f2";

            const table = document.querySelector("table");
            if (table) {
                table.parentNode.insertBefore(pinnedArea, table);
            }
        }
        return pinnedArea;
    }

    function createPinnedButton(apiName, label) {
        const button = document.createElement("button");
        button.textContent = label || apiName;
        button.style.background = "white";
        button.style.border = "1px solid #d8dde6";
        button.style.borderRadius = "4px";
        button.style.padding = "8px 12px";
        button.style.margin = "5px";
        button.style.cursor = "pointer";
        button.style.width = "calc(12.5% - 10px)"; // 1/8 of the width minus margins
        button.style.whiteSpace = "nowrap";
        button.style.overflow = "hidden";
        button.style.textOverflow = "ellipsis";
        button.onclick = function () {
            window.location.href = `/lightning/setup/ObjectManager/${apiName}/FieldsAndRelationships/view`;
        };
        return button;
    }

    function refreshPinnedArea() {
        const pinnedArea = createPinnedArea();
        const states = getObjectStates();
        const pinnedObjects = Object.entries(states)
            .filter(([_, state]) => state.pinned)
            .sort((a, b) =>
                (a[1].label || a[0]).localeCompare(b[1].label || b[0])
            ); // Sort alphabetically

        if (pinnedObjects.length === 0) {
            pinnedArea.style.display = "none";
            return;
        }

        pinnedArea.style.display = "block";
        pinnedArea.innerHTML =
            '<h3 style="margin-bottom: 10px;">Pinned Objects</h3>';
        const grid = document.createElement("div");
        grid.style.display = "flex";
        grid.style.flexWrap = "wrap";
        grid.style.justifyContent = "flex-start";

        pinnedObjects.forEach(([apiName, state]) => {
            const button = createPinnedButton(apiName, state.label);
            grid.appendChild(button);
        });

        pinnedArea.appendChild(grid);
    }

    function addHeaderColumn() {
        const headerRow = document.querySelector("table thead tr");
        if (headerRow && !headerRow.querySelector(".pin-header")) {
            const pinHeader = document.createElement("th");
            pinHeader.className = "pin-header";
            pinHeader.style.width = "100px";
            pinHeader.textContent = "Pin";
            headerRow.appendChild(pinHeader);
        }
    }

    function updateTableButtons() {
        if (isProcessing) return;
        isProcessing = true;

        const tbody = document.querySelector("table tbody");
        if (!tbody) {
            console.log("Table body not found");
            isProcessing = false;
            return;
        }

        addHeaderColumn();

        const rows = tbody.querySelectorAll("tr");
        const states = getObjectStates();

        // console.log("Current object states:", states);

        rows.forEach((row) => {
            const cells = row.querySelectorAll("th, td");
            if (cells.length >= 3) {
                const label = cells[0].textContent.trim();
                const apiName = cells[1].textContent.trim();
                const isPinned = states[apiName]?.pinned === true;

                // console.log(`Row: ${label} (${apiName}), Pinned: ${isPinned}`);

                let pinCell = row.querySelector(".pin-cell");
                if (!pinCell) {
                    pinCell = document.createElement("td");
                    pinCell.className = "pin-cell";
                    row.appendChild(pinCell);
                }
                pinCell.innerHTML = "";
                pinCell.appendChild(createPinButton(apiName, label, isPinned));
            }
        });

        isProcessing = false;
    }

    function waitForTable() {
        return new Promise((resolve) => {
            const checkTable = () => {
                const table = document.querySelector("table");
                if (table) {
                    // console.log("Table found");
                    resolve(table);
                } else {
                    // console.log("Table not found, retrying...");
                    setTimeout(checkTable, 100);
                }
            };
            checkTable();
        });
    }

    async function initializePinning() {
        // console.log("Initializing pinning functionality");
        const table = await waitForTable();
        lastTableLength = table.rows.length;

        refreshPinnedArea();
        updateTableButtons();

        // Set up an observer to handle dynamic content changes
        const observer = new MutationObserver((mutations) => {
            for (let mutation of mutations) {
                if (
                    mutation.type === "childList" &&
                    mutation.removedNodes.length > 0
                ) {
                    for (let node of mutation.removedNodes) {
                        if (
                            node.classList &&
                            node.classList.contains("pin-cell")
                        ) {
                            // console.log("Pin cell removed, updating buttons");
                            updateTableButtons();
                            return;
                        }
                    }
                }
            }

            const currentTableLength = table.rows.length;
            if (currentTableLength !== lastTableLength) {
                // console.log("Table length changed, updating buttons");
                lastTableLength = currentTableLength;
                updateTableButtons();
                refreshPinnedArea();
            }
        });

        observer.observe(table, { childList: true, subtree: true });
        // console.log("MutationObserver set up");

        // Periodically check and update buttons
        setInterval(() => {
            if (!document.querySelector(".pin-cell")) {
                // console.log("Pin cells missing, updating buttons");
                updateTableButtons();
            }
        }, 1000);
    }

    function clearObjectStates() {
        GM_setValue(OBJECT_STATES_KEY, {});
        // console.log("Object states cleared");
        refreshPinnedArea();
        updateTableButtons();
    }

    // Register a menu command to clear states
    GM_registerMenuCommand(
        "Clear Pinned Salesforce Objects",
        clearObjectStates
    );

    // Expose the clearObjectStates function to the global scope
    unsafeWindow.clearSalesforceObjectStates = clearObjectStates;

    // Start the initialization process when the page loads
    if (document.readyState === "loading") {
        // console.log("Document still loading, waiting for DOMContentLoaded");
        window.addEventListener("DOMContentLoaded", initializePinning);
    } else {
        // console.log("Document already loaded, initializing immediately");
        initializePinning();
    }
})();
