/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Dropzone_BrowseInputs */

const en_dropzone_browse = /** @type {(inputs: Dropzone_BrowseInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Browse blueprint`)
};

/**
* | output |
* | --- |
* | "Browse blueprint" |
*
* @param {Dropzone_BrowseInputs} inputs
* @param {{ locale?: "en" }} options
* @returns {LocalizedString}
*/
export const dropzone_browse = /** @type {((inputs?: Dropzone_BrowseInputs, options?: { locale?: "en" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Dropzone_BrowseInputs, { locale?: "en" }, {}>} */ ((inputs = {}, options = {}) => {
	experimentalStaticLocale ?? options.locale ?? getLocale()
	return en_dropzone_browse(inputs)
});