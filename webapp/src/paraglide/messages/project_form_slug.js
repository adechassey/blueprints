/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Project_Form_SlugInputs */

const en_project_form_slug = /** @type {(inputs: Project_Form_SlugInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Slug`)
};

/**
* | output |
* | --- |
* | "Slug" |
*
* @param {Project_Form_SlugInputs} inputs
* @param {{ locale?: "en" }} options
* @returns {LocalizedString}
*/
export const project_form_slug = /** @type {((inputs?: Project_Form_SlugInputs, options?: { locale?: "en" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Project_Form_SlugInputs, { locale?: "en" }, {}>} */ ((inputs = {}, options = {}) => {
	experimentalStaticLocale ?? options.locale ?? getLocale()
	return en_project_form_slug(inputs)
});