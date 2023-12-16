// ==UserScript==
// @name         Show Transshipment Code
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Display transship site next to "TRANSSHIPMENT"
// @author       nuneadon
// @match        https://fcresearch-na.aka.amazon.com/HDC3/results?s=*
// @grant        GM_xmlhttpRequest
// ==/UserScript==

(function () {
    'use strict';
    async function extractText() {
        const tbodyElement = document.querySelector("#table-inventory > tbody");
        if (!tbodyElement) {
            console.error('Tbody element not found.');
            return;
        }
        const numberOfRows = tbodyElement.querySelectorAll('tr').length;
        for (let i = 1; i <= numberOfRows; i++) {
            const sourceElement = i !== 1
                ? document.querySelector(`#table-inventory > tbody > tr:nth-child(${i}) > td.sorting_1 > a`)
                : document.querySelector("#table-inventory > tbody > tr > td.sorting_1 > a");

            const transhipElement = i !== 1
                ? document.querySelector(`#table-inventory > tbody > tr:nth-child(${i}) > td:nth-child(8)`)
                : document.querySelector("#table-inventory > tbody > tr > td:nth-child(8)");

            if (sourceElement) {
                const searchText = sourceElement.textContent.trim();
                const site = await searchOnOtherSite(searchText);
                transhipElement.innerHTML += ` (${site})`;
            } else {
                console.error('container (csX/paX) element not found.');
            }
        }
    }
    function searchOnOtherSite(searchText) {
        return new Promise((resolve, reject) => {
            GM_xmlhttpRequest({
                method: 'GET',
                url: `https://rodeo-iad.amazon.com/HDC3/Search?_enabledColumns=on&enabledColumns=OUTER_SCANNABLE_ID&enabledColumns=OUTER_OUTER_SCANNABLE_ID&enabledColumns=OUTER_OUTER_CONTAINER_LABEL&enabledColumns=STACKING_FILTER&enabledColumns=SSP_STATE&searchKey=${encodeURIComponent(searchText)}`,
                onload: function (response) {
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(response.responseText, 'text/html');
                    const targetElement = doc.querySelector('#content-panel-padding > table > tbody > tr > td:nth-child(3) > div');

                    if (targetElement) {
                        const innerHTML = targetElement.innerHTML.trim();
                        resolve(innerHTML);
                    } else {
                        reject('Destination element not found in the response.');
                    }
                },
                onerror: function (error) {
                    reject(`GM_xmlhttpRequest error: ${error}`);
                }
            });
        });
    }
    setTimeout(extractText, 1000);
})();
