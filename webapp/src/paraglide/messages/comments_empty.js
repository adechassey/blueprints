/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Comments_EmptyInputs */

const en_comments_empty = /** @type {(inputs: Comments_EmptyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`No comments yet. Be the first to comment!`)
};

/**
* | output |
* | --- |
* | "No comments yet. Be the first to comment!" |
*
* @param {Comments_EmptyInputs} inputs
* @param {{ locale?: "en" }} options
* @returns {LocalizedString}
*/
export const comments_empty = /** @type {((inputs?: Comments_EmptyInputs, options?: { locale?: "en" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Comments_EmptyInputs, { locale?: "en" }, {}>} */ ((inputs = {}, options = {}) => {
	experimentalStaticLocale ?? options.locale ?? getLocale()
	return en_comments_empty(inputs)
});