/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ count: NonNullable<unknown> }} Comment_Hide_RepliesInputs */

const en_comment_hide_replies = /** @type {(inputs: Comment_Hide_RepliesInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Hide ${i?.count} replies`)
};

/**
* | output |
* | --- |
* | "Hide {count} replies" |
*
* @param {Comment_Hide_RepliesInputs} inputs
* @param {{ locale?: "en" }} options
* @returns {LocalizedString}
*/
export const comment_hide_replies = /** @type {((inputs: Comment_Hide_RepliesInputs, options?: { locale?: "en" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Comment_Hide_RepliesInputs, { locale?: "en" }, {}>} */ ((inputs, options = {}) => {
	experimentalStaticLocale ?? options.locale ?? getLocale()
	return en_comment_hide_replies(inputs)
});