const fs = require("fs");
const path = require("path");

const CACHE_DIR = path.join(__dirname, "..", "cache");

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchAndCache(url, cacheFileName) {

    const cachePath = path.join(
        CACHE_DIR,
        cacheFileName
    );


    // ==========================================
    // CACHE HIT
    // ==========================================

    if (fs.existsSync(cachePath)) {

        const html = fs.readFileSync(
            cachePath,
            "utf-8"
        );

        console.log(`CACHE HIT: ${url}`);

        return {
            html,
            fromCache: true,
            status: 200
        };
    }


    // ==========================================
    // FETCH WITH ONE RETRY
    // ==========================================

    let attempt = 1;

    while (attempt <= 2) {

        try {

            console.log(
                `FETCH: ${url} (attempt ${attempt})`
            );


            const response = await fetch(url, {

                headers: {
                    "User-Agent":
                        "FlyRankInternship-A9/1.0 (+https://github.com/Ayush8521/week5-polite-scraper)"
                },

                signal: AbortSignal.timeout(5000)
            });


            // ==========================================
            // SUCCESS
            // ==========================================

            if (response.status === 200) {

                const html = await response.text();


                fs.mkdirSync(
                    CACHE_DIR,
                    {
                        recursive: true
                    }
                );


                fs.writeFileSync(
                    cachePath,
                    html
                );


                console.log(
                    `Fetched ${Buffer.byteLength(html)} bytes`
                );


                // Polite delay after successful network request
                await sleep(500);


                return {
                    html,
                    fromCache: false,
                    status: response.status
                };
            }


            // ==========================================
            // 403 / 404
            // DO NOT RETRY
            // ==========================================

            if (
                response.status === 403 ||
                response.status === 404
            ) {

                throw new Error(
                    `Fetch failed: ${url} - HTTP ${response.status}`
                );
            }


            // ==========================================
            // 5xx SERVER ERROR
            // RETRY ONCE
            // ==========================================

            if (
                response.status >= 500 &&
                response.status <= 599
            ) {

                if (attempt === 1) {

                    console.log(
                        `Server error ${response.status}. Retrying once...`
                    );

                    await sleep(1000);

                    attempt++;

                    continue;
                }

                throw new Error(
                    `Fetch failed after retry: ${url} - HTTP ${response.status}`
                );
            }


            // ==========================================
            // OTHER HTTP ERRORS
            // NO RETRY
            // ==========================================

            throw new Error(
                `Fetch failed: ${url} - HTTP ${response.status}`
            );

        } catch (error) {


            // ==========================================
            // TIMEOUT / NETWORK ERROR
            // RETRY ONCE
            // ==========================================

            const isTimeout =
                error.name === "TimeoutError" ||
                error.name === "AbortError";


            if (isTimeout) {

                if (attempt === 1) {

                    console.log(
                        `Request timed out. Retrying once...`
                    );

                    await sleep(1000);

                    attempt++;

                    continue;
                }

                throw new Error(
                    `Fetch failed after retry: ${url} - timeout`
                );
            }


            // ==========================================
            // OTHER ERRORS
            // ==========================================

            throw error;
        }
    }


    throw new Error(
        `Fetch failed: ${url}`
    );
}


module.exports = {
    fetchAndCache
};