/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ version: NonNullable<unknown> }} Blueprint_Detail_VersionInputs */

const en_blueprint_detail_version = /** @type {(inputs: Blueprint_Detail_VersionInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`v${i?.version}`)
};

/**
* | output |
* | --- |
* | "v{version}" |
*
* @param {Blueprint_Detail_VersionInputs} inputs
* @param {{ locale?: "en" }} options
* @returns {LocalizedString}
*/
export const blueprint_detail_version = /** @type {((inputs: Blueprint_Detail_VersionInputs, options?: { locale?: "en" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Blueprint_Detail_VersionInputs, { locale?: "en" }, {}>} */ ((inputs, options = {}) => {
	experimentalStaticLocale ?? options.locale ?? getLocale()
	return en_blueprint_detail_version(inputs)
});