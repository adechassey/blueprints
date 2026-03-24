/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ name: NonNullable<unknown> }} Admin_Confirm_Delete_ProjectInputs */

const en_admin_confirm_delete_project = /** @type {(inputs: Admin_Confirm_Delete_ProjectInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Are you sure you want to delete project "${i?.name}"?`)
};

/**
* | output |
* | --- |
* | "Are you sure you want to delete project \"{name}\"?" |
*
* @param {Admin_Confirm_Delete_ProjectInputs} inputs
* @param {{ locale?: "en" }} options
* @returns {LocalizedString}
*/
export const admin_confirm_delete_project = /** @type {((inputs: Admin_Confirm_Delete_ProjectInputs, options?: { locale?: "en" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Confirm_Delete_ProjectInputs, { locale?: "en" }, {}>} */ ((inputs, options = {}) => {
	experimentalStaticLocale ?? options.locale ?? getLocale()
	return en_admin_confirm_delete_project(inputs)
});