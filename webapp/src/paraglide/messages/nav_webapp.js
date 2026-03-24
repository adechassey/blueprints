/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Nav_WebappInputs */

const en_nav_webapp = /** @type {(inputs: Nav_WebappInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Webapp`)
};

/**
* | output |
* | --- |
* | "Webapp" |
*
* @param {Nav_WebappInputs} inputs
* @param {{ locale?: "en" }} options
* @returns {LocalizedString}
*/
export const nav_webapp = /** @type {((inputs?: Nav_WebappInputs, options?: { locale?: "en" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Nav_WebappInputs, { locale?: "en" }, {}>} */ ((inputs = {}, options = {}) => {
	experimentalStaticLocale ?? options.locale ?? getLocale()
	return en_nav_webapp(inputs)
});