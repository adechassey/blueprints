/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ date: NonNullable<unknown> }} Profile_JoinedInputs */

const en_profile_joined = /** @type {(inputs: Profile_JoinedInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Joined ${i?.date}`)
};

/**
* | output |
* | --- |
* | "Joined {date}" |
*
* @param {Profile_JoinedInputs} inputs
* @param {{ locale?: "en" }} options
* @returns {LocalizedString}
*/
export const profile_joined = /** @type {((inputs: Profile_JoinedInputs, options?: { locale?: "en" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Profile_JoinedInputs, { locale?: "en" }, {}>} */ ((inputs, options = {}) => {
	experimentalStaticLocale ?? options.locale ?? getLocale()
	return en_profile_joined(inputs)
});