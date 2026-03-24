/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Nav_ProjectsInputs */

const en_nav_projects = /** @type {(inputs: Nav_ProjectsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Projects`)
};

/**
* | output |
* | --- |
* | "Projects" |
*
* @param {Nav_ProjectsInputs} inputs
* @param {{ locale?: "en" }} options
* @returns {LocalizedString}
*/
export const nav_projects = /** @type {((inputs?: Nav_ProjectsInputs, options?: { locale?: "en" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Nav_ProjectsInputs, { locale?: "en" }, {}>} */ ((inputs = {}, options = {}) => {
	experimentalStaticLocale ?? options.locale ?? getLocale()
	return en_nav_projects(inputs)
});