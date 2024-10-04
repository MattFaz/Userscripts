// ==UserScript==
// @name        Trakt Collection Remover
// @namespace   https://github.com/MattFaz/Userscripts
// @match       https://trakt.tv/users/*/collection*
// @grant       none
// @version     1.0
// @author      https://github.com/MattFaz
// @description  Remove movies from Trakt collection with options for custom batch size or all on page
// @downloadURL  https://github.com/MattFaz/Userscripts/raw/refs/heads/main/trakt-collection-remover.user.js
// @updateURL    https://github.com/MattFaz/Userscripts/raw/refs/heads/main/trakt-collection-remover.user.js
// ==/UserScript==

(function () {
    "use strict";

    let countdownElement;

    // Function to remove a movie from the collection
    function removeMovie(movieElement) {
        return new Promise((resolve) => {
            const collectionIcon = movieElement.querySelector(
                ".icon.trakt-icon-collection-thick"
            );
            if (collectionIcon) {
                collectionIcon.click();

                setTimeout(() => {
                    const confirmButton = document.querySelector(
                        ".popover-content > button.btn.btn-primary"
                    );
                    if (confirmButton) {
                        confirmButton.click();
                        console.log("Removed a movie from the collection");
                    } else {
                        console.log("Confirmation button not found");
                    }
                    resolve();
                }, 1000);
            } else {
                console.log("Collection icon not found for a movie");
                resolve();
            }
        });
    }

    // Function to process a batch of movies
    async function processBatch(batchSize) {
        const movieElements = document.querySelectorAll(
            "#collection-items > div > div.row.posters > div"
        );
        const batch = Array.from(movieElements).slice(0, batchSize);

        for (let i = 0; i < batch.length; i++) {
            await removeMovie(batch[i]);
            updateCountdown(i + 1, batch.length);
            await new Promise((resolve) => setTimeout(resolve, 1500));
        }

        console.log(`Processed ${batch.length} movies`);
    }

    // Function to update the countdown display
    function updateCountdown(current, total) {
        if (countdownElement) {
            countdownElement.textContent = `Progress: ${current}/${total}`;
        }
    }

    // Main function to start the removal process
    async function startRemoval(batchSize) {
        console.log(`Starting removal process for ${batchSize} movies...`);
        createCountdownElement(batchSize);
        await processBatch(batchSize);
        console.log(
            "Batch processing complete. Reload the page and run the script again for the next batch."
        );
    }

    // Function to get the number of movies on the current page
    function getMoviesOnPage() {
        return document.querySelectorAll(
            "#collection-items > div > div.row.posters > div"
        ).length;
    }

    // Function to create custom dialog for batch size selection
    function createBatchSizeDialog() {
        const dialog = document.createElement("div");
        dialog.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background-color: #1D1D1D;
            color: #FFFFFF;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.5);
            z-index: 10000;
            font-family: Arial, sans-serif;
            width: 300px;
        `;

        const title = document.createElement("h2");
        title.textContent = "Select Batch Size";
        title.style.cssText = `
            margin-top: 0;
            margin-bottom: 20px;
            color: #ED1C24;
            text-align: center;
            font-size: 24px;
        `;

        const input = document.createElement("input");
        input.type = "number";
        input.min = "1";
        input.value = "50";
        input.style.cssText = `
            width: 100%;
            margin-bottom: 20px;
            padding: 10px;
            border: none;
            border-radius: 5px;
            background-color: #333333;
            color: #FFFFFF;
            font-size: 16px;
            box-sizing: border-box;
        `;

        const buttonStyle = `
            padding: 10px 15px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 16px;
            transition: background-color 0.3s;
        `;

        const allOnPageButton = document.createElement("button");
        allOnPageButton.textContent = "All on Page";
        allOnPageButton.style.cssText =
            buttonStyle +
            `
            background-color: #ED1C24;
            color: #FFFFFF;
            margin-right: 10px;
        `;
        allOnPageButton.addEventListener("mouseover", () => {
            allOnPageButton.style.backgroundColor = "#FF3E3E";
        });
        allOnPageButton.addEventListener("mouseout", () => {
            allOnPageButton.style.backgroundColor = "#ED1C24";
        });
        allOnPageButton.addEventListener("click", () => {
            dialog.remove();
            startRemoval(getMoviesOnPage());
        });

        const customSizeButton = document.createElement("button");
        customSizeButton.textContent = "Use Custom Size";
        customSizeButton.style.cssText =
            buttonStyle +
            `
            background-color: #4CAF50;
            color: #FFFFFF;
        `;
        customSizeButton.addEventListener("mouseover", () => {
            customSizeButton.style.backgroundColor = "#45a049";
        });
        customSizeButton.addEventListener("mouseout", () => {
            customSizeButton.style.backgroundColor = "#4CAF50";
        });
        customSizeButton.addEventListener("click", () => {
            const size = parseInt(input.value, 10);
            if (size > 0) {
                dialog.remove();
                startRemoval(size);
            } else {
                alert("Please enter a valid number greater than 0.");
            }
        });

        const cancelButton = document.createElement("button");
        cancelButton.textContent = "Cancel";
        cancelButton.style.cssText =
            buttonStyle +
            `
            background-color: #888888;
            color: #FFFFFF;
            margin-top: 10px;
            width: 100%;
        `;
        cancelButton.addEventListener("mouseover", () => {
            cancelButton.style.backgroundColor = "#999999";
        });
        cancelButton.addEventListener("mouseout", () => {
            cancelButton.style.backgroundColor = "#888888";
        });
        cancelButton.addEventListener("click", () => {
            dialog.remove();
        });

        const buttonContainer = document.createElement("div");
        buttonContainer.style.display = "flex";
        buttonContainer.style.justifyContent = "space-between";
        buttonContainer.appendChild(allOnPageButton);
        buttonContainer.appendChild(customSizeButton);

        dialog.appendChild(title);
        dialog.appendChild(input);
        dialog.appendChild(buttonContainer);
        dialog.appendChild(cancelButton);

        document.body.appendChild(dialog);
    }

    // Function to create the countdown element
    function createCountdownElement(total) {
        if (countdownElement) {
            document.body.removeChild(countdownElement);
        }
        countdownElement = document.createElement("div");
        countdownElement.style.cssText = `
            position: fixed;
            top: 120px;
            right: 20px;
            z-index: 9999;
            padding: 10px;
            background-color: rgba(0, 0, 0, 0.7);
            color: white;
            border-radius: 5px;
            font-family: Arial, sans-serif;
            font-size: 14px;
        `;
        document.body.appendChild(countdownElement);
        updateCountdown(0, total); // Initial display
    }

    // Function to create and add the button to the page
    function addButton() {
        const button = document.createElement("button");
        button.textContent = "Remove Movies from Collection";
        button.style.cssText = `
            position: fixed;
            top: 70px;
            right: 20px;
            z-index: 9999;
            padding: 10px;
            background-color: #ED1C24;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-family: Arial, sans-serif;
            font-size: 14px;
            transition: background-color 0.3s;
        `;
        button.addEventListener("mouseover", () => {
            button.style.backgroundColor = "#FF3E3E";
        });
        button.addEventListener("mouseout", () => {
            button.style.backgroundColor = "#ED1C24";
        });
        button.addEventListener("click", createBatchSizeDialog);
        document.body.appendChild(button);
    }

    // Add the button when the page loads
    window.addEventListener("load", addButton);
})();
