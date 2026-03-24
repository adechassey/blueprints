# Fix 04: Implement Actual Markdown Rendering

**Severity**: Medium
**Report refs**: 2.2

## Problem

`webapp/src/components/MarkdownRenderer.tsx` wraps content in a `<pre>` tag — it does not parse or render Markdown. Headings, code blocks, links, lists, and other Markdown features are displayed as raw text.

## Solution

### Step 1: Install react-markdown

```bash
pnpm --filter webapp add react-markdown remark-gfm
```

- `react-markdown` — renders Markdown as React components
- `remark-gfm` — GitHub Flavored Markdown support (tables, strikethrough, task lists)

### Step 2: Rewrite MarkdownRenderer

```typescript
// webapp/src/components/MarkdownRenderer.tsx
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownRendererProps {
  content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <div className="prose prose-sm max-w-none">
      <Markdown remarkPlugins={[remarkGfm]}>{content}</Markdown>
    </div>
  );
}
```

### Step 3: Add Tailwind Typography plugin (if not already present)

The `prose` class requires `@tailwindcss/typography`:

```bash
pnpm --filter webapp add @tailwindcss/typography
```

Add to `webapp/src/index.css`:
```css
@import "tailwindcss";
@plugin "@tailwindcss/typography";
```

## Files to modify

- `webapp/package.json` — add `react-markdown`, `remark-gfm`, `@tailwindcss/typography`
- `webapp/src/components/MarkdownRenderer.tsx` — rewrite
- `webapp/src/index.css` — add typography plugin (if using Tailwind v4 plugin syntax)

## Acceptance criteria

- [ ] Markdown headings render as `<h1>`–`<h6>`
- [ ] Code blocks render with proper formatting
- [ ] Links are clickable
- [ ] GFM tables render correctly
- [ ] XSS is prevented (react-markdown sanitizes by default)
- [ ] `pnpm check && pnpm check-types && pnpm test` passes
