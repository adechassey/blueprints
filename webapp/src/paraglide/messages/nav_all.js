/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Nav_AllInputs */

const en_nav_all = /** @type {(inputs: Nav_AllInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`All`)
};

/**
* | output |
* | --- |
* | "All" |
*
* @param {Nav_AllInputs} inputs
* @param {{ locale?: "en" }} options
* @returns {LocalizedString}
*/
export const nav_all = /** @type {((inputs?: Nav_AllInputs, options?: { locale?: "en" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Nav_AllInputs, { locale?: "en" }, {}>} */ ((inputs = {}, options = {}) => {
	experimentalStaticLocale ?? options.locale ?? getLocale()
	return en_nav_all(inputs)
});