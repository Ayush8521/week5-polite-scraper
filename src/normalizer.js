function normalizeBook(raw) {
    // Convert price from "£51.77" → 51.77
    const price_gbp = raw.price_text
        ? parseFloat(raw.price_text.replace("£", "").trim())
        : null;

    // Convert rating word → number
    const ratingMap = {
        One: 1,
        Two: 2,
        Three: 3,
        Four: 4,
        Five: 5
    };

    const rating = raw.rating_text
        ? ratingMap[raw.rating_text] || null
        : null;

    // Convert availability text
    const availability = raw.availability_text
        ? raw.availability_text
            .replace(/\s+/g, " ")
            .trim()
        : null;

    // Clean description
    let description = raw.description;

    if (description) {
        description = description
            .replace(/\.\.\.more$/, "")
            .trim();
    }

    return {
        title: raw.title,
        product_url: raw.product_url,
        price_gbp,
        availability,
        rating,
        description,
        source_page: raw.source_page,
        fetched_at: raw.fetched_at
    };
}

module.exports = {
    normalizeBook
};