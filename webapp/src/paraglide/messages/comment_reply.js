/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Comment_ReplyInputs */

const en_comment_reply = /** @type {(inputs: Comment_ReplyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Reply`)
};

/**
* | output |
* | --- |
* | "Reply" |
*
* @param {Comment_ReplyInputs} inputs
* @param {{ locale?: "en" }} options
* @returns {LocalizedString}
*/
export const comment_reply = /** @type {((inputs?: Comment_ReplyInputs, options?: { locale?: "en" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Comment_ReplyInputs, { locale?: "en" }, {}>} */ ((inputs = {}, options = {}) => {
	experimentalStaticLocale ?? options.locale ?? getLocale()
	return en_comment_reply(inputs)
});