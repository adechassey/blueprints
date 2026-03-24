/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ from: NonNullable<unknown>, to: NonNullable<unknown>, total: NonNullable<unknown> }} Pagination_ShowingInputs */

const en_pagination_showing = /** @type {(inputs: Pagination_ShowingInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Showing ${i?.from}–${i?.to} of ${i?.total}`)
};

/**
* | output |
* | --- |
* | "Showing {from}–{to} of {total}" |
*
* @param {Pagination_ShowingInputs} inputs
* @param {{ locale?: "en" }} options
* @returns {LocalizedString}
*/
export const pagination_showing = /** @type {((inputs: Pagination_ShowingInputs, options?: { locale?: "en" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Pagination_ShowingInputs, { locale?: "en" }, {}>} */ ((inputs, options = {}) => {
	experimentalStaticLocale ?? options.locale ?? getLocale()
	return en_pagination_showing(inputs)
});