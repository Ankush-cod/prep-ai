---
name: Precision Canvas
colors:
  surface: '#111319'
  surface-dim: '#111319'
  surface-bright: '#373940'
  surface-container-lowest: '#0c0e14'
  surface-container-low: '#191b22'
  surface-container: '#1e1f26'
  surface-container-high: '#282a30'
  surface-container-highest: '#33343b'
  on-surface: '#e2e2eb'
  on-surface-variant: '#b9cacb'
  inverse-surface: '#e2e2eb'
  inverse-on-surface: '#2e3037'
  outline: '#849495'
  outline-variant: '#3b494b'
  surface-tint: '#00dbe9'
  primary: '#dbfcff'
  on-primary: '#00363a'
  primary-container: '#00f0ff'
  on-primary-container: '#006970'
  inverse-primary: '#006970'
  secondary: '#c0c1ff'
  on-secondary: '#1000a9'
  secondary-container: '#3131c0'
  on-secondary-container: '#b0b2ff'
  tertiary: '#d8ffe7'
  on-tertiary: '#003824'
  tertiary-container: '#65f2b5'
  on-tertiary-container: '#006d4a'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#7df4ff'
  primary-fixed-dim: '#00dbe9'
  on-primary-fixed: '#002022'
  on-primary-fixed-variant: '#004f54'
  secondary-fixed: '#e1e0ff'
  secondary-fixed-dim: '#c0c1ff'
  on-secondary-fixed: '#07006c'
  on-secondary-fixed-variant: '#2f2ebe'
  tertiary-fixed: '#6ffbbe'
  tertiary-fixed-dim: '#4edea3'
  on-tertiary-fixed: '#002113'
  on-tertiary-fixed-variant: '#005236'
  background: '#111319'
  on-background: '#e2e2eb'
  surface-variant: '#33343b'
typography:
  headline-xl:
    fontFamily: Geist
    fontSize: 36px
    fontWeight: '600'
    lineHeight: 44px
    letterSpacing: -0.03em
  headline-xl-mobile:
    fontFamily: Geist
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Geist
    fontSize: 18px
    fontWeight: '500'
    lineHeight: 26px
    letterSpacing: -0.015em
  headline-sm:
    fontFamily: Geist
    fontSize: 15px
    fontWeight: '500'
    lineHeight: 22px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 22px
    letterSpacing: -0.01em
  body-md:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: -0.005em
  body-sm:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 18px
    letterSpacing: 0em
  label-md:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.04em
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 10px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0.06em
  code-inline:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 18px
    letterSpacing: 0em
spacing:
  gutter: 1rem
  gutter-compact: 0.5rem
  margin: 1.5rem
  margin-mobile: 1rem
  space-2xs: 0.125rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1rem
  space-xl: 1.5rem
  space-2xl: 2rem
---

## Brand & Style

The design system establishes a high-density, hyper-technical environment engineered for rigorous technical workflows and deep computational focus. It bridges the architectural purity of modern developer tooling with structural, data-dense clarity. The interface acts as a silent substrate: unobtrusive, impeccably aligned, and visually restrained, allowing code, complex schemas, and telemetry to stand at the forefront.

### Design Movement: High-Density Technical Modernism
The visual language rejects decorative ornamentation, soft skeuomorphism, and heavy dimensional drop-shadows. Instead, it relies on:
- **Structural Orthogonality:** Pure 90-degree rectilinear framing, zero corner rounding, and razor-sharp perimeter delineation.
- **Surgical Grid Hierarchy:** Spatial discipline governed by sub-pixel-crisp 1px borders, subtle tonal layering, and systematic tabular layout structures.
- **Functional Luminescence:** Monochromatic foundational surfaces lit by high-chroma electrical micro-accents to denote state, active compilation, and telemetry branches.

The emotional signature is austere, highly competent, reliable, and laser-focused—engineered for practitioners who value speed, terminal-grade density, and uncompromising typography.

## Colors

The palette is engineered dark-first, anchored by obsidian and slate base tiers that prevent ocular strain during prolonged sessions while maintaining pure contrast.

