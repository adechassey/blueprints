/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Manage_BlueprintsInputs */

const en_admin_manage_blueprints = /** @type {(inputs: Admin_Manage_BlueprintsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Manage Blueprints`)
};

/**
* | output |
* | --- |
* | "Manage Blueprints" |
*
* @param {Admin_Manage_BlueprintsInputs} inputs
* @param {{ locale?: "en" }} options
* @returns {LocalizedString}
*/
export const admin_manage_blueprints = /** @type {((inputs?: Admin_Manage_BlueprintsInputs, options?: { locale?: "en" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Manage_BlueprintsInputs, { locale?: "en" }, {}>} */ ((inputs = {}, options = {}) => {
	experimentalStaticLocale ?? options.locale ?? getLocale()
	return en_admin_manage_blueprints(inputs)
});