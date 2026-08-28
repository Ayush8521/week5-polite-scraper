const { fetchAndCache } = require("./fetcher");
const { parseCataloguePage } = require("./parser");
const { extractBook } = require("./scraper");

const START_URL =
    "https://books.toscrape.com/catalogue/page-1.html";

async function main() {
    try {

        // ==========================================
        // STEP 1: Discover books
        // ==========================================

        let currentUrl = START_URL;

        const cataloguePages = [];

        // Map:
        // book URL → catalogue page where it was discovered
        const allBookUrls = new Map();

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

                if (!allBookUrls.has(bookUrl)) {
                    allBookUrls.set(
                        bookUrl,
                        currentUrl
                    );
                }
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
            `discovered=${allBookUrls.size}`
        );

        console.log(
            `unique_urls=${allBookUrls.size}`
        );


        // ==========================================
        // STEP 2: Extract book details
        // ==========================================

        const records = [];

        let bookNumber = 1;

        for (const [bookUrl, sourcePage] of allBookUrls) {

            console.log(
                `\nProcessing book ${bookNumber}/60`
            );

            console.log(bookUrl);

            const cacheFileName =
                `book-${bookNumber}.html`;

            const result = await fetchAndCache(
                bookUrl,
                cacheFileName
            );

            const book = extractBook(
                result.html,
                bookUrl,
                sourcePage
            );

            records.push(book);

            bookNumber++;
        }


        // ==========================================
        // STEP 3: Check result
        // ==========================================

        console.log(
            "\n========== SAMPLE RECORD =========="
        );

        console.log(
            JSON.stringify(records[0], null, 2)
        );

        console.log(
            `\ndetail_pages=${records.length}`
        );

    } catch (error) {

        console.error(
            "ERROR:",
            error.message
        );

        process.exit(1);
    }
}

main();