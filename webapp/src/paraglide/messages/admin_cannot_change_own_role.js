/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Cannot_Change_Own_RoleInputs */

const en_admin_cannot_change_own_role = /** @type {(inputs: Admin_Cannot_Change_Own_RoleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`You cannot change your own role`)
};

/**
* | output |
* | --- |
* | "You cannot change your own role" |
*
* @param {Admin_Cannot_Change_Own_RoleInputs} inputs
* @param {{ locale?: "en" }} options
* @returns {LocalizedString}
*/
export const admin_cannot_change_own_role = /** @type {((inputs?: Admin_Cannot_Change_Own_RoleInputs, options?: { locale?: "en" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Cannot_Change_Own_RoleInputs, { locale?: "en" }, {}>} */ ((inputs = {}, options = {}) => {
	experimentalStaticLocale ?? options.locale ?? getLocale()
	return en_admin_cannot_change_own_role(inputs)
});