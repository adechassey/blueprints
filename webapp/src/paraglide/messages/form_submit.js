/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Form_SubmitInputs */

const en_form_submit = /** @type {(inputs: Form_SubmitInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Save`)
};

/**
* | output |
* | --- |
* | "Save" |
*
* @param {Form_SubmitInputs} inputs
* @param {{ locale?: "en" }} options
* @returns {LocalizedString}
*/
export const form_submit = /** @type {((inputs?: Form_SubmitInputs, options?: { locale?: "en" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Form_SubmitInputs, { locale?: "en" }, {}>} */ ((inputs = {}, options = {}) => {
	experimentalStaticLocale ?? options.locale ?? getLocale()
	return en_form_submit(inputs)
});