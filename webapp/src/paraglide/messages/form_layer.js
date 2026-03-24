/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Form_LayerInputs */

const en_form_layer = /** @type {(inputs: Form_LayerInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Layer`)
};

/**
* | output |
* | --- |
* | "Layer" |
*
* @param {Form_LayerInputs} inputs
* @param {{ locale?: "en" }} options
* @returns {LocalizedString}
*/
export const form_layer = /** @type {((inputs?: Form_LayerInputs, options?: { locale?: "en" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Form_LayerInputs, { locale?: "en" }, {}>} */ ((inputs = {}, options = {}) => {
	experimentalStaticLocale ?? options.locale ?? getLocale()
	return en_form_layer(inputs)
});