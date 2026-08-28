const cheerio = require("cheerio");

function parseCataloguePage(html, pageUrl) {
    const $ = cheerio.load(html);

    const bookUrls = [];

    $("article.product_pod h3 a").each((index, element) => {
        const href = $(element).attr("href");

        if (!href) {
            return;
        }

        const absoluteUrl = new URL(href, pageUrl).href;

        bookUrls.push(absoluteUrl);
    });

    const nextHref = $(".pager .next a").attr("href");

    const nextUrl = nextHref
        ? new URL(nextHref, pageUrl).href
        : null;

    return {
        bookUrls,
        nextUrl
    };
}

module.exports = {
    parseCataloguePage
};