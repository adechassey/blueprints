/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Blueprint_Edit_TitleInputs */

const en_blueprint_edit_title = /** @type {(inputs: Blueprint_Edit_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Edit Blueprint`)
};

/**
* | output |
* | --- |
* | "Edit Blueprint" |
*
* @param {Blueprint_Edit_TitleInputs} inputs
* @param {{ locale?: "en" }} options
* @returns {LocalizedString}
*/
export const blueprint_edit_title = /** @type {((inputs?: Blueprint_Edit_TitleInputs, options?: { locale?: "en" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Blueprint_Edit_TitleInputs, { locale?: "en" }, {}>} */ ((inputs = {}, options = {}) => {
	experimentalStaticLocale ?? options.locale ?? getLocale()
	return en_blueprint_edit_title(inputs)
});