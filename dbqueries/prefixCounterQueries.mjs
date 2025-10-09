import PrefixCounter from '../models/prefixCounterModel.mjs';
/**
 * @description Atomically finds a counter by its prefix and increments it.
 * If the counter does not exist, it creates it with a count of 1.
 * @param {string} prefix - The job code prefix (e.g., 'sse').
 * @returns {Promise<Document>} The updated counter document.
 */
const findAndIncrement = async (prefix) => {
    return PrefixCounter.findOneAndUpdate(
        { prefix },
        { $inc: { count: 1 } },
        { new: true, upsert: true }
    );
};

export const prefixCounterQueries = {
    findAndIncrement,
};