/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Page_All_TitleInputs */

const en_page_all_title = /** @type {(inputs: Page_All_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`All Blueprints`)
};

/**
* | output |
* | --- |
* | "All Blueprints" |
*
* @param {Page_All_TitleInputs} inputs
* @param {{ locale?: "en" }} options
* @returns {LocalizedString}
*/
export const page_all_title = /** @type {((inputs?: Page_All_TitleInputs, options?: { locale?: "en" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Page_All_TitleInputs, { locale?: "en" }, {}>} */ ((inputs = {}, options = {}) => {
	experimentalStaticLocale ?? options.locale ?? getLocale()
	return en_page_all_title(inputs)
});