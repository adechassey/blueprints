/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Profile_No_BlueprintsInputs */

const en_profile_no_blueprints = /** @type {(inputs: Profile_No_BlueprintsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`No blueprints published yet`)
};

/**
* | output |
* | --- |
* | "No blueprints published yet" |
*
* @param {Profile_No_BlueprintsInputs} inputs
* @param {{ locale?: "en" }} options
* @returns {LocalizedString}
*/
export const profile_no_blueprints = /** @type {((inputs?: Profile_No_BlueprintsInputs, options?: { locale?: "en" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Profile_No_BlueprintsInputs, { locale?: "en" }, {}>} */ ((inputs = {}, options = {}) => {
	experimentalStaticLocale ?? options.locale ?? getLocale()
	return en_profile_no_blueprints(inputs)
});