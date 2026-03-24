/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Nav_SharedInputs */

const en_nav_shared = /** @type {(inputs: Nav_SharedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Shared`)
};

/**
* | output |
* | --- |
* | "Shared" |
*
* @param {Nav_SharedInputs} inputs
* @param {{ locale?: "en" }} options
* @returns {LocalizedString}
*/
export const nav_shared = /** @type {((inputs?: Nav_SharedInputs, options?: { locale?: "en" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Nav_SharedInputs, { locale?: "en" }, {}>} */ ((inputs = {}, options = {}) => {
	experimentalStaticLocale ?? options.locale ?? getLocale()
	return en_nav_shared(inputs)
});