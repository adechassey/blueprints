/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Auth_Login_SubtitleInputs */

const en_auth_login_subtitle = /** @type {(inputs: Auth_Login_SubtitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Sign in with your Google account to publish and manage blueprints.`)
};

/**
* | output |
* | --- |
* | "Sign in with your Google account to publish and manage blueprints." |
*
* @param {Auth_Login_SubtitleInputs} inputs
* @param {{ locale?: "en" }} options
* @returns {LocalizedString}
*/
export const auth_login_subtitle = /** @type {((inputs?: Auth_Login_SubtitleInputs, options?: { locale?: "en" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Login_SubtitleInputs, { locale?: "en" }, {}>} */ ((inputs = {}, options = {}) => {
	experimentalStaticLocale ?? options.locale ?? getLocale()
	return en_auth_login_subtitle(inputs)
});