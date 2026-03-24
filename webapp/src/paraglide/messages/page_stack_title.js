/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ stack: NonNullable<unknown> }} Page_Stack_TitleInputs */

const en_page_stack_title = /** @type {(inputs: Page_Stack_TitleInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.stack} Blueprints`)
};

/**
* | output |
* | --- |
* | "{stack} Blueprints" |
*
* @param {Page_Stack_TitleInputs} inputs
* @param {{ locale?: "en" }} options
* @returns {LocalizedString}
*/
export const page_stack_title = /** @type {((inputs: Page_Stack_TitleInputs, options?: { locale?: "en" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Page_Stack_TitleInputs, { locale?: "en" }, {}>} */ ((inputs, options = {}) => {
	experimentalStaticLocale ?? options.locale ?? getLocale()
	return en_page_stack_title(inputs)
});