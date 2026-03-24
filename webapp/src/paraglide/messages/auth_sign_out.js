/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Auth_Sign_OutInputs */

const en_auth_sign_out = /** @type {(inputs: Auth_Sign_OutInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Sign out`)
};

/**
* | output |
* | --- |
* | "Sign out" |
*
* @param {Auth_Sign_OutInputs} inputs
* @param {{ locale?: "en" }} options
* @returns {LocalizedString}
*/
export const auth_sign_out = /** @type {((inputs?: Auth_Sign_OutInputs, options?: { locale?: "en" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Sign_OutInputs, { locale?: "en" }, {}>} */ ((inputs = {}, options = {}) => {
	experimentalStaticLocale ?? options.locale ?? getLocale()
	return en_auth_sign_out(inputs)
});