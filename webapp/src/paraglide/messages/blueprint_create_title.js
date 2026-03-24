/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Blueprint_Create_TitleInputs */

const en_blueprint_create_title = /** @type {(inputs: Blueprint_Create_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Create Blueprint`)
};

/**
* | output |
* | --- |
* | "Create Blueprint" |
*
* @param {Blueprint_Create_TitleInputs} inputs
* @param {{ locale?: "en" }} options
* @returns {LocalizedString}
*/
export const blueprint_create_title = /** @type {((inputs?: Blueprint_Create_TitleInputs, options?: { locale?: "en" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Blueprint_Create_TitleInputs, { locale?: "en" }, {}>} */ ((inputs = {}, options = {}) => {
	experimentalStaticLocale ?? options.locale ?? getLocale()
	return en_blueprint_create_title(inputs)
});