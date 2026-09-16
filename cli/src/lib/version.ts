/**
 * Version baked in at bundle time: `bundle.mjs` inlines `process.env.CLI_VERSION`
 * (set from the `cli-vX.Y.Z` tag by the release workflow). Dev runs report "dev".
 */
export const CLI_VERSION: string = process.env.CLI_VERSION ?? 'dev';
