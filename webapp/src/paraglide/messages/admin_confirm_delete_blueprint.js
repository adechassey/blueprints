/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ name: NonNullable<unknown> }} Admin_Confirm_Delete_BlueprintInputs */

const en_admin_confirm_delete_blueprint = /** @type {(inputs: Admin_Confirm_Delete_BlueprintInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Are you sure you want to delete "${i?.name}"?`)
};

/**
* | output |
* | --- |
* | "Are you sure you want to delete \"{name}\"?" |
*
* @param {Admin_Confirm_Delete_BlueprintInputs} inputs
* @param {{ locale?: "en" }} options
* @returns {LocalizedString}
*/
export const admin_confirm_delete_blueprint = /** @type {((inputs: Admin_Confirm_Delete_BlueprintInputs, options?: { locale?: "en" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Confirm_Delete_BlueprintInputs, { locale?: "en" }, {}>} */ ((inputs, options = {}) => {
	experimentalStaticLocale ?? options.locale ?? getLocale()
	return en_admin_confirm_delete_blueprint(inputs)
});