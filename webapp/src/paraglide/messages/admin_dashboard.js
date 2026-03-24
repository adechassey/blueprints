/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_DashboardInputs */

const en_admin_dashboard = /** @type {(inputs: Admin_DashboardInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Admin Dashboard`)
};

/**
* | output |
* | --- |
* | "Admin Dashboard" |
*
* @param {Admin_DashboardInputs} inputs
* @param {{ locale?: "en" }} options
* @returns {LocalizedString}
*/
export const admin_dashboard = /** @type {((inputs?: Admin_DashboardInputs, options?: { locale?: "en" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_DashboardInputs, { locale?: "en" }, {}>} */ ((inputs = {}, options = {}) => {
	experimentalStaticLocale ?? options.locale ?? getLocale()
	return en_admin_dashboard(inputs)
});