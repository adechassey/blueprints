/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Tags_TitleInputs */

const en_tags_title = /** @type {(inputs: Tags_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Tags`)
};

/**
* | output |
* | --- |
* | "Tags" |
*
* @param {Tags_TitleInputs} inputs
* @param {{ locale?: "en" }} options
* @returns {LocalizedString}
*/
export const tags_title = /** @type {((inputs?: Tags_TitleInputs, options?: { locale?: "en" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Tags_TitleInputs, { locale?: "en" }, {}>} */ ((inputs = {}, options = {}) => {
	experimentalStaticLocale ?? options.locale ?? getLocale()
	return en_tags_title(inputs)
});