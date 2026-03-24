# PRD: Design System Overhaul

## Context

The Blueprints webapp currently uses raw Tailwind CSS with no component library, no icon system, no dark mode, and a basic gray/blue color scheme. A refined visual direction was generated via Stitch (see `design.md`) covering the Blueprint Detail and Search Results pages.

This PRD scopes a **full design system overhaul** that applies the Stitch visual language to every page in the app.

## Goals

- Deliver a polished, professional UI that matches the Stitch design direction
- Introduce a consistent design system (tokens, components, patterns) that scales
- Support light and dark mode
- Migrate to shadcn/ui as the component foundation, themed to match Stitch
- Replace inline Tailwind patterns with reusable, composable components

## Non-Goals

- New features (notifications, settings page, side navigation, analytics)
- Changes to API, data model, or business logic
- Mobile-native or PWA support
- Accessibility audit (follow-up)

---

## Design System

### Color Tokens

Adopt a Material Design 3-inspired token system via Tailwind CSS config + CSS custom properties. All colors must have light and dark variants.

#### Light Mode (from Stitch)

| Token | Value | Usage |
|---|---|---|
| `--primary` | `#0053de` | Primary actions, active nav links |
| `--primary-container` | `#0f62fe` | Primary button fills, gradient source |
| `--on-primary` | `#faf8ff` | Text on primary backgrounds |
| `--surface` | `#f9f9f9` | Page background |
| `--surface-container-low` | `#f2f4f4` | Card hover, subtle sections ("When to use") |
| `--surface-container` | `#eceeee` | Secondary surfaces |
| `--surface-container-high` | `#e6e9e9` | Filter pills, tag badges, input backgrounds |
| `--surface-container-highest` | `#dfe3e4` | Hover state on high surfaces |
| `--surface-container-lowest` | `#ffffff` | Card backgrounds, input backgrounds |
| `--on-surface` | `#2f3334` | Primary text |
| `--on-surface-variant` | `#5b6061` | Secondary text, descriptions |
| `--outline` | `#777b7c` | Subtle borders, filter labels |
| `--outline-variant` | `#afb3b3` | Dividers, faint borders |
| `--secondary` | `#5f5f5f` | Secondary actions |
| `--tertiary` | `#6d567f` | Accent (purple), icon tints |
| `--tertiary-container` | `#e1c4f4` | Match badges, accent backgrounds |
| `--on-tertiary-container` | `#523d63` | Text on tertiary containers |
| `--error` | `#a83836` | Destructive actions |
| `--inverse-surface` | `#0c0f0f` | Code block backgrounds |

#### Dark Mode

Invert the surface scale and adjust primary/tertiary for contrast. Derive from the `dark:` prefixed values in `design.md`:

| Token | Value |
|---|---|
| `--primary` (dark) | `#3d82ff` |
| `--surface` (dark) | slate-900 range |
| `--surface-container-high` (dark) | slate-800 range |
| `--on-surface` (dark) | white/slate-100 |

> Exact dark palette to be finalized during implementation by testing contrast ratios.

### Typography

| Role | Font | Weight | Usage |
|---|---|---|---|
| Headline | **Manrope** | 700, 800 | Page titles, section headings, nav links, card titles |
| Body | **Inter** | 400, 500, 600 | Body text, descriptions, labels, buttons |
| Mono | **Fira Code** | 400, 500 | Code blocks, technical metadata (versions, file names) |

Configure via Tailwind `fontFamily` extend:
```
headline: ["Manrope", sans-serif]
body: ["Inter", sans-serif]
mono: ["Fira Code", monospace]
```

### Border Radius

The Stitch design uses generous rounding. Override Tailwind defaults:

| Token | Value | Usage |
|---|---|---|
| `DEFAULT` | `0.125rem` | Minimal rounding (code inline) |
| `lg` | `0.25rem` | Small elements |
| `xl` | `0.5rem` | Buttons, inputs |
| `2xl` | `0.75rem` | Cards, panels |
| `full` | `9999px` | Pills, badges, avatars |