### Palette Architecture
- **Canvas Base (`#090A0F`):** Deepest void background for root viewports and terminal backgrounds.
- **Surface Elevation 1 (`#0F1117`):** Primary canvas surface for workbenches, panels, and editors.
- **Surface Elevation 2 (`#181B26`):** Elevated cards, contextual drawers, toolbars, and active cell backdrops.
- **Structural Borders:**
  - Subtle Border: `#222738` (structural gridlines, data dividers).
  - Prominent Border: `#2E364F` (active element perimeters, tab highlights, focused containers).

### Functional & Branch Accents
- **Primary / CSE Track (`#00F0FF`):** Radiant electric cyan reserved for primary actions, current execution pointers, active focus frames, and computer science workflows.
- **Secondary / Deep Core (`#6366F1`):** Electric indigo utilized for syntactic structure, structural linkage, and selection halos.
- **ECE Track (`#10B981`):** Emerald / Teal representing electronics, automated tests passing, and operational health.
- **EE Track (`#F59E0B`):** Amber / Gold indicating electrical engineering modules, warnings, and compilation pending.
- **ME Track (`#F43F5E`):** Crimson / Coral indicating mechanical systems, critical telemetry, and fatal errors.

### Text Contrast Tiers
- **Text Strong:** `#FFFFFF` (headings, code literals, key metrics).
- **Text Standard:** `#CBD5E1` (body prose, parameter names, standard interfaces).
- **Text Muted:** `#64748B` (metadata, line counts, inactive breadcrumbs, comments).
- **Text Faint:** `#334155` (unselected borders, line guide grids).

## Typography

The typographic hierarchy implements an intentional division of labor between `Geist` (for executive headers, pane titles, and navigation wayfinding) and `JetBrains Mono` (for content body, execution data, logs, inputs, and analytical labels).

### Hierarchical Usage
- **Geist (Sans):** Reserved strictly for structural orientation (`headline-xl` through `headline-sm`). Its tight tracking, geometric curves, and neutral stroke profile provide authority and rapid visual scanning across multiple columns without clashing with dense code blocks.
- **JetBrains Mono (Monospace):** Drives all analytical content, system values, configuration inputs, and default body copy. Tabular numbers (`tnum`) must remain enabled across the entire interface to ensure columns, timestamps, and memory offsets align on pixel grids.

### Case and Tracking Discipline
- Section headers and micro-labels (`label-sm`, `label-md`) use uppercase casing accompanied by expanded tracking (`0.04em` to `0.06em`) to preserve legibility at miniature sizes on high-DPI screens.
- Inline code blocks within narrative panels adopt the exact font-metrics of the parent text tier, distinguished solely through subtle syntax tinting and background plate delimiters.

## Layout & Spacing

The layout model is governed by high-density, multi-panel modular canvases designed to optimize horizontal and vertical real estate.

### Grid & Composition Architecture
- **Panel Systems:** 24-column flexible grid system designed for IDE-style multi-pane layouts (file tree, code editor, test console, diagnostic terminal).
- **Margins & Gutters:** A base desktop margin of `1.5rem` (`margin`) contracts to `1rem` (`margin-mobile`) on mobile viewports. Interior pane gutters default to `1rem` (`gutter`), with a dense `0.5rem` (`gutter-compact`) variant for code inspectors and property sheets.
- **Density Principles:** Compact component paddings (`space-xs` to `space-md`) prevent vertical bloat. Spacing must remain deterministic and mathematical, adhering to a 4px/8px base rhythm.

### Responsive Breakpoints & Viewport Reflow
- **Desktop (>= 1280px):** Multi-pane split screen. All primary toolbars, navigation trees, and diagnostics are pinned side-by-side with zero overlay modals.
- **Tablet (768px - 1279px):** Split-view folds secondary inspectors into collapsible right-hand drawers. Gutters remain at `0.75rem`.
- **Mobile (< 768px):** Single-pane sequential layout. Workbenches shift to a tabbed switchboard architecture with bottom execution bars.

## Elevation & Depth

Depth is established through tectonic layering and 1px border lines rather than diffuse drop shadows. This preserves the precision of an engineering CAD or modern command-line interface.

### Elevation Stacking Tiers
1. **Tier 0 (Root Base `#090A0F`):** Canvas backdrop, terminal viewports, and outer shell boundaries.
2. **Tier 1 (Surface Canvas `#0F1117`):** Default panel level, divided by `1px solid #222738` interior structural lines.
3. **Tier 2 (Elevated Cells & Cards `#181B26`):** Active workspaces, interactive cards, and segmented toolbars, defined by `1px solid #2E364F`.
4. **Tier 3 (Floating Elements / Flyouts `#181B26`):** Context menus, tooltips, and command palettes. Elevated solely by higher border contrast (`#3A4463`) and a crisp, zero-spread micro-shadow: `0 4px 12px rgba(0, 0, 0, 0.6)`.

