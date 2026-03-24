/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Matches_Status_PossibleInputs */

const en_matches_status_possible = /** @type {(inputs: Matches_Status_PossibleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Possible`)
};

/**
* | output |
* | --- |
* | "Possible" |
*
* @param {Matches_Status_PossibleInputs} inputs
* @param {{ locale?: "en" }} options
* @returns {LocalizedString}
*/
export const matches_status_possible = /** @type {((inputs?: Matches_Status_PossibleInputs, options?: { locale?: "en" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Matches_Status_PossibleInputs, { locale?: "en" }, {}>} */ ((inputs = {}, options = {}) => {
	experimentalStaticLocale ?? options.locale ?? getLocale()
	return en_matches_status_possible(inputs)
});