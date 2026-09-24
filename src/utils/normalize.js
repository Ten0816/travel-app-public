function normalizeString(value) {
    if (typeof value !== "string") {
        return null;
    }

    const trimmed = value.trim();

    return trimmed === ""
        ? null
        : trimmed;
}

module.exports = {
    normalizeString
};