const fs = require("fs");
const path = require("path");

const { fetchAndCache } = require("./fetcher");
const { parseCataloguePage } = require("./parser");

const START_URL =
    "https://books.toscrape.com/catalogue/page-1.html";

async function main() {
    try {
        let currentUrl = START_URL;

        const cataloguePages = [];
        const allBookUrls = new Set();

        for (let pageNumber = 1; pageNumber <= 3; pageNumber++) {
            const cacheFileName =
                `catalogue-page-${pageNumber}.html`;

            const result = await fetchAndCache(
                currentUrl,
                cacheFileName
            );

            const parsed = parseCataloguePage(
                result.html,
                currentUrl
            );

            cataloguePages.push(currentUrl);

            for (const bookUrl of parsed.bookUrls) {
                allBookUrls.add(bookUrl);
            }

            console.log(
                `Page ${pageNumber}: ${parsed.bookUrls.length} books`
            );

            currentUrl = parsed.nextUrl;

            if (!currentUrl) {
                break;
            }
        }

        console.log(
            `catalogue_pages=${cataloguePages.length}`
        );

        console.log(
            `discovered=${[...allBookUrls].length}`
        );

        console.log(
            `unique_urls=${allBookUrls.size}`
        );

    } catch (error) {
        console.error("ERROR:", error.message);
        process.exit(1);
    }
}

main();