/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Manage_UsersInputs */

const en_admin_manage_users = /** @type {(inputs: Admin_Manage_UsersInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Manage Users`)
};

/**
* | output |
* | --- |
* | "Manage Users" |
*
* @param {Admin_Manage_UsersInputs} inputs
* @param {{ locale?: "en" }} options
* @returns {LocalizedString}
*/
export const admin_manage_users = /** @type {((inputs?: Admin_Manage_UsersInputs, options?: { locale?: "en" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Manage_UsersInputs, { locale?: "en" }, {}>} */ ((inputs = {}, options = {}) => {
	experimentalStaticLocale ?? options.locale ?? getLocale()
	return en_admin_manage_users(inputs)
});