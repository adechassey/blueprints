/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Confirm_Role_ChangeInputs */

const en_admin_confirm_role_change = /** @type {(inputs: Admin_Confirm_Role_ChangeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Are you sure you want to change this user's role?`)
};

/**
* | output |
* | --- |
* | "Are you sure you want to change this user's role?" |
*
* @param {Admin_Confirm_Role_ChangeInputs} inputs
* @param {{ locale?: "en" }} options
* @returns {LocalizedString}
*/
export const admin_confirm_role_change = /** @type {((inputs?: Admin_Confirm_Role_ChangeInputs, options?: { locale?: "en" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Confirm_Role_ChangeInputs, { locale?: "en" }, {}>} */ ((inputs = {}, options = {}) => {
	experimentalStaticLocale ?? options.locale ?? getLocale()
	return en_admin_confirm_role_change(inputs)
});