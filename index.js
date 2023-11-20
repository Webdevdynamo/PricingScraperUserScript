// ==UserScript==
// @name         PriceScraper
// @namespace    https://github.com/Webdevdynamo/
// @downloadURL  file://E:\CodeProjects\PricingScraperUserScript\index.js
// @updateURL      file://E:\CodeProjects\PricingScraperUserScript\index.js
// @version      0.0.1
// @description  PriceScraper
// @author       Unknown
// @match      https://www.hotelsigns.com/*
// @match      https://hotelsigns.com/*
// @require       http://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js
// @require      file://E:\CodeProjects\CBPlus\cbplus_2\index.js
// @grant        GM_getResourceText
// @grant        GM_addStyle
// @grant        GM_setValue
// @grant        GM_getValue
// @run-at       document-end
// ==/UserScript==

'use strict';


// GM_addStyle (GM_getResourceText("vjCSS"));
// GM_addStyle (GM_getResourceText("jqCSS"));
// GM_addStyle (GM_getResourceText("cbCSS"));

const globals = {};

//GM_setValue("master_products",null);

if(jQuery(".searchResultsControls").length === 0) {
    console.log("Scrapper Disabled");
    return false;
}

globals.master_products = GM_getValue("master_products");


if(typeof master_products == "undefined"){
    globals.master_products = {};
}else{
    globals.master_products = JSON.parse(master_products);
}

console.log(globals.master_products);

function getProductId(product){
    let id = product.attr("id").replace("product_content_","");
    return id;
}

function getProductThumbUrl(product){
    let thumb_url = product.find(".product_thumbnail").attr("src");
    return thumb_url;
}

function getProductCollection(product){
    let collection_name = product.find(".contentArea_middle > a > span").text();
    return collection_name;
}

function getProductDetails(product){
    let product_details = {};
    let details = product.find(".contentArea_middle_desc > a");
    product_details.product_name = details.find("em").text();
    product_details.price = details.find("b").text().replace("as low as ","").replace("$","");
    
    let detail_array = details.html().split("<br>");
    product_details.part_number = detail_array[1];

    let regex = /([0-9]*)\"h x ([0-9.]*)\"w/;
    let dimensions = detail_array[2].match(regex);
    product_details.height = dimensions[1];
    product_details.width = dimensions[2];

    return product_details;
}

function convertProductsToCsv(){
    const items = json3.items
    const replacer = (key, value) => value === null ? '' : value // specify how you want to handle null values here
    const header = Object.keys(items[0])
    const csv = [
    header.join(','), // header row first
    ...items.map(row => header.map(fieldName => JSON.stringify(row[fieldName], replacer)).join(','))
    ].join('\r\n')

    console.log(csv)
}

function getProducts(){
    jQuery(".product").each(function(){
        let product_obj = {};
        let product = jQuery(this);
        let productId = getProductId(product);
        let thumb_url = getProductThumbUrl(product);
        let collection_name = getProductCollection(product);
        let details = getProductDetails(product);

        product_obj.id = productId;
        product_obj.thumb_url = thumb_url;
        product_obj.collection_name = collection_name;
        for (const key in details) {
            let _details = details[key];
            product_obj[key] = _details;
        }
        console.log(productId);
        globals.master_products[productId] = product_obj;
    });
    console.log(globals.master_products);
    GM_setValue("master_products", JSON.stringify(globals.master_products));
}

console.log("Scrapper Running"); 
getProducts();
