/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Profile_BlueprintsInputs */

const en_profile_blueprints = /** @type {(inputs: Profile_BlueprintsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Published Blueprints`)
};

/**
* | output |
* | --- |
* | "Published Blueprints" |
*
* @param {Profile_BlueprintsInputs} inputs
* @param {{ locale?: "en" }} options
* @returns {LocalizedString}
*/
export const profile_blueprints = /** @type {((inputs?: Profile_BlueprintsInputs, options?: { locale?: "en" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Profile_BlueprintsInputs, { locale?: "en" }, {}>} */ ((inputs = {}, options = {}) => {
	experimentalStaticLocale ?? options.locale ?? getLocale()
	return en_profile_blueprints(inputs)
});