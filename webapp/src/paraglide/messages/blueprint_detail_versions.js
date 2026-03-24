/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Blueprint_Detail_VersionsInputs */

const en_blueprint_detail_versions = /** @type {(inputs: Blueprint_Detail_VersionsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Version History`)
};

/**
* | output |
* | --- |
* | "Version History" |
*
* @param {Blueprint_Detail_VersionsInputs} inputs
* @param {{ locale?: "en" }} options
* @returns {LocalizedString}
*/
export const blueprint_detail_versions = /** @type {((inputs?: Blueprint_Detail_VersionsInputs, options?: { locale?: "en" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Blueprint_Detail_VersionsInputs, { locale?: "en" }, {}>} */ ((inputs = {}, options = {}) => {
	experimentalStaticLocale ?? options.locale ?? getLocale()
	return en_blueprint_detail_versions(inputs)
});