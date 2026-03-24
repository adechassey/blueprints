/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Nav_New_BlueprintInputs */

const en_nav_new_blueprint = /** @type {(inputs: Nav_New_BlueprintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`New Blueprint`)
};

/**
* | output |
* | --- |
* | "New Blueprint" |
*
* @param {Nav_New_BlueprintInputs} inputs
* @param {{ locale?: "en" }} options
* @returns {LocalizedString}
*/
export const nav_new_blueprint = /** @type {((inputs?: Nav_New_BlueprintInputs, options?: { locale?: "en" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Nav_New_BlueprintInputs, { locale?: "en" }, {}>} */ ((inputs = {}, options = {}) => {
	experimentalStaticLocale ?? options.locale ?? getLocale()
	return en_nav_new_blueprint(inputs)
});