### Border-First Definition
Every container, status block, and pane separator relies on crisp borders. Overlapping surfaces never bleed into one another; they lock into an interlocking, orthogonal mosaic.

## Shapes

The geometric architecture is uncompromisingly sharp (`roundedness: 0`). 

### Orthogonal Discipline
- **Zero Radius:** All corners, including buttons, modals, cards, badges, tabs, and input fields, feature strict 90-degree squared corners (`border-radius: 0px`).
- **Precision Cuts:** No curves or organic contours are permitted. High-tech visual differentiation is produced exclusively through rectangular framing, precise geometric icons, and razor-sharp border strokes.
- **Symmetry:** Asymmetric padding or slanted decorative edges are prohibited. Every shape conforms to an absolute technical grid.

## Components

### Buttons
- **Primary:** Background `#00F0FF`, text `#090A0F` (bold mono), border `1px solid #00F0FF`. Hover: background `#38F4FF`, subtle glow via outer border highlight.
- **Secondary:** Background `#181B26`, text `#CBD5E1`, border `1px solid #2E364F`. Hover: border `#00F0FF`, text `#FFFFFF`.
- **Ghost / Tool:** Background transparent, text `#64748B`, border `1px solid transparent`. Hover: background `#181B26`, text `#CBD5E1`, border `1px solid #222738`.
- **Dimensions:** High density (height `28px` for compact, `32px` for standard), padding `0 12px`. Zero border-radius.

### Precision Badge Pills & Micro-Tags
- Rectangular micro-containers with height `20px`, padding `0 6px`, font `label-sm`.
- **Branch Badges:**
  - CSE: Background `rgba(0, 240, 255, 0.08)`, border `1px solid rgba(0, 240, 255, 0.3)`, text `#00F0FF`.
  - ECE: Background `rgba(16, 185, 129, 0.08)`, border `1px solid rgba(16, 185, 129, 0.3)`, text `#10B981`.
  - EE: Background `rgba(245, 158, 11, 0.08)`, border `1px solid rgba(245, 158, 11, 0.3)`, text `#F59E0B`.
  - ME: Background `rgba(244, 63, 94, 0.08)`, border `1px solid rgba(244, 63, 94, 0.3)`, text `#F43F5E`.

### Razor-Sharp Tabs
- Horizontal strip height `36px`, border-bottom `1px solid #222738`.
- Inactive: Text `#64748B`, border-bottom `2px solid transparent`, padding `0 16px`.
- Active: Text `#FFFFFF`, background `#181B26`, border-bottom `2px solid #00F0FF`, border-top `1px solid #2E364F`, border-left `1px solid #222738`, border-right `1px solid #222738`.

### Input Fields & Terminal Consoles
- Height `32px`, background `#090A0F`, border `1px solid #222738`, text `#FFFFFF`, font `JetBrains Mono` (`body-sm`).
- Focus state: Border `1px solid #00F0FF`, zero outline ring.
- Placeholder: Text `#334155`.

### Checkboxes & Radio Selectors
- Strictly square (`14px x 14px`), border `1px solid #2E364F`, background `#0F1117`.
- Checked: Fill `#00F0FF`, interior indicator `#090A0F` (solid square for checkbox, inner cross or inverted core for radio). Zero rounding.

### Data-Dense Cards
- Background `#0F1117`, border `1px solid #222738`, zero border radius, zero shadow.
- Header block separated by `1px solid #222738` with padding `space-sm space-md`.
- Hover state (interactive cards): Border shifts to `#2E364F`, card header title glows `#00F0FF`.

### Code Blocks & Telemetry Tables
- Row height `24px` to `28px` with alternating subtle stripe backgrounds (`#0F1117` and `#12151D`).
- Active line highlight: `1px solid rgba(0, 240, 255, 0.2)` bounding box with transparent cyan fill `rgba(0, 240, 255, 0.03)`.
- Status column pins a 2px vertical colored strip corresponding to branch or status directly against the left edge.