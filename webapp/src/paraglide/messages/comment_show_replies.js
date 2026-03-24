/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ count: NonNullable<unknown> }} Comment_Show_RepliesInputs */

const en_comment_show_replies = /** @type {(inputs: Comment_Show_RepliesInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Show ${i?.count} replies`)
};

/**
* | output |
* | --- |
* | "Show {count} replies" |
*
* @param {Comment_Show_RepliesInputs} inputs
* @param {{ locale?: "en" }} options
* @returns {LocalizedString}
*/
export const comment_show_replies = /** @type {((inputs: Comment_Show_RepliesInputs, options?: { locale?: "en" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Comment_Show_RepliesInputs, { locale?: "en" }, {}>} */ ((inputs, options = {}) => {
	experimentalStaticLocale ?? options.locale ?? getLocale()
	return en_comment_show_replies(inputs)
});