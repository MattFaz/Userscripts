// ==UserScript==
// @name        Overcast.fm Dark Mode
// @namespace   https://github.com/MattFaz/Userscripts
// @match       https://overcast.fm/*
// @grant       none
// @version     1.0
// @author      https://github.com/MattFaz
// @description Adds dark mode to Overcast.fm website
// @run-at      document-start
// @downloadURL  https://github.com/MattFaz/Userscripts/raw/refs/heads/main/overcastfm-dark-mode.user.js
// @updateURL    https://github.com/MattFaz/Userscripts/raw/refs/heads/main/overcastfm-dark-mode.user.js
// ==/UserScript==

(function () {
  "use strict";

  const css = `
    /* Base */
    html, body {
      background-color: #1a1a1a !important;
      color: #e0e0e0 !important;
    }

    /* Links - keep Overcast orange for brand links */
    a.textcolorlink {
      color: #e0e0e0 !important;
    }

    /* Navigation */
    .nav {
      border-bottom-color: #333 !important;
    }

    .nav a {
      color: #fc7e0f !important;
    }

    /* Feed and episode cells */
    .feedcell, .episodecell, .extendedepisodecell {
      color: #e0e0e0 !important;
    }

    .feedcell:hover, .episodecell:hover, .extendedepisodecell:hover {
      background-color: rgba(252, 126, 15, 0.1) !important;
    }

    /* Titles */
    .title {
      color: #e0e0e0 !important;
    }

    /* Captions and light text */
    .caption2 {
      color: #999 !important;
    }

    .footer, .lighttext {
      color: #888 !important;
    }

    .footer a {
      color: #999 !important;
    }

    /* Artwork borders */
    .art {
      border-color: #444 !important;
      background-color: #2a2a2a !important;
    }

    .tinyart {
      border-color: #444 !important;
      background-color: #2a2a2a !important;
    }

    /* Unplayed indicator - keep visible against dark bg */
    .unplayed_indicator circle {
      stroke: #1a1a1a !important;
    }

    /* Buttons */
    .ocborderedbutton:active, .ocsegmentedbuttonselected {
      background-color: #fc7e0f !important;
      color: #fff !important;
    }

    /* Code blocks */
    code {
      background-color: #2a2a2a !important;
      color: #e0e0e0 !important;
    }

    /* Forms and inputs */
    input, select, textarea {
      background-color: #2a2a2a !important;
      color: #e0e0e0 !important;
      border-color: #444 !important;
    }

    input.podcastsearchbox {
      background-color: #2a2a2a !important;
      color: #e0e0e0 !important;
      border-color: #444 !important;
    }

    input::placeholder {
      color: #777 !important;
    }

    /* Autocomplete search results */
    #autocomplete_results {
      background-color: #222 !important;
      border-color: #555 !important;
      color: #e0e0e0 !important;
    }

    .autocomplete_result h4 {
      color: #e0e0e0 !important;
    }

    /* Separator bar headings */
    h2.ocseparatorbar {
      color: #ccc !important;
    }

    /* Round rect message */
    .roundrectmessage {
      background-color: #2a2a1a !important;
      border-color: #444 !important;
      color: #e0e0e0 !important;
    }

    /* Progress bar */
    #progresssliderbackground {
      border-color: #444 !important;
    }

    #speedcontrol::-webkit-slider-runnable-track {
      background-color: #3a2a1a !important;
    }

    #speedcontrol::-moz-range-track {
      background-color: #3a2a1a !important;
    }

    /* Extended episode cell descriptions */
    .extendedepisodecell {
      color: #e0e0e0 !important;
    }

    /* Pure CSS table overrides */
    .pure-table, .pure-table td, .pure-table th {
      border-color: #444 !important;
      color: #e0e0e0 !important;
    }

    .pure-table thead {
      background-color: #2a2a2a !important;
      color: #e0e0e0 !important;
    }

    /* Headings */
    h1, h2, h3, h4, h5, h6 {
      color: #e0e0e0 !important;
    }

    /* Episode card */
    #episode_card_right {
      color: #e0e0e0 !important;
    }

    /* Time labels */
    #progressbar #timeelapsed, #progressbar #timeremaining {
      color: #999 !important;
    }

    /* Speed labels */
    .speedlabel {
      color: #999 !important;
    }

    /* Legend / fieldset */
    legend {
      color: #e0e0e0 !important;
      border-bottom-color: #444 !important;
    }

    /* Selection */
    ::selection {
      background-color: rgba(252, 126, 15, 0.3) !important;
      color: #fff !important;
    }
  `;

  // Immediately set dark background via DOM API to prevent white flash
  // (programmatic style property access is not blocked by CSP)
  document.documentElement.style.setProperty("background-color", "#1a1a1a", "important");
  document.documentElement.style.setProperty("color", "#e0e0e0", "important");

  function injectStyles() {
    // Use adoptedStyleSheets API to bypass CSP nonce restrictions
    const sheet = new CSSStyleSheet();
    sheet.replaceSync(css);
    document.adoptedStyleSheets = [...document.adoptedStyleSheets, sheet];
  }

  // Inject full stylesheet immediately - adoptedStyleSheets works at document-start
  injectStyles();
})();
