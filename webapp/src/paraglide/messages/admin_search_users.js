/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Search_UsersInputs */

const en_admin_search_users = /** @type {(inputs: Admin_Search_UsersInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Search users by name or email...`)
};

/**
* | output |
* | --- |
* | "Search users by name or email..." |
*
* @param {Admin_Search_UsersInputs} inputs
* @param {{ locale?: "en" }} options
* @returns {LocalizedString}
*/
export const admin_search_users = /** @type {((inputs?: Admin_Search_UsersInputs, options?: { locale?: "en" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Search_UsersInputs, { locale?: "en" }, {}>} */ ((inputs = {}, options = {}) => {
	experimentalStaticLocale ?? options.locale ?? getLocale()
	return en_admin_search_users(inputs)
});