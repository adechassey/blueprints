/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Matches_TitleInputs */

const en_matches_title = /** @type {(inputs: Matches_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Related Blueprints`)
};

/**
* | output |
* | --- |
* | "Related Blueprints" |
*
* @param {Matches_TitleInputs} inputs
* @param {{ locale?: "en" }} options
* @returns {LocalizedString}
*/
export const matches_title = /** @type {((inputs?: Matches_TitleInputs, options?: { locale?: "en" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Matches_TitleInputs, { locale?: "en" }, {}>} */ ((inputs = {}, options = {}) => {
	experimentalStaticLocale ?? options.locale ?? getLocale()
	return en_matches_title(inputs)
});