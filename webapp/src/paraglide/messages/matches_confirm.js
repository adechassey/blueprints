/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Matches_ConfirmInputs */

const en_matches_confirm = /** @type {(inputs: Matches_ConfirmInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Confirm`)
};

/**
* | output |
* | --- |
* | "Confirm" |
*
* @param {Matches_ConfirmInputs} inputs
* @param {{ locale?: "en" }} options
* @returns {LocalizedString}
*/
export const matches_confirm = /** @type {((inputs?: Matches_ConfirmInputs, options?: { locale?: "en" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Matches_ConfirmInputs, { locale?: "en" }, {}>} */ ((inputs = {}, options = {}) => {
	experimentalStaticLocale ?? options.locale ?? getLocale()
	return en_matches_confirm(inputs)
});