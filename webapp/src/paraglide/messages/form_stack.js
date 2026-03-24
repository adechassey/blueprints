/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Form_StackInputs */

const en_form_stack = /** @type {(inputs: Form_StackInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Stack`)
};

/**
* | output |
* | --- |
* | "Stack" |
*
* @param {Form_StackInputs} inputs
* @param {{ locale?: "en" }} options
* @returns {LocalizedString}
*/
export const form_stack = /** @type {((inputs?: Form_StackInputs, options?: { locale?: "en" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Form_StackInputs, { locale?: "en" }, {}>} */ ((inputs = {}, options = {}) => {
	experimentalStaticLocale ?? options.locale ?? getLocale()
	return en_form_stack(inputs)
});