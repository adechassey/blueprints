/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Pagination_NextInputs */

const en_pagination_next = /** @type {(inputs: Pagination_NextInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Next`)
};

/**
* | output |
* | --- |
* | "Next" |
*
* @param {Pagination_NextInputs} inputs
* @param {{ locale?: "en" }} options
* @returns {LocalizedString}
*/
export const pagination_next = /** @type {((inputs?: Pagination_NextInputs, options?: { locale?: "en" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Pagination_NextInputs, { locale?: "en" }, {}>} */ ((inputs = {}, options = {}) => {
	experimentalStaticLocale ?? options.locale ?? getLocale()
	return en_pagination_next(inputs)
});