### Shadows

Two elevation levels from Stitch:
- **Resting**: `shadow-[0_20px_40px_rgba(12,15,15,0.02)]`
- **Hover/Elevated**: `shadow-[0_20px_40px_rgba(12,15,15,0.06)]`

### Iconography

- **Library**: Lucide React (`lucide-react`)
- Replace all current inline SVGs and text-based icons with Lucide equivalents
- Map Stitch Material Symbols to closest Lucide icons:
  - `architecture` → `Blocks`
  - `content_copy` → `Copy`
  - `edit` → `Pencil`
  - `delete` → `Trash2`
  - `search` → `Search`
  - `expand_more` → `ChevronDown`
  - `info` → `Info`
  - `database` → `Database`
  - `api` → `Globe`
  - `security` → `Shield`
  - `data_object` → `Braces`
  - `webhook` → `Webhook`
  - `bolt` → `Zap`
  - `logout` → `LogOut`

---

## Component Library: shadcn/ui

Initialize shadcn/ui in the webapp and theme it to match the Stitch design tokens. Use the following shadcn components (at minimum):

| shadcn Component | Maps to |
|---|---|
| `Button` | All buttons (primary, secondary, destructive, ghost) |
| `Input` | Search bars, text fields |
| `Textarea` | Comment input, blueprint content, description |
| `Select` | Stack filter, role selectors (admin) |
| `Badge` | Stack labels, layer tags, match percentages |
| `Card` | Blueprint cards, version cards, stat cards |
| `Avatar` | User avatars in header, comments |
| `DropdownMenu` | User menu, filter dropdowns |
| `Dialog` | Confirmation modals (replace `window.confirm`) |
| `Separator` | Section dividers |
| `Skeleton` | Loading states |
| `Tooltip` | Action button hints |
| `Tabs` | Admin sub-navigation (if applicable) |
| `Toggle` | Dark mode switch |

### Theme Configuration

Override shadcn's default CSS variables in `index.css` with the Stitch color tokens. Both `:root` (light) and `.dark` (dark) selectors.

---

## Page-by-Page Specifications

### Shared: Top Navigation Bar (Header)

**Current**: White bar, gray border-bottom, text links, blue "New Blueprint" button, auth button.

**Target** (from Stitch, adapted to keep top nav):
- Fixed top, full width, `max-w-[1440px]` centered content
- Glassmorphism: `bg-surface/80 backdrop-blur-md` with soft drop shadow
- **Left**: "Blueprints" wordmark in `font-headline font-black text-primary tracking-tighter` + nav links (All, Projects, Tags, Admin)
- **Nav links**: `font-headline font-bold tracking-tight`, active state = `text-primary border-b-2 border-primary`
- **Right**: Global search input (rounded-full, `bg-surface-container-high`, 64ch wide) + "New Blueprint" button (primary) + Avatar with `DropdownMenu` (profile, sign out)
- Dark mode: `bg-slate-900/80`, adjusted text colors

### Shared: Page Layout

- `max-w-[1440px]` for browse/search pages (wider grid)
- `max-w-[1000px]` for detail/form pages (reading width)
- Padding: `px-8 py-8`, top padding accounts for fixed header (`pt-28` to `pt-32`)
- Background: `bg-surface`

### 1. Homepage / All Blueprints (`/`)

**Layout**: Same as Search Results (below) but without a search query. Show all blueprints with the same card grid, filter bar, and pagination.

