/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ score: NonNullable<unknown> }} Matches_Reason_EmbeddingInputs */

const en_matches_reason_embedding = /** @type {(inputs: Matches_Reason_EmbeddingInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.score}% similar`)
};

/**
* | output |
* | --- |
* | "{score}% similar" |
*
* @param {Matches_Reason_EmbeddingInputs} inputs
* @param {{ locale?: "en" }} options
* @returns {LocalizedString}
*/
export const matches_reason_embedding = /** @type {((inputs: Matches_Reason_EmbeddingInputs, options?: { locale?: "en" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Matches_Reason_EmbeddingInputs, { locale?: "en" }, {}>} */ ((inputs, options = {}) => {
	experimentalStaticLocale ?? options.locale ?? getLocale()
	return en_matches_reason_embedding(inputs)
});