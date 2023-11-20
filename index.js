// ==UserScript==
// @name         PriceScraper
// @namespace    https://github.com/Webdevdynamo/
// @downloadURL  https://raw.githubusercontent.com/Webdevdynamo/PricingScraperUserScript/main/index.js
// @updateURL      https://raw.githubusercontent.com/Webdevdynamo/PricingScraperUserScript/main/index.js
// @version      0.0.2
// @description  PriceScraper
// @author       Webdevdynamo
// @match      https://www.hotelsigns.com/*
// @match      https://hotelsigns.com/*
// @require       http://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js
// @require      https://raw.githubusercontent.com/Webdevdynamo/PricingScraperUserScript/main/index.js
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

const date = new Date();

let currentUrl = window.location.pathname.split("/");
currentUrl = "https://www.hotelsigns.com/" + currentUrl[1] + "/";
//GM_setValue("master_products",null);

if(jQuery(".searchResultsControls").length === 0) {
    console.log("Scrapper Disabled");
    return false;
}

let master_products = GM_getValue("master_products");

if(typeof master_products == "undefined"){
    globals.master_products = {};
}else{
    globals.master_products = JSON.parse(master_products);
}


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
    product_details.page_link = currentUrl + details.attr("href");

    return product_details;
}

function convertToCSV(products) {
    let objArray = [];
    let columns = [];
    let j = 0;
    let str = '';

    for (const key in products) {
        let product = products[key];
        if(j==0){
            for (const key2 in product) {
                columns.push(key2);
            }
        }
        j = j + 1;
        objArray.push(product);
    }
    console.log("Product Count: "+objArray.length);
    var array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;

    var line = '';
    for (var i = 0; i < columns.length; i++) {
        if (line != '') line += ','

        line += columns[i];
    }
    str += line + '\r\n';

    for (var i = 0; i < array.length; i++) {
        var line = '';
        for (var index in array[i]) {
            if (line != '') line += ','

            line += array[i][index];
        }

        str += line + '\r\n';
    }
    return str;
}

function exportCSVFile(products, fileTitle, download) {
    var csv = convertToCSV(products);
    if(download == true){
        var exportedFilenmae = fileTitle + '.csv' || 'export.csv';

        var blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        if (navigator.msSaveBlob) { // IE 10+
            navigator.msSaveBlob(blob, exportedFilenmae);
        } else {
            var link = document.createElement("a");
            if (link.download !== undefined) { // feature detection
                // Browsers that support HTML5 download attribute
                var url = URL.createObjectURL(blob);
                link.setAttribute("href", url);
                link.setAttribute("download", exportedFilenmae);
                link.style.visibility = 'hidden';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        }
    }
}

function getDate(){

    let day = date.getDate();
    let month = date.getMonth() + 1;
    let year = date.getFullYear();

    // This arrangement can be altered based on how we want the date's format to appear.
    let currentDate = `${year}-${month}-${day}`;
    return currentDate;
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
        product_obj.collection_name = collection_name;
        for (const key in details) {
            let _details = details[key];
            product_obj[key] = _details;
        }
        product_obj.thumb_url = thumb_url;
        product_obj.last_updated = getDate();
        console.log(product_obj);
        globals.master_products[productId] = product_obj;
    });
    exportCSVFile(globals.master_products, "SIGNS", false);
    GM_setValue("master_products", JSON.stringify(globals.master_products));
}

function downloadCSV(){
    exportCSVFile(globals.master_products, "SIGNS", true);
}
function clearSigns(){
    globals.master_products = {};
    GM_setValue("master_products", JSON.stringify(globals.master_products));
}

console.log("Scrapper Running"); 
clearSigns();
getProducts();
console.log(globals.master_products);
