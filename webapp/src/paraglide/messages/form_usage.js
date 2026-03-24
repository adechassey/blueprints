/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Form_UsageInputs */

const en_form_usage = /** @type {(inputs: Form_UsageInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Usage`)
};

/**
* | output |
* | --- |
* | "Usage" |
*
* @param {Form_UsageInputs} inputs
* @param {{ locale?: "en" }} options
* @returns {LocalizedString}
*/
export const form_usage = /** @type {((inputs?: Form_UsageInputs, options?: { locale?: "en" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Form_UsageInputs, { locale?: "en" }, {}>} */ ((inputs = {}, options = {}) => {
	experimentalStaticLocale ?? options.locale ?? getLocale()
	return en_form_usage(inputs)
});