**Sections**:
1. **Page header**: `h1` "All Blueprints" in `text-5xl font-extrabold tracking-tight font-headline`
2. **Search bar**: Full-width input with Search + Clear buttons (same as search results)
3. **Filter bar**: Horizontal row of pill-shaped filter buttons ("All stacks", "Filter by layer", "Filter by tag") with `ChevronDown` icon. Right-aligned count text "Showing X of Y blueprints"
4. **Blueprint grid**: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6`
5. **Pagination**: Styled with shadcn Button variants

### 2. Search Results (`/` with query)

Same layout as homepage, with:
- `h1` reads: `Search results for "query"` (query in `text-primary italic`)
- Cards display match percentage badge: `Badge` with `tertiary-container` background
- Results count in filter bar

**Blueprint Card** (shared between homepage & search):
- `Card` component from shadcn, custom themed
- Hover: lift `-translate-y-1` + shadow transition
- Top row: Icon (Lucide, in colored rounded square `bg-primary/10`) + match badge (search only)
- Title: `text-lg font-bold font-headline`, hover → `text-primary`
- Description: `text-sm text-on-surface-variant line-clamp-2`
- Bottom: Tag pills (`Badge` components, `bg-surface-container-high`)

### 3. Blueprint Detail (`/blueprints/$blueprintId`)

**Layout**: `max-w-[1000px]`, `space-y-12`

**Sections**:
1. **Header**:
   - `h1` title: `text-4xl md:text-5xl font-black font-headline tracking-tight`
   - Description: `text-lg text-on-surface-variant max-w-2xl leading-relaxed`
   - Action buttons (Copy, Edit, Delete): shadcn `Button` variants (outline for copy/edit, destructive ghost for delete) with Lucide icons
   - Tag row: `Badge` pills for stack, layer, and tags (color-coded)

2. **"When to use" section** (maps to `usage` field):
   - `Card` with `bg-surface-container-low`, subtle border
   - Heading with `Info` icon in primary color
   - Body text in `text-on-surface-variant`

3. **Reference implementation** (markdown content):
   - Section heading: `text-2xl font-extrabold font-headline`
   - Tech tags right-aligned: `font-mono text-xs` badges
   - Code block: Dark background (`bg-inverse-surface`), with terminal dots (red/yellow/green), filename label, syntax-highlighted content via existing `MarkdownRenderer`
   - Non-code markdown renders normally with `prose` typography

4. **Bento grid** (`grid md:grid-cols-3 gap-6`):
   - **Left column (1/3)**: Version History — vertical list of version buttons, active version highlighted with `bg-surface-container-low text-primary font-bold`
   - **Right column (2/3)**: Comments — threaded comments with avatars, reply nesting, and styled comment input using `Textarea` + primary `Button`

### 4. Create / Edit Blueprint (`/blueprints/new`, `/blueprints/$id/edit`)

**Layout**: `max-w-[1000px]`, centered form

**Changes**:
- Use shadcn `Input`, `Textarea`, `Select`, `Button` components
- DropZone: Restyle with dashed border using `outline-variant`, surface background, Lucide `Upload` icon
- Stack selector: shadcn `Select` with color-coded options
- Tags input: Pill-style input (type + enter to add, click to remove)
- Content textarea: Monospace font (`font-mono`), dark background option for code editing feel
- Submit button: Primary gradient style matching Stitch
- Form layout: Consistent spacing (`space-y-6`), labeled sections with `font-headline` headings

### 5. Projects List (`/projects`)

**Layout**: `max-w-[1440px]`, same grid approach as homepage

**Changes**:
- Project cards: shadcn `Card`, same hover lift pattern as blueprint cards
- Icon: Lucide `FolderOpen` in colored square
- Show project name (headline font), description, blueprint count badge

### 6. Project Detail (`/projects/$slug`)

**Layout**: `max-w-[1000px]`

**Changes**:
- Project header with name, description
- Blueprint list within the project using the same card grid
- Consistent with homepage card style

### 7. Tags Page (`/tags`)

**Layout**: `max-w-[1440px]`

**Changes**:
- Tag cloud or grid of `Badge` components
- Each tag shows name + count
- Clickable to filter blueprints by tag
- Use larger badge sizing with hover effects

### 8. User Profile (`/users/$userId`)

**Layout**: `max-w-[1000px]`

**Changes**:
- User avatar (shadcn `Avatar`, large) + name + role badge
- Grid of user's blueprints below, same card component

### 9. Login Page (`/login`)

**Layout**: Centered card, `max-w-md`

**Changes**:
- Centered `Card` with app logo/wordmark
- "Sign in with Google" button (shadcn `Button` variant outline, with Google icon)
- Minimal, clean, matches the new surface/background tokens

### 10. Admin Pages (`/admin/*`)

**Layout**: `max-w-[1440px]`

**Changes**:
- **Dashboard**: Stat cards using shadcn `Card` in `lg:grid-cols-4` grid, with Lucide icons and color accents
- **Management pages**: Replace raw lists with shadcn-styled tables or card lists, use `Select` for role changes, `Dialog` for delete confirmations (replacing `window.confirm`)
- Search inputs: Consistent with global search styling

---

## Dark Mode Implementation

### Strategy
- Use Tailwind's `class` strategy (`darkMode: "class"`)
- Toggle via a button in the header (sun/moon Lucide icon)
- Persist preference in `localStorage`, respect `prefers-color-scheme` as default
- Apply `.dark` class to `<html>` element

### Color Mapping
- All components use CSS custom properties that swap between `:root` and `.dark`
- Code blocks already use dark backgrounds — keep as-is in both modes
- Glassmorphism header adjusts opacity and blur for dark

---

## Migration Strategy

### Phase 1: Foundation
1. Install dependencies: `shadcn/ui`, `lucide-react`, Google Fonts (Manrope, Inter, Fira Code)
2. Configure Tailwind theme with Stitch color tokens as CSS custom properties
3. Initialize shadcn/ui, override theme CSS variables
4. Set up dark mode toggle infrastructure
5. Update `index.css` with font imports and CSS custom property definitions

### Phase 2: Shared Components
6. Redesign Header (top nav bar) with glassmorphism, global search, avatar dropdown
7. Create themed `BlueprintCard` component using shadcn `Card` + `Badge`
8. Create shared `FilterBar` component with pill-style filters
9. Create shared `PageHeader` component (title + subtitle pattern)
10. Update `MarkdownRenderer` code block styling (dark bg, terminal dots, filename)

### Phase 3: Page-by-Page
11. Homepage / All Blueprints — new grid, filters, card layout
12. Search Results — match badges, result count
13. Blueprint Detail — full redesign per spec (header, "when to use", bento grid)
14. Create/Edit Blueprint — form restyling
15. Projects List + Detail
16. Tags page
17. User Profile
18. Login page
19. Admin pages

### Phase 4: Polish
20. Dark mode testing across all pages
21. Animation and transition polish (hover lifts, scale effects, color transitions)
22. Loading states with `Skeleton` components
23. Replace all `window.confirm` calls with shadcn `Dialog`
24. Responsive testing (mobile, tablet, desktop, xl)

---

## Technical Considerations

- **No API changes**: This is purely a frontend reskin. All data fetching hooks remain unchanged.
- **i18n**: All user-facing strings continue to use Paraglide JS. No new strings unless UI labels change.
- **shadcn/ui is copy-paste**: Components live in `webapp/src/components/ui/` and are fully customizable. No runtime dependency.
- **CSS custom properties**: Define in `index.css`, consumed by both Tailwind config and shadcn theme. Single source of truth for colors.
- **Font loading**: Use `<link>` tags for Google Fonts in `index.html`, with `font-display: swap` for performance.
- **Bundle impact**: Lucide icons are tree-shakeable. shadcn adds no runtime bundle. Fonts are the main addition (~100-200KB).

## Success Criteria

- All pages visually match the Stitch design direction
- Light and dark mode work across all pages with no broken contrast
- No regressions in functionality — all existing features work identically
- `pnpm build` succeeds with no errors
- `pnpm test` passes
