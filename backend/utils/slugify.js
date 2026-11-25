/**
 * Generate a URL-safe slug from any string.
 * "Golden Retriever, Coimbatore!" → "golden-retriever-coimbatore"
 */
function slugify(text) {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')   // remove non-word chars except hyphens
        .replace(/[\s_]+/g, '-')    // spaces/underscores → hyphen
        .replace(/-+/g, '-')         // collapse multiple hyphens
        .replace(/^-|-$/g, '');      // trim leading/trailing hyphens
}

module.exports = slugify;
