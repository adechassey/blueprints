/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Comment_AnonymousInputs */

const en_comment_anonymous = /** @type {(inputs: Comment_AnonymousInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Anonymous`)
};

/**
* | output |
* | --- |
* | "Anonymous" |
*
* @param {Comment_AnonymousInputs} inputs
* @param {{ locale?: "en" }} options
* @returns {LocalizedString}
*/
export const comment_anonymous = /** @type {((inputs?: Comment_AnonymousInputs, options?: { locale?: "en" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Comment_AnonymousInputs, { locale?: "en" }, {}>} */ ((inputs = {}, options = {}) => {
	experimentalStaticLocale ?? options.locale ?? getLocale()
	return en_comment_anonymous(inputs)
});