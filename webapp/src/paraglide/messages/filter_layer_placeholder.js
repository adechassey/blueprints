/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Filter_Layer_PlaceholderInputs */

const en_filter_layer_placeholder = /** @type {(inputs: Filter_Layer_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Filter by layer`)
};

/**
* | output |
* | --- |
* | "Filter by layer" |
*
* @param {Filter_Layer_PlaceholderInputs} inputs
* @param {{ locale?: "en" }} options
* @returns {LocalizedString}
*/
export const filter_layer_placeholder = /** @type {((inputs?: Filter_Layer_PlaceholderInputs, options?: { locale?: "en" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Filter_Layer_PlaceholderInputs, { locale?: "en" }, {}>} */ ((inputs = {}, options = {}) => {
	experimentalStaticLocale ?? options.locale ?? getLocale()
	return en_filter_layer_placeholder(inputs)
});