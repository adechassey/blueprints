/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Form_Project_NoneInputs */

const en_form_project_none = /** @type {(inputs: Form_Project_NoneInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`No project`)
};

/**
* | output |
* | --- |
* | "No project" |
*
* @param {Form_Project_NoneInputs} inputs
* @param {{ locale?: "en" }} options
* @returns {LocalizedString}
*/
export const form_project_none = /** @type {((inputs?: Form_Project_NoneInputs, options?: { locale?: "en" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Form_Project_NoneInputs, { locale?: "en" }, {}>} */ ((inputs = {}, options = {}) => {
	experimentalStaticLocale ?? options.locale ?? getLocale()
	return en_form_project_none(inputs)
});