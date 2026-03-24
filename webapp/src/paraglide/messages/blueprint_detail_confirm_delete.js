/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Blueprint_Detail_Confirm_DeleteInputs */

const en_blueprint_detail_confirm_delete = /** @type {(inputs: Blueprint_Detail_Confirm_DeleteInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Are you sure you want to delete this blueprint?`)
};

/**
* | output |
* | --- |
* | "Are you sure you want to delete this blueprint?" |
*
* @param {Blueprint_Detail_Confirm_DeleteInputs} inputs
* @param {{ locale?: "en" }} options
* @returns {LocalizedString}
*/
export const blueprint_detail_confirm_delete = /** @type {((inputs?: Blueprint_Detail_Confirm_DeleteInputs, options?: { locale?: "en" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Blueprint_Detail_Confirm_DeleteInputs, { locale?: "en" }, {}>} */ ((inputs = {}, options = {}) => {
	experimentalStaticLocale ?? options.locale ?? getLocale()
	return en_blueprint_detail_confirm_delete(inputs)
});