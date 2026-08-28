const cheerio = require("cheerio");

function extractBook(html, productUrl, sourcePage) {
    const $ = cheerio.load(html);

    const title = $("div.product_main h1")
        .first()
        .text()
        .trim();

    const priceText = $("div.product_main .price_color")
        .first()
        .text()
        .trim();

    const availabilityText = $("div.product_main .availability")
        .first()
        .text()
        .replace(/\s+/g, " ")
        .trim();

    const ratingText =
        $("div.product_main .star-rating")
            .attr("class")
            ?.replace("star-rating", "")
            .trim() || null;

    const descriptionElement =
        $("#product_description")
            .next("p");

    const description =
        descriptionElement.length > 0
            ? descriptionElement.text().trim()
            : null;

    return {
        title,
        product_url: productUrl,
        price_text: priceText,
        availability_text: availabilityText,
        rating_text: ratingText,
        description,
        source_page: sourcePage,
        fetched_at: new Date().toISOString()
    };
}

module.exports = {
    extractBook
};