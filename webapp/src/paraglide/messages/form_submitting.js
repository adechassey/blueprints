/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Form_SubmittingInputs */

const en_form_submitting = /** @type {(inputs: Form_SubmittingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Saving...`)
};

/**
* | output |
* | --- |
* | "Saving..." |
*
* @param {Form_SubmittingInputs} inputs
* @param {{ locale?: "en" }} options
* @returns {LocalizedString}
*/
export const form_submitting = /** @type {((inputs?: Form_SubmittingInputs, options?: { locale?: "en" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Form_SubmittingInputs, { locale?: "en" }, {}>} */ ((inputs = {}, options = {}) => {
	experimentalStaticLocale ?? options.locale ?? getLocale()
	return en_form_submitting(inputs)
});