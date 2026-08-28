const { fetchAndCache } = require("./fetcher");
const { parseCataloguePage } = require("./parser");
const { extractBook } = require("./scraper");
const { normalizeBook } = require("./normalizer");
const { bookSchema } = require("./schema");

const fs = require("fs");
const path = require("path");

const START_URL =
    "https://books.toscrape.com/catalogue/page-1.html";


async function main() {

    try {

        // ==========================================
        // STEP 1: Discover books from 3 catalogue pages
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


        // ==========================================
        // Discovery Results
        // ==========================================

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
        // STEP 3: Raw extraction completed
        // ==========================================

        console.log(
            `\ndetail_pages=${records.length}`
        );


        // ==========================================
        // STEP 4: Normalize and validate
        // ==========================================

        const validBooks = [];

        const errors = [];


        for (let i = 0; i < records.length; i++) {

            const rawBook = records[i];


            // Normalize raw scraped data
            const normalizedBook =
                normalizeBook(rawBook);


            // Validate normalized data using Zod
            const result =
                bookSchema.safeParse(normalizedBook);


            if (result.success) {

                // Valid record
                validBooks.push(result.data);

            } else {

                // Invalid record
                errors.push({
                    product_url: rawBook.product_url,
                    errors: result.error.issues
                });
            }
        }


        // ==========================================
        // STEP 5: Save JSON files
        // ==========================================

        const dataDir =
            path.join(__dirname, "..", "data");


        // Create data directory if it doesn't exist
        if (!fs.existsSync(dataDir)) {

            fs.mkdirSync(
                dataDir,
                {
                    recursive: true
                }
            );
        }


        // Save valid books
        fs.writeFileSync(

            path.join(
                dataDir,
                "books.json"
            ),

            JSON.stringify(
                validBooks,
                null,
                2
            )
        );


        // Save validation errors
        fs.writeFileSync(

            path.join(
                dataDir,
                "errors.json"
            ),

            JSON.stringify(
                errors,
                null,
                2
            )
        );


        console.log(
            `valid_records=${validBooks.length}`
        );

        console.log(
            `error_records=${errors.length}`
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