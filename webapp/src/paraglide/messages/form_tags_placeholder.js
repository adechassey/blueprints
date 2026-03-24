/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Form_Tags_PlaceholderInputs */

const en_form_tags_placeholder = /** @type {(inputs: Form_Tags_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`nestjs, typescript, hooks`)
};

/**
* | output |
* | --- |
* | "nestjs, typescript, hooks" |
*
* @param {Form_Tags_PlaceholderInputs} inputs
* @param {{ locale?: "en" }} options
* @returns {LocalizedString}
*/
export const form_tags_placeholder = /** @type {((inputs?: Form_Tags_PlaceholderInputs, options?: { locale?: "en" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Form_Tags_PlaceholderInputs, { locale?: "en" }, {}>} */ ((inputs = {}, options = {}) => {
	experimentalStaticLocale ?? options.locale ?? getLocale()
	return en_form_tags_placeholder(inputs)
});