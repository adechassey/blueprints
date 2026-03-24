import type { FeatureExtractionPipeline } from '@huggingface/transformers';

let pipeline: FeatureExtractionPipeline | null = null;

async function getPipeline(): Promise<FeatureExtractionPipeline> {
	if (pipeline) return pipeline;
	const { pipeline: createPipeline } = await import('@huggingface/transformers');
	pipeline = (await createPipeline(
		'feature-extraction',
		'Xenova/all-MiniLM-L6-v2',
	)) as FeatureExtractionPipeline;
	return pipeline;
}

export async function generateEmbedding(text: string): Promise<number[]> {
	const pipe = await getPipeline();
	const output = await pipe(text, { pooling: 'mean', normalize: true });
	return Array.from(output.data as Float32Array);
}
