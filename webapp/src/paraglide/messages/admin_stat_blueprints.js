/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Stat_BlueprintsInputs */

const en_admin_stat_blueprints = /** @type {(inputs: Admin_Stat_BlueprintsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Blueprints`)
};

/**
* | output |
* | --- |
* | "Blueprints" |
*
* @param {Admin_Stat_BlueprintsInputs} inputs
* @param {{ locale?: "en" }} options
* @returns {LocalizedString}
*/
export const admin_stat_blueprints = /** @type {((inputs?: Admin_Stat_BlueprintsInputs, options?: { locale?: "en" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Stat_BlueprintsInputs, { locale?: "en" }, {}>} */ ((inputs = {}, options = {}) => {
	experimentalStaticLocale ?? options.locale ?? getLocale()
	return en_admin_stat_blueprints(inputs)
});