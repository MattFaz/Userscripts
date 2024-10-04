# Userscripts Collection

This repository contains a collection of userscripts to enhance your browsing experience. To use these scripts, you'll need to install a userscript manager:

-   Chrome: [ViolentMonkey](https://chromewebstore.google.com/detail/violentmonkey/jinjaccalgkegednnccohejagnlnfdag) or [TamperMonkey](https://chromewebstore.google.com/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)
-   Firefox: [TamperMonkey](https://addons.mozilla.org/en-US/firefox/addon/tampermonkey/)

# Available Scripts

-   [Git Cherry-Pick Command Button](#copy-git-cherry-pick-command-button)
-   [Salesforce Setup - Add Custom Tabs](#salesforce-setup---add-custom-tabs)
-   [Salesforce Object Manager Pinning](#salesforce-object-manager-pinning)
-   [Trakt Collection Remover](#trakt-collection-remover)

![line](/Documentation/line.png)

## [Copy Git Cherry-Pick Command Button](/git-cherry-button.user.js)

This script adds a button to GitHub pull request pages, allowing you to easily copy the git cherry-pick command for the latest commit.

![git-cherry-button.png](/Documentation/git-cherry-button.png)

Clicking the button will copy the following to clipboard: `git cherry-pick aa82614 -m 1`

[Click to install](https://github.com/MattFaz/Userscripts/raw/main/git-cherry-button.user.js)

![line](/Documentation/line.png)

## [Salesforce Setup - Add Custom Tabs](/sf-custom-tabs.user.js)

This script adds custom tabs to the Salesforce Setup page for quick access to frequently used sections.

![sf-custom-tabs.png](/Documentation/sf-custom-tabs.png)

To add/modify the custom tabs edit the `customTabs` list in your Userscript extension. Add/Remove lines ensuring you copy the format of the existing lines _(URL can be obtained by browsing to the page and copying everything in the URL after `.com`)_.

Default `customTabs` is:

```js
const customTabs = [
    { name: "Classes", url: "/lightning/setup/ApexClasses/home" },
    { name: "Deployments", url: "/lightning/setup/DeployStatus/home" },
    { name: "Flows", url: "/lightning/setup/Flows/home" },
    { name: "Profiles", url: "/lightning/setup/EnhancedProfiles/home" },
    { name: "Users", url: "/lightning/setup/ManageUsers/home" },
];
```

[Click to install](https://github.com/MattFaz/Userscripts/raw/main/sf-custom-tabs.user.js)

![line](/Documentation/line.png)

## [Salesforce Object Manager Pinning](/sf-pin-object.user.js)

This script adds pinning functionality to the Salesforce Object Manager, allowing you to pin frequently used objects for easy access.

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

-   [ ] 🪲 Bug: sf-pin-object currently only works when you load directly onto the Object Manager page _(or refresh page when on the Object Manager)_.
-   [ ] 🚀 Enhancement: sf-custom-tabs add a way to add tabs without needing to edit script
-   [ ] 🚀 Enhancement: trakt-collection-remover Update to remove TV Shows _(may work, but is untested)_
-   [ ] 🪲 Bug: trakt-collection-remover button disappears when selecting 'next page', requires a page refresh

## Contributing

Feel free to contribute to this collection by submitting pull requests or creating issues for bug reports and feature requests.

## License

These userscripts are released under the GNU GPLv3 License. See the [LICENSE](LICENSE) file for details.
