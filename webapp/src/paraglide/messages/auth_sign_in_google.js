/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Auth_Sign_In_GoogleInputs */

const en_auth_sign_in_google = /** @type {(inputs: Auth_Sign_In_GoogleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Sign in with Google`)
};

/**
* | output |
* | --- |
* | "Sign in with Google" |
*
* @param {Auth_Sign_In_GoogleInputs} inputs
* @param {{ locale?: "en" }} options
* @returns {LocalizedString}
*/
export const auth_sign_in_google = /** @type {((inputs?: Auth_Sign_In_GoogleInputs, options?: { locale?: "en" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Sign_In_GoogleInputs, { locale?: "en" }, {}>} */ ((inputs = {}, options = {}) => {
	experimentalStaticLocale ?? options.locale ?? getLocale()
	return en_auth_sign_in_google(inputs)
});