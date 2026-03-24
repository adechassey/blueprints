/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Form_ContentInputs */

const en_form_content = /** @type {(inputs: Form_ContentInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Content (Markdown)`)
};

/**
* | output |
* | --- |
* | "Content (Markdown)" |
*
* @param {Form_ContentInputs} inputs
* @param {{ locale?: "en" }} options
* @returns {LocalizedString}
*/
export const form_content = /** @type {((inputs?: Form_ContentInputs, options?: { locale?: "en" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Form_ContentInputs, { locale?: "en" }, {}>} */ ((inputs = {}, options = {}) => {
	experimentalStaticLocale ?? options.locale ?? getLocale()
	return en_form_content(inputs)
});