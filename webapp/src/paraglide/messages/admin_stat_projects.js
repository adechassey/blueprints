/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Stat_ProjectsInputs */

const en_admin_stat_projects = /** @type {(inputs: Admin_Stat_ProjectsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Projects`)
};

/**
* | output |
* | --- |
* | "Projects" |
*
* @param {Admin_Stat_ProjectsInputs} inputs
* @param {{ locale?: "en" }} options
* @returns {LocalizedString}
*/
export const admin_stat_projects = /** @type {((inputs?: Admin_Stat_ProjectsInputs, options?: { locale?: "en" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Stat_ProjectsInputs, { locale?: "en" }, {}>} */ ((inputs = {}, options = {}) => {
	experimentalStaticLocale ?? options.locale ?? getLocale()
	return en_admin_stat_projects(inputs)
});