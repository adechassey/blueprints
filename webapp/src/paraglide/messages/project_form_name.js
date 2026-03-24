/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Project_Form_NameInputs */

const en_project_form_name = /** @type {(inputs: Project_Form_NameInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Project Name`)
};

/**
* | output |
* | --- |
* | "Project Name" |
*
* @param {Project_Form_NameInputs} inputs
* @param {{ locale?: "en" }} options
* @returns {LocalizedString}
*/
export const project_form_name = /** @type {((inputs?: Project_Form_NameInputs, options?: { locale?: "en" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Project_Form_NameInputs, { locale?: "en" }, {}>} */ ((inputs = {}, options = {}) => {
	experimentalStaticLocale ?? options.locale ?? getLocale()
	return en_project_form_name(inputs)
});