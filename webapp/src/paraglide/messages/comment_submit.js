/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Comment_SubmitInputs */

const en_comment_submit = /** @type {(inputs: Comment_SubmitInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Post`)
};

/**
* | output |
* | --- |
* | "Post" |
*
* @param {Comment_SubmitInputs} inputs
* @param {{ locale?: "en" }} options
* @returns {LocalizedString}
*/
export const comment_submit = /** @type {((inputs?: Comment_SubmitInputs, options?: { locale?: "en" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Comment_SubmitInputs, { locale?: "en" }, {}>} */ ((inputs = {}, options = {}) => {
	experimentalStaticLocale ?? options.locale ?? getLocale()
	return en_comment_submit(inputs)
});