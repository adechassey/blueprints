/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Empty_StateInputs */

const en_empty_state = /** @type {(inputs: Empty_StateInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`No results found`)
};

/**
* | output |
* | --- |
* | "No results found" |
*
* @param {Empty_StateInputs} inputs
* @param {{ locale?: "en" }} options
* @returns {LocalizedString}
*/
export const empty_state = /** @type {((inputs?: Empty_StateInputs, options?: { locale?: "en" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Empty_StateInputs, { locale?: "en" }, {}>} */ ((inputs = {}, options = {}) => {
	experimentalStaticLocale ?? options.locale ?? getLocale()
	return en_empty_state(inputs)
});