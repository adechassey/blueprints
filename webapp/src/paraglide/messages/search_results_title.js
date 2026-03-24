/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ query: NonNullable<unknown> }} Search_Results_TitleInputs */

const en_search_results_title = /** @type {(inputs: Search_Results_TitleInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Search results for "${i?.query}"`)
};

/**
* | output |
* | --- |
* | "Search results for \"{query}\"" |
*
* @param {Search_Results_TitleInputs} inputs
* @param {{ locale?: "en" }} options
* @returns {LocalizedString}
*/
export const search_results_title = /** @type {((inputs: Search_Results_TitleInputs, options?: { locale?: "en" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Search_Results_TitleInputs, { locale?: "en" }, {}>} */ ((inputs, options = {}) => {
	experimentalStaticLocale ?? options.locale ?? getLocale()
	return en_search_results_title(inputs)
});