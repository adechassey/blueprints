/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Manage_ProjectsInputs */

const en_admin_manage_projects = /** @type {(inputs: Admin_Manage_ProjectsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Manage Projects`)
};

/**
* | output |
* | --- |
* | "Manage Projects" |
*
* @param {Admin_Manage_ProjectsInputs} inputs
* @param {{ locale?: "en" }} options
* @returns {LocalizedString}
*/
export const admin_manage_projects = /** @type {((inputs?: Admin_Manage_ProjectsInputs, options?: { locale?: "en" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Manage_ProjectsInputs, { locale?: "en" }, {}>} */ ((inputs = {}, options = {}) => {
	experimentalStaticLocale ?? options.locale ?? getLocale()
	return en_admin_manage_projects(inputs)
});