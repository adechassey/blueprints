/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Projects_TitleInputs */

const en_projects_title = /** @type {(inputs: Projects_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Projects`)
};

/**
* | output |
* | --- |
* | "Projects" |
*
* @param {Projects_TitleInputs} inputs
* @param {{ locale?: "en" }} options
* @returns {LocalizedString}
*/
export const projects_title = /** @type {((inputs?: Projects_TitleInputs, options?: { locale?: "en" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Projects_TitleInputs, { locale?: "en" }, {}>} */ ((inputs = {}, options = {}) => {
	experimentalStaticLocale ?? options.locale ?? getLocale()
	return en_projects_title(inputs)
});