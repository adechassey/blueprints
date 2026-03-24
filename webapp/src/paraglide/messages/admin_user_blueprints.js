/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ count: NonNullable<unknown> }} Admin_User_BlueprintsInputs */

const en_admin_user_blueprints = /** @type {(inputs: Admin_User_BlueprintsInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count} blueprints`)
};

/**
* | output |
* | --- |
* | "{count} blueprints" |
*
* @param {Admin_User_BlueprintsInputs} inputs
* @param {{ locale?: "en" }} options
* @returns {LocalizedString}
*/
export const admin_user_blueprints = /** @type {((inputs: Admin_User_BlueprintsInputs, options?: { locale?: "en" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_User_BlueprintsInputs, { locale?: "en" }, {}>} */ ((inputs, options = {}) => {
	experimentalStaticLocale ?? options.locale ?? getLocale()
	return en_admin_user_blueprints(inputs)
});