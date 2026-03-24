/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Filter_Tag_PlaceholderInputs */

const en_filter_tag_placeholder = /** @type {(inputs: Filter_Tag_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Filter by tag`)
};

/**
* | output |
* | --- |
* | "Filter by tag" |
*
* @param {Filter_Tag_PlaceholderInputs} inputs
* @param {{ locale?: "en" }} options
* @returns {LocalizedString}
*/
export const filter_tag_placeholder = /** @type {((inputs?: Filter_Tag_PlaceholderInputs, options?: { locale?: "en" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Filter_Tag_PlaceholderInputs, { locale?: "en" }, {}>} */ ((inputs = {}, options = {}) => {
	experimentalStaticLocale ?? options.locale ?? getLocale()
	return en_filter_tag_placeholder(inputs)
});