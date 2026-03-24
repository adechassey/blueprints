/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Matches_FindInputs */

const en_matches_find = /** @type {(inputs: Matches_FindInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Find Matches`)
};

/**
* | output |
* | --- |
* | "Find Matches" |
*
* @param {Matches_FindInputs} inputs
* @param {{ locale?: "en" }} options
* @returns {LocalizedString}
*/
export const matches_find = /** @type {((inputs?: Matches_FindInputs, options?: { locale?: "en" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Matches_FindInputs, { locale?: "en" }, {}>} */ ((inputs = {}, options = {}) => {
	experimentalStaticLocale ?? options.locale ?? getLocale()
	return en_matches_find(inputs)
});