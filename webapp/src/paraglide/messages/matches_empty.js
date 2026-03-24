/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Matches_EmptyInputs */

const en_matches_empty = /** @type {(inputs: Matches_EmptyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`No related blueprints found`)
};

/**
* | output |
* | --- |
* | "No related blueprints found" |
*
* @param {Matches_EmptyInputs} inputs
* @param {{ locale?: "en" }} options
* @returns {LocalizedString}
*/
export const matches_empty = /** @type {((inputs?: Matches_EmptyInputs, options?: { locale?: "en" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Matches_EmptyInputs, { locale?: "en" }, {}>} */ ((inputs = {}, options = {}) => {
	experimentalStaticLocale ?? options.locale ?? getLocale()
	return en_matches_empty(inputs)
});