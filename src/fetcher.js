const fs = require("fs");
const path = require("path");

const CACHE_DIR = path.join(__dirname, "..", "cache");

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchAndCache(url, cacheFileName) {
    const cachePath = path.join(CACHE_DIR, cacheFileName);

    if (fs.existsSync(cachePath)) {
        const html = fs.readFileSync(cachePath, "utf-8");

        console.log(`CACHE HIT: ${url}`);

        return {
            html,
            fromCache: true,
            status: 200
        };
    }

    console.log(`FETCH: ${url}`);

    const response = await fetch(url, {
        headers: {
            "User-Agent":
                "FlyRankInternship-A9/1.0 (+https://github.com/Ayush8521/week5-polite-scraper)"
        },
        signal: AbortSignal.timeout(5000)
    });

    if (response.status !== 200) {
        throw new Error(
            `Fetch failed: ${url} - HTTP ${response.status}`
        );
    }

    const html = await response.text();

    fs.mkdirSync(CACHE_DIR, { recursive: true });

    fs.writeFileSync(cachePath, html);

    console.log(
        `Fetched ${Buffer.byteLength(html)} bytes`
    );

    await sleep(500);

    return {
        html,
        fromCache: false,
        status: response.status
    };
}

module.exports = {
    fetchAndCache
};