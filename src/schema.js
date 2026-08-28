const { z } = require("zod");

const bookSchema = z.object({
    title: z.string().min(1),

    product_url: z.string().url(),

    price_gbp: z.number().nonnegative(),

    availability: z.string().min(1),

    rating: z.number().int().min(1).max(5),

    description: z.string().nullable(),

    source_page: z.string().url(),

    fetched_at: z.string().datetime()
});

module.exports = {
    bookSchema
};