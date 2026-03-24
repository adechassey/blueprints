/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Filter_All_StacksInputs */

const en_filter_all_stacks = /** @type {(inputs: Filter_All_StacksInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`All stacks`)
};

/**
* | output |
* | --- |
* | "All stacks" |
*
* @param {Filter_All_StacksInputs} inputs
* @param {{ locale?: "en" }} options
* @returns {LocalizedString}
*/
export const filter_all_stacks = /** @type {((inputs?: Filter_All_StacksInputs, options?: { locale?: "en" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Filter_All_StacksInputs, { locale?: "en" }, {}>} */ ((inputs = {}, options = {}) => {
	experimentalStaticLocale ?? options.locale ?? getLocale()
	return en_filter_all_stacks(inputs)
});