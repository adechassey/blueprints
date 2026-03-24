/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ count: NonNullable<unknown> }} Blueprint_Detail_DownloadsInputs */

const en_blueprint_detail_downloads = /** @type {(inputs: Blueprint_Detail_DownloadsInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count} downloads`)
};

/**
* | output |
* | --- |
* | "{count} downloads" |
*
* @param {Blueprint_Detail_DownloadsInputs} inputs
* @param {{ locale?: "en" }} options
* @returns {LocalizedString}
*/
export const blueprint_detail_downloads = /** @type {((inputs: Blueprint_Detail_DownloadsInputs, options?: { locale?: "en" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Blueprint_Detail_DownloadsInputs, { locale?: "en" }, {}>} */ ((inputs, options = {}) => {
	experimentalStaticLocale ?? options.locale ?? getLocale()
	return en_blueprint_detail_downloads(inputs)
});