/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Compute_MatchesInputs */

const en_admin_compute_matches = /** @type {(inputs: Admin_Compute_MatchesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Compute All Matches`)
};

/**
* | output |
* | --- |
* | "Compute All Matches" |
*
* @param {Admin_Compute_MatchesInputs} inputs
* @param {{ locale?: "en" }} options
* @returns {LocalizedString}
*/
export const admin_compute_matches = /** @type {((inputs?: Admin_Compute_MatchesInputs, options?: { locale?: "en" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Compute_MatchesInputs, { locale?: "en" }, {}>} */ ((inputs = {}, options = {}) => {
	experimentalStaticLocale ?? options.locale ?? getLocale()
	return en_admin_compute_matches(inputs)
});