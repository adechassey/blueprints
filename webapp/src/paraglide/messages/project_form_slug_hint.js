/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Project_Form_Slug_HintInputs */

const en_project_form_slug_hint = /** @type {(inputs: Project_Form_Slug_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Lowercase letters, numbers, and hyphens only`)
};

/**
* | output |
* | --- |
* | "Lowercase letters, numbers, and hyphens only" |
*
* @param {Project_Form_Slug_HintInputs} inputs
* @param {{ locale?: "en" }} options
* @returns {LocalizedString}
*/
export const project_form_slug_hint = /** @type {((inputs?: Project_Form_Slug_HintInputs, options?: { locale?: "en" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Project_Form_Slug_HintInputs, { locale?: "en" }, {}>} */ ((inputs = {}, options = {}) => {
	experimentalStaticLocale ?? options.locale ?? getLocale()
	return en_project_form_slug_hint(inputs)
});