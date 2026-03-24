/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ count: NonNullable<unknown> }} Blueprint_Count_OtherInputs */

const en_blueprint_count_other = /** @type {(inputs: Blueprint_Count_OtherInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count} blueprints`)
};

/**
* | output |
* | --- |
* | "{count} blueprints" |
*
* @param {Blueprint_Count_OtherInputs} inputs
* @param {{ locale?: "en" }} options
* @returns {LocalizedString}
*/
export const blueprint_count_other = /** @type {((inputs: Blueprint_Count_OtherInputs, options?: { locale?: "en" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Blueprint_Count_OtherInputs, { locale?: "en" }, {}>} */ ((inputs, options = {}) => {
	experimentalStaticLocale ?? options.locale ?? getLocale()
	return en_blueprint_count_other(inputs)
});