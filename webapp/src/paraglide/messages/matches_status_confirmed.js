/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Matches_Status_ConfirmedInputs */

const en_matches_status_confirmed = /** @type {(inputs: Matches_Status_ConfirmedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Confirmed`)
};

/**
* | output |
* | --- |
* | "Confirmed" |
*
* @param {Matches_Status_ConfirmedInputs} inputs
* @param {{ locale?: "en" }} options
* @returns {LocalizedString}
*/
export const matches_status_confirmed = /** @type {((inputs?: Matches_Status_ConfirmedInputs, options?: { locale?: "en" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Matches_Status_ConfirmedInputs, { locale?: "en" }, {}>} */ ((inputs = {}, options = {}) => {
	experimentalStaticLocale ?? options.locale ?? getLocale()
	return en_matches_status_confirmed(inputs)
});