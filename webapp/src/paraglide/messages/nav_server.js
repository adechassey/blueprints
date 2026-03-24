/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Nav_ServerInputs */

const en_nav_server = /** @type {(inputs: Nav_ServerInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Server`)
};

/**
* | output |
* | --- |
* | "Server" |
*
* @param {Nav_ServerInputs} inputs
* @param {{ locale?: "en" }} options
* @returns {LocalizedString}
*/
export const nav_server = /** @type {((inputs?: Nav_ServerInputs, options?: { locale?: "en" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Nav_ServerInputs, { locale?: "en" }, {}>} */ ((inputs = {}, options = {}) => {
	experimentalStaticLocale ?? options.locale ?? getLocale()
	return en_nav_server(inputs)
});