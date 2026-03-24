/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Stat_CommentsInputs */

const en_admin_stat_comments = /** @type {(inputs: Admin_Stat_CommentsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Comments`)
};

/**
* | output |
* | --- |
* | "Comments" |
*
* @param {Admin_Stat_CommentsInputs} inputs
* @param {{ locale?: "en" }} options
* @returns {LocalizedString}
*/
export const admin_stat_comments = /** @type {((inputs?: Admin_Stat_CommentsInputs, options?: { locale?: "en" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Stat_CommentsInputs, { locale?: "en" }, {}>} */ ((inputs = {}, options = {}) => {
	experimentalStaticLocale ?? options.locale ?? getLocale()
	return en_admin_stat_comments(inputs)
});