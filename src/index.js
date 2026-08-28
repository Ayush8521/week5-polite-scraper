const { fetchAndCache } = require("./fetcher");

const CATALOGUE_URL =
    "https://books.toscrape.com/catalogue/page-1.html";

async function main() {
    try {
        await fetchAndCache(
            CATALOGUE_URL,
            "catalogue-page-1.html"
        );
    } catch (error) {
        console.error("ERROR:", error.message);
        process.exit(1);
    }
}

main();