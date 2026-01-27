# Userscripts Collection

This repository contains a collection of userscripts to enhance your browsing experience. To use these scripts, you'll need to install a userscript manager:

-   Chrome: [TamperMonkey](https://chromewebstore.google.com/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo) or [ViolentMonkey](https://chromewebstore.google.com/detail/violentmonkey/jinjaccalgkegednnccohejagnlnfdag)
-   Firefox: [TamperMonkey](https://addons.mozilla.org/en-US/firefox/addon/tampermonkey/) or [GreaseMonkey](https://addons.mozilla.org/en-GB/firefox/addon/greasemonkey/)
-   Safari: [TamperMonkey](https://apps.apple.com/us/app/tampermonkey/id1482490089) or [Userscripts](https://apps.apple.com/us/app/userscripts/id1463298887)

_Note: Chrome may require you to enable Developer Mode. To enable Developer Mode in Chrome: Open the menu, select "Extensions" and "Manage extensions". Find and click the "Developer Mode" toggle at the top right to enable it._

# Available Scripts

-   [CommBank Credit Card Usage](#commbank-credit-card-usage)
-   [Git Cherry-Pick Command Button](#copy-git-cherry-pick-command-button)
-   [Github Actions Comment Deleter](#github-actions-comment-deleter)
-   [Github Merged Dates](#github-merged-dates)
-   [Overcast.fm Mark as Played](#overcastfm-mark-as-played)
-   [Salesforce Setup - Add Custom Tabs](#salesforce-setup---add-custom-tabs)
-   [Salesforce Object Manager Pinner](#salesforce-object-manager-pinner)
-   [Trakt Collection Remover](#trakt-collection-remover)

# Other Useful Scripts

_Not created by me, but I find them useful_

-   [ChatGPT CSS Fixes](https://gist.github.com/alexchexes/d2ff0b9137aa3ac9de8b0448138125ce/raw/chatgpt_ui_fix.user.js) - Adjusts width of side bar and messages of the ChatGPT web interface

![line](/Documentation/line.png)

## [CommBank Credit Card Usage](/commbank-credit-card-usage.user.js)

The CommBank Credit Card page doesn't show your current balance including pending transactions. This Script adds a small window to the page that displays your balance inclusive of all pending transactions.

![commbank-credit-card-usage](/Documentation/commbank-credit-card-usage.png)

[Click to install](https://github.com/MattFaz/Userscripts/raw/main/commbank-credit-card-usage.user.js)

![line](/Documentation/line.png)

## [Copy Git Cherry-Pick Command Button](/git-cherry-button.user.js)

This script adds a button to GitHub pull request pages, allowing you to easily copy the git cherry-pick command for the latest commit.

![git-cherry-button.png](/Documentation/git-cherry-button.png)

Clicking the button will copy the following to clipboard: `git cherry-pick aa82614 -m 1`

[Click to install](https://github.com/MattFaz/Userscripts/raw/main/git-cherry-button.user.js)

![line](/Documentation/line.png)

## [Github Actions Comment Deleter](/github-actions-comment-deleter.user.js)

This script adds buttons to Github pull request pages:

- **Delete Bot Comments** - Deletes all comments by the Github Actions bot and Runway bot
- **Resolve All Comments** - Resolves all review conversation threads

![github-actions-comment-deleter.png](/Documentation/github-actions-comment-deleter.png)

[Click to install](https://github.com/MattFaz/Userscripts/raw/main/github-actions-comment-deleter.user.js)

![line](/Documentation/line.png)

## [Github Merged Dates](/github-merged-dates.user.js)

Show exact date and time instead of relative dates on GitHub pull requests page.

![github-merged-dates.png](/Documentation/github-merged-dates.png)

[Click to install](https://github.com/MattFaz/Userscripts/raw/main/github-merged-dates.user.js)

![line](/Documentation/line.png)

## [Overcast.fm Mark as Played](/overcast-mark-as-played.user.js)

Adds a _Mark as Played_ button next to episodes, as well as a _Mark All as Played_ button to the top of each podcast.

![overcast-mark-as-played.png](/Documentation/overcast-mark-as-played.png)

[Click to install](https://github.com/MattFaz/Userscripts/raw/main/overcastfm-mark-as-played.user.js)

![line](/Documentation/line.png)

## [Salesforce Setup - Add Custom Tabs](/sf-custom-tabs.user.js)

This script adds custom tabs to the Salesforce Setup page for quick access to frequently used sections.

![sf-custom-tabs.png](/Documentation/sf-custom-tabs.png)

[Click to install](https://github.com/MattFaz/Userscripts/raw/main/sf-custom-tabs.user.js)

![line](/Documentation/line.png)

## [Salesforce Object Manager Pinner](/sf-pin-object.user.js)

This script adds pinning functionality to the Salesforce Object Manager, allowing you to pin frequently used objects to the top of the page for easy access.

![sf-pin-object.png](/Documentation/sf-pin-object.png)

[Click to install](https://github.com/MattFaz/Userscripts/raw/main/sf-pin-object.user.js)

![line](/Documentation/line.png)

## [Trakt Collection Remover](/trakt-collection-remover.user.js)

This Script add a button to removes movies from Trakt collections in batches with a countdown display. A popup window prompts for the batch size _(or you can selet All on Page)_.

![trakt-collection-remover-2.png](/Documentation/trakt-collection-remover-2.png)
![trakt-collection-remover-1.png](/Documentation/trakt-collection-remover-1.png)

[Click to install](https://github.com/MattFaz/Userscripts/raw/main/trakt-collection-remover.user.js)

![line](/Documentation/line.png)

## TODO / Notes:

-   [ ] 🚀 Enhancement: trakt-collection-remover Update to remove TV Shows _(may work, but is untested)_
-   [ ] 🪲 Bug: trakt-collection-remover button disappears when selecting 'next page', requires a page refresh

## Contributing

Feel free to contribute to this collection by submitting pull requests or creating issues for bug reports and feature requests.

## License

These userscripts are released under the GNU GPLv3 License. See the [LICENSE](LICENSE) file for details.
