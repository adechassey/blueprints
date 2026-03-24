/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Form_ProjectInputs */

const en_form_project = /** @type {(inputs: Form_ProjectInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Project`)
};

/**
* | output |
* | --- |
* | "Project" |
*
* @param {Form_ProjectInputs} inputs
* @param {{ locale?: "en" }} options
* @returns {LocalizedString}
*/
export const form_project = /** @type {((inputs?: Form_ProjectInputs, options?: { locale?: "en" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Form_ProjectInputs, { locale?: "en" }, {}>} */ ((inputs = {}, options = {}) => {
	experimentalStaticLocale ?? options.locale ?? getLocale()
	return en_form_project(inputs)
});