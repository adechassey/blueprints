/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Comments_TitleInputs */

const en_comments_title = /** @type {(inputs: Comments_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Comments`)
};

/**
* | output |
* | --- |
* | "Comments" |
*
* @param {Comments_TitleInputs} inputs
* @param {{ locale?: "en" }} options
* @returns {LocalizedString}
*/
export const comments_title = /** @type {((inputs?: Comments_TitleInputs, options?: { locale?: "en" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Comments_TitleInputs, { locale?: "en" }, {}>} */ ((inputs = {}, options = {}) => {
	experimentalStaticLocale ?? options.locale ?? getLocale()
	return en_comments_title(inputs)
});