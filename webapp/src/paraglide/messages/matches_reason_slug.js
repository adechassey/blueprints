/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Matches_Reason_SlugInputs */

const en_matches_reason_slug = /** @type {(inputs: Matches_Reason_SlugInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Same name`)
};

/**
* | output |
* | --- |
* | "Same name" |
*
* @param {Matches_Reason_SlugInputs} inputs
* @param {{ locale?: "en" }} options
* @returns {LocalizedString}
*/
export const matches_reason_slug = /** @type {((inputs?: Matches_Reason_SlugInputs, options?: { locale?: "en" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Matches_Reason_SlugInputs, { locale?: "en" }, {}>} */ ((inputs = {}, options = {}) => {
	experimentalStaticLocale ?? options.locale ?? getLocale()
	return en_matches_reason_slug(inputs)
});