/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Dropzone_HintInputs */

const en_dropzone_hint = /** @type {(inputs: Dropzone_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Drop a .md file here or`)
};

/**
* | output |
* | --- |
* | "Drop a .md file here or" |
*
* @param {Dropzone_HintInputs} inputs
* @param {{ locale?: "en" }} options
* @returns {LocalizedString}
*/
export const dropzone_hint = /** @type {((inputs?: Dropzone_HintInputs, options?: { locale?: "en" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Dropzone_HintInputs, { locale?: "en" }, {}>} */ ((inputs = {}, options = {}) => {
	experimentalStaticLocale ?? options.locale ?? getLocale()
	return en_dropzone_hint(inputs)
});