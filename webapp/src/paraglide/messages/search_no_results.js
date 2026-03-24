/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ query: NonNullable<unknown> }} Search_No_ResultsInputs */

const en_search_no_results = /** @type {(inputs: Search_No_ResultsInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`No blueprints found for "${i?.query}"`)
};

/**
* | output |
* | --- |
* | "No blueprints found for \"{query}\"" |
*
* @param {Search_No_ResultsInputs} inputs
* @param {{ locale?: "en" }} options
* @returns {LocalizedString}
*/
export const search_no_results = /** @type {((inputs: Search_No_ResultsInputs, options?: { locale?: "en" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Search_No_ResultsInputs, { locale?: "en" }, {}>} */ ((inputs, options = {}) => {
	experimentalStaticLocale ?? options.locale ?? getLocale()
	return en_search_no_results(inputs)
});