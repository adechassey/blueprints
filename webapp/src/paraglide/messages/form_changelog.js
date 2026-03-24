/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Form_ChangelogInputs */

const en_form_changelog = /** @type {(inputs: Form_ChangelogInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Changelog`)
};

/**
* | output |
* | --- |
* | "Changelog" |
*
* @param {Form_ChangelogInputs} inputs
* @param {{ locale?: "en" }} options
* @returns {LocalizedString}
*/
export const form_changelog = /** @type {((inputs?: Form_ChangelogInputs, options?: { locale?: "en" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Form_ChangelogInputs, { locale?: "en" }, {}>} */ ((inputs = {}, options = {}) => {
	experimentalStaticLocale ?? options.locale ?? getLocale()
	return en_form_changelog(inputs)
});