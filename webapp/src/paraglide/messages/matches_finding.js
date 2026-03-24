/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Matches_FindingInputs */

const en_matches_finding = /** @type {(inputs: Matches_FindingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Finding...`)
};

/**
* | output |
* | --- |
* | "Finding..." |
*
* @param {Matches_FindingInputs} inputs
* @param {{ locale?: "en" }} options
* @returns {LocalizedString}
*/
export const matches_finding = /** @type {((inputs?: Matches_FindingInputs, options?: { locale?: "en" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Matches_FindingInputs, { locale?: "en" }, {}>} */ ((inputs = {}, options = {}) => {
	experimentalStaticLocale ?? options.locale ?? getLocale()
	return en_matches_finding(inputs)
});