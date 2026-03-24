/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Confirm_Delete_CommentInputs */

const en_admin_confirm_delete_comment = /** @type {(inputs: Admin_Confirm_Delete_CommentInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Are you sure you want to delete this comment?`)
};

/**
* | output |
* | --- |
* | "Are you sure you want to delete this comment?" |
*
* @param {Admin_Confirm_Delete_CommentInputs} inputs
* @param {{ locale?: "en" }} options
* @returns {LocalizedString}
*/
export const admin_confirm_delete_comment = /** @type {((inputs?: Admin_Confirm_Delete_CommentInputs, options?: { locale?: "en" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Confirm_Delete_CommentInputs, { locale?: "en" }, {}>} */ ((inputs = {}, options = {}) => {
	experimentalStaticLocale ?? options.locale ?? getLocale()
	return en_admin_confirm_delete_comment(inputs)
});