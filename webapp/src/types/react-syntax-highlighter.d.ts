// Type declarations for explicit ESM subpath imports of react-syntax-highlighter.
// The @types package only covers extensionless paths; we import the `dist/esm/`
// files directly (with .js) to avoid CJS/ESM interop breakage at runtime.
declare module 'react-syntax-highlighter/dist/esm/prism-light.js' {
	import type { ComponentType } from 'react';
	const SyntaxHighlighter: ComponentType<{
		language?: string;
		style?: Record<string, React.CSSProperties>;
		PreTag?: string;
		customStyle?: React.CSSProperties;
		codeTagProps?: React.HTMLAttributes<HTMLElement>;
		children?: string;
		showLineNumbers?: boolean;
	}> & {
		registerLanguage: (name: string, language: unknown) => void;
		alias: (language: string, alias: string | string[]) => void;
	};
	export default SyntaxHighlighter;
}

declare module 'react-syntax-highlighter/dist/esm/styles/prism/one-dark.js' {
	const style: Record<string, React.CSSProperties>;
	export default style;
}

declare module 'react-syntax-highlighter/dist/esm/languages/prism/*.js' {
	const language: { displayName: string; aliases?: string[] };
	export default language;
}
