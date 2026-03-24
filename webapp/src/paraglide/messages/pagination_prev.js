/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Pagination_PrevInputs */

const en_pagination_prev = /** @type {(inputs: Pagination_PrevInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Previous`)
};

/**
* | output |
* | --- |
* | "Previous" |
*
* @param {Pagination_PrevInputs} inputs
* @param {{ locale?: "en" }} options
* @returns {LocalizedString}
*/
export const pagination_prev = /** @type {((inputs?: Pagination_PrevInputs, options?: { locale?: "en" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Pagination_PrevInputs, { locale?: "en" }, {}>} */ ((inputs = {}, options = {}) => {
	experimentalStaticLocale ?? options.locale ?? getLocale()
	return en_pagination_prev(inputs)
});