/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Search_ClearInputs */

const en_search_clear = /** @type {(inputs: Search_ClearInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Clear search`)
};

/**
* | output |
* | --- |
* | "Clear search" |
*
* @param {Search_ClearInputs} inputs
* @param {{ locale?: "en" }} options
* @returns {LocalizedString}
*/
export const search_clear = /** @type {((inputs?: Search_ClearInputs, options?: { locale?: "en" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Search_ClearInputs, { locale?: "en" }, {}>} */ ((inputs = {}, options = {}) => {
	experimentalStaticLocale ?? options.locale ?? getLocale()
	return en_search_clear(inputs)
});