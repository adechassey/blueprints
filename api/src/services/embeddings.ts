import type { FeatureExtractionPipeline } from '@huggingface/transformers';

let pipeline: FeatureExtractionPipeline | null = null;

async function getPipeline(): Promise<FeatureExtractionPipeline> {
	if (pipeline) return pipeline;
	const mod = await import('@huggingface/transformers');
	const create = mod.pipeline as (
		task: 'feature-extraction',
		model: string,
	) => Promise<FeatureExtractionPipeline>;
	pipeline = await create('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
	return pipeline;
}

export async function generateEmbedding(text: string): Promise<number[]> {
	const pipe = await getPipeline();
	const output = await pipe(text, { pooling: 'mean', normalize: true });
	return Array.from(output.data as Float32Array);
}
