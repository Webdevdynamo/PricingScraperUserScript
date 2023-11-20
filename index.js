// ==UserScript==
// @name         PriceScraper
// @namespace    https://github.com/Webdevdynamo/
// @downloadURL  https://raw.githubusercontent.com/Webdevdynamo/cbplus_2/main/index.js
// @updateURL  https://raw.githubusercontent.com/Webdevdynamo/cbplus_2/main/index.js
// @version      2.3.3
// @description  PriceScraper
// @author       Unknown
// @match      https://www.hotelsigns.com/*
// @match      https://hotelsigns.com/*
// @grant        GM_getResourceText
// @grant        GM_addStyle
// @grant        GM_setValue
// @grant        GM_getValue
// @run-at       document-end
// ==/UserScript==

'use strict';


GM_addStyle (GM_getResourceText("vjCSS"));
GM_addStyle (GM_getResourceText("jqCSS"));
GM_addStyle (GM_getResourceText("cbCSS"));

const globals = {};

console.log("LOADED"); 
