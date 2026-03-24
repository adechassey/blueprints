/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Matches_DismissInputs */

const en_matches_dismiss = /** @type {(inputs: Matches_DismissInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Dismiss`)
};

/**
* | output |
* | --- |
* | "Dismiss" |
*
* @param {Matches_DismissInputs} inputs
* @param {{ locale?: "en" }} options
* @returns {LocalizedString}
*/
export const matches_dismiss = /** @type {((inputs?: Matches_DismissInputs, options?: { locale?: "en" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Matches_DismissInputs, { locale?: "en" }, {}>} */ ((inputs = {}, options = {}) => {
	experimentalStaticLocale ?? options.locale ?? getLocale()
	return en_matches_dismiss(inputs)
});