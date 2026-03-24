/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Comment_Reply_PlaceholderInputs */

const en_comment_reply_placeholder = /** @type {(inputs: Comment_Reply_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Write a reply...`)
};

/**
* | output |
* | --- |
* | "Write a reply..." |
*
* @param {Comment_Reply_PlaceholderInputs} inputs
* @param {{ locale?: "en" }} options
* @returns {LocalizedString}
*/
export const comment_reply_placeholder = /** @type {((inputs?: Comment_Reply_PlaceholderInputs, options?: { locale?: "en" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Comment_Reply_PlaceholderInputs, { locale?: "en" }, {}>} */ ((inputs = {}, options = {}) => {
	experimentalStaticLocale ?? options.locale ?? getLocale()
	return en_comment_reply_placeholder(inputs)
});