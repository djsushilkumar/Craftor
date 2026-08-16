# Craftor — Complete Design System & Design Token Specification

**Document ID:** DS-SPEC-2026-001  
**Project:** Craftor — Universal MCP Platform for WordPress, Elementor & WooCommerce  
**Version:** 1.0.0 (Master Design System Baseline)  
**Status:** Approved for Monorepo & UI Implementation

---

## 1. Design Philosophy

### 1.1 Design Principles

Craftor’s design language fuses the hyper-refined aesthetics of **Linear**, the high-density editor ergonomics of **Cursor**, the geometric precision of **Vercel**, the native administrative harmony of **WordPress**, and the visual canvas fluency of **Elementor**.

```
                           ┌───────────────────────────────┐
                           │      CRAFTOR DESIGN DNA       │
                           └──────────────┬────────────────┘
                                          │
            ┌───────────────────┬─────────┴─────────┬───────────────────┐
            │                   │                   │                   │
    ┌───────▼───────┐   ┌───────▼───────┐   ┌───────▼───────┐   ┌───────▼───────┐
    │ 1. LINEAR     │   │ 2. CURSOR     │   │ 3. VERCEL     │   │ 4. WP & ELEM  │
    ├───────────────┤   ├───────────────┤   ├───────────────┤   ├───────────────┤
    │• Dark-first   │   │• Dense layout │   │• Monochrome   │   │• Native admin │
    │  sleekness    │   │• Live badges  │   │  geometry     │   │  integration  │
    │• Subtle glows │   │• Stream pulses│   │• Sub-pixel 1px│   │• Canvas visual│
    │• Crisp borders│   │• ⌘K palettes  │   │  borders      │   │  fluency      │
    └───────────────┘   └───────────────┘   └───────────────┘   └───────────────┘
```

1. **High Information Density with Zero Clutter:** Interface surfaces present deep diagnostic data, telemetry, and complex AST trees using structured grids, monospaced data badges, and progressive disclosure without overwhelming the user.
2. **Sub-Pixel Geometry & Crisp Boundaries:** Interfaces avoid heavy drop-shadows and thick containers, utilizing $1\text{px}$ translucent borders with subtle ambient glows to separate interactive layers.
3. **State Transparency & Streaming Fluency:** AI processes are never black boxes; every token generation, tool routing call, and canvas DOM mutation is reflected through micro-pulsing status dots, live stream progress bars, and instant visual diff highlights.
4. **Developer-Grade Keyboard Ergonomics:** Every interactive action—from opening tool schemas to approving visual diffs—is reachable via global hotkeys (`⌘K`, `Esc`, `Tab`, `Space`, `Enter`).

---

## 2. Design Tokens (Master Taxonomy)

Craftor design tokens are structured as vendor-agnostic semantic primitives categorized into 9 distinct physical domains:

```
@craftor/design-tokens
├── colors/          # HSL semantic and brand palette tokens
├── typography/      # Font family, weight, size, line-height, letter-spacing
├── spacing/         # 4px baseline spatial rhythm
├── radii/           # Boundary corner radius tokens
├── borders/         # Widths, styles, and sub-pixel stroke definitions
├── elevations/      # Ambient z-depth and backdrop blur filters
├── motion/          # Spring physics, bezier curves, and durations
├── opacity/         # Alpha transparency steps
└── z-index/         # Coordinated layer stack
```

---

## 3. HSL Color System

All colors are mathematically defined using the **HSL (Hue, Saturation, Lightness)** color space to enable seamless theme switching, dynamic alpha transparency blending, and strict WCAG 2.1 AA contrast ratios ($\ge 4.5:1$ for text, $\ge 3:1$ for UI controls).

### 3.1 Dark Theme (Default / Primary)

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                       DARK THEME HSL PALETTE MATRIX                                     │
├───────────────────┬──────────────────────┬─────────────┬───────────────────────────────────────────────┤
│ Semantic Token    │ HSL Value            │ Hex (Ref)   │ Purpose / Surface Application                 │
├───────────────────┼──────────────────────┼─────────────┼───────────────────────────────────────────────┤
│ `bg-canvas`       │ `hsl(222, 47%, 7%)`  │ `#090D16`   │ Base application background                   │
│ `bg-surface`      │ `hsl(222, 47%, 11%)` │ `#0F172A`   │ Dashboard cards, sidebars, modals             │
│ `bg-surface-hover`│ `hsl(222, 47%, 16%)` │ `#1E293B`   │ Interactive row and card hover state          │
│ `bg-surface-elev` │ `hsl(222, 47%, 20%)` │ `#293548`   │ Floating popovers, tooltips, dropdown menus   │
│ `border-subtle`   │ `hsl(222, 30%, 18%)` │ `#20293A`   │ Structural dividers, card borders             │
│ `border-focus`    │ `hsl(243, 75%, 59%)` │ `#6366F1`   │ Focus rings, active selection boundaries      │
│ `text-primary`    │ `hsl(210, 40%, 98%)` │ `#F8FAFC`   │ Headings, primary labels, high-contrast text  │
│ `text-secondary`  │ `hsl(215, 20%, 65%)` │ `#94A3B8`   │ Descriptions, metadata, secondary labels      │
│ `text-muted`      │ `hsl(215, 16%, 47%)` │ `#64748B`   │ Disabled text, placeholder text, timestamps   │
│ `primary`         │ `hsl(243, 75%, 59%)` │ `#6366F1`   │ Craftor Brand Indigo (Buttons, badges, links) │
│ `primary-hover`   │ `hsl(243, 75%, 68%)` │ `#818CF8`   │ Primary hover highlight state                 │
│ `accent-cyan`     │ `hsl(189, 94%, 43%)` │ `#06B6D4`   │ MCP Protocol stream, live telemetry accent    │
│ `accent-purple`   │ `hsl(270, 95%, 65%)` │ `#A855F7`   │ AI Agent Marketplace & Prompt accent          │
│ `diff-added`      │ `hsl(158, 64%, 52%)` │ `#10B981`   │ Injected nodes, successful execution badge    │
│ `diff-modified`   │ `hsl(38, 92%, 50%)`  │ `#F59E0B`   │ Modified parameters, pending approval border  │
│ `diff-deleted`    │ `hsl(0, 84%, 60%)`   │ `#EF4444`   │ Deleted AST nodes, destructive action alert   │
└───────────────────┴──────────────────────┴─────────────┴───────────────────────────────────────────────┘
```

### 3.2 Light Theme (WordPress Admin & Standard Mode)

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                       LIGHT THEME HSL PALETTE MATRIX                                    │
├───────────────────┬──────────────────────┬─────────────┬───────────────────────────────────────────────┤
│ Semantic Token    │ HSL Value            │ Hex (Ref)   │ Purpose / Surface Application                 │
├───────────────────┼──────────────────────┼─────────────┼───────────────────────────────────────────────┤
│ `bg-canvas`       │ `hsl(210, 40%, 98%)` │ `#F8FAFC`   │ Light background                              │
│ `bg-surface`      │ `hsl(0, 0%, 100%)`   │ `#FFFFFF`   │ Light cards, admin panels, tables             │
│ `bg-surface-hover`│ `hsl(210, 40%, 96%)` │ `#F1F5F9`   │ Row hover and secondary button background     │
│ `bg-surface-elev` │ `hsl(0, 0%, 100%)`   │ `#FFFFFF`   │ Modals, popovers with drop shadow             │
│ `border-subtle`   │ `hsl(214, 32%, 91%)` │ `#E2E8F0`   │ Card borders, table dividers                  │
│ `border-focus`    │ `hsl(243, 75%, 59%)` │ `#6366F1`   │ Focus rings                                   │
│ `text-primary`    │ `hsl(222, 47%, 11%)` │ `#0F172A`   │ Primary dark text                             │
│ `text-secondary`  │ `hsl(215, 16%, 47%)` │ `#64748B`   │ Subheadings, table column headers             │
│ `text-muted`      │ `hsl(215, 20%, 65%)` │ `#94A3B8`   │ Disabled text, placeholder                    │
│ `primary`         │ `hsl(243, 75%, 59%)` │ `#6366F1`   │ Brand Indigo                                  │
│ `primary-hover`   │ `hsl(243, 75%, 50%)` │ `#4F46E5`   │ Darker indigo for high-contrast light hover   │
│ `diff-added`      │ `hsl(158, 64%, 40%)` │ `#059669`   │ Darkened emerald for light mode contrast      │
│ `diff-modified`   │ `hsl(38, 92%, 44%)`  │ `#D97706`   │ Darkened amber for light mode contrast        │
│ `diff-deleted`    │ `hsl(0, 84%, 55%)`   │ `#DC2626`   │ Darkened crimson for light mode contrast      │
└───────────────────┴──────────────────────┴─────────────┴───────────────────────────────────────────────┘
```

---

## 4. Typography System

Craftor uses **Inter** for all interface typography and **JetBrains Mono** for code blocks, JSON-RPC packet payloads, UUIDs, and tool signatures.

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                       CRAFTOR TYPE SCALE MATRIX                                        │
├───────────────────┬──────────────┬────────────┬─────────────┬──────────────┬───────────────────────────┤
│ Type Scale Step   │ Font Size    │ Rem Units  │ Line Height │ Letter-Space │ Recommended Usage         │
├───────────────────┼──────────────┼────────────┼─────────────┼──────────────┼───────────────────────────┤
│ `display-2xl`     │ `40px`       │ `2.5rem`   │ `48px (1.2)`│ `-0.03em`    │ Marketing hero headlines  │
│ `display-xl`      │ `32px`       │ `2.0rem`   │ `40px (1.25)`│`-0.025em`   │ Main dashboard headers    │
│ `heading-lg`      │ `24px`       │ `1.5rem`   │ `32px (1.33)`│`-0.02em`    │ Section title, modal title│
│ `heading-md`      │ `20px`       │ `1.25rem`  │ `28px (1.4)`│ `-0.015em`   │ Card titles, drawer header│
│ `body-base`       │ `14px`       │ `0.875rem` │ `20px (1.43)`│`-0.005em`   │ Standard body, table data │
│ `body-sm`         │ `13px`       │ `0.8125rem`│ `18px (1.38)`│`0.0em`      │ Descriptions, form labels │
│ `caption-xs`      │ `11px`       │ `0.6875rem`│ `16px (1.45)`│`+0.02em`     │ Badges, timestamps, pills │
│ `code-mono`       │ `12px`       │ `0.75rem`  │ `18px (1.5)`│ `-0.01em`    │ JSON AST, UUIDs, Tool IDs │
└───────────────────┴──────────────┴────────────┴─────────────┴──────────────┴───────────────────────────┘
```

### Font Weights:

- `Regular`: `400` (Body copy, descriptions, JSON string values)
- `Medium`: `500` (Form labels, table headers, menu items)
- `Semibold`: `600` (Card titles, active tabs, buttons, status pills)
- `Bold`: `700` (Main headings, display numbers, metrics)

---

## 5. Spatial Grid, Radii, Elevation & Motion Tokens

### 5.1 Spacing Tokens (4px Baseline Grid)

`--crf-space-1: 4px` • `--crf-space-2: 8px` • `--crf-space-3: 12px` • `--crf-space-4: 16px` • `--crf-space-5: 20px` • `--crf-space-6: 24px` • `--crf-space-8: 32px` • `--crf-space-10: 40px` • `--crf-space-12: 48px` • `--crf-space-16: 64px`

### 5.2 Radius Tokens

- `--crf-radius-sm: 4px` (Small tags, inner badges, input checkboxes)
- `--crf-radius-md: 6px` (Standard buttons, text input fields, dropdown items)
- `--crf-radius-lg: 10px` (Cards, modal dialogs, drawer panels, popovers)
- `--crf-radius-xl: 16px` (Large preview containers, dashboard hero panels)
- `--crf-radius-full: 9999px` (Pills, user avatars, live streaming status dots)

### 5.3 Elevation & Shadow Tokens

- `--crf-shadow-subtle`: `0 1px 2px 0 rgba(0, 0, 0, 0.25)` (Flat cards)
- `--crf-shadow-card`: `0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -2px rgba(0, 0, 0, 0.3)` (Standard card)
- `--crf-shadow-popover`: `0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -4px rgba(0, 0, 0, 0.4)` (Dropdowns/Modals)
- `--crf-shadow-glow-indigo`: `0 0 20px -2px rgba(99, 102, 241, 0.35)` (Active AI streaming border highlight)
- `--crf-shadow-glow-emerald`: `0 0 20px -2px rgba(16, 185, 129, 0.35)` (Verified diff / Snapshot active)

### 5.4 Motion & Transition Tokens

- **Standard Easing:** `cubic-bezier(0.16, 1, 0.3, 1)` (Linear / Vercel spring-feel curve)
- **Duration Fast:** `120ms` (Button hover, tab switch, focus ring glow)
- **Duration Base:** `200ms` (Dropdown expansion, card slide-in, modal fade)
- **Duration Smooth:** `350ms` (Drawer opening, visual diff split-slider movement)

---

## 6. Core Component Library Specifications

### 6.1 Buttons (`Button`)

```
[ Anatomy: Icon (Optional) + Label + Shortcut Badge (Optional) ]
```

- **Variants:**
  - `Primary`: Background `--crf-color-primary`, Text `#FFF`, Shadow `--crf-shadow-glow-indigo` on hover.
  - `Secondary`: Background `--crf-color-surface-hover`, Border `1px solid --crf-color-border-subtle`, Text `--crf-color-text-primary`.
  - `Ghost`: Background `transparent`, Hover `bg-surface-hover`, Text `--crf-color-text-secondary`.
  - `Danger`: Background `rgba(239, 68, 68, 0.15)`, Border `1px solid #EF4444`, Text `#EF4444`.
- **Sizes:** `sm` (28px height, text-xs), `md` (36px height, text-base), `lg` (44px height, text-md).

### 6.2 Data Tables (`DataTable`)

- Header row sticky with background `--crf-color-surface-hover`.
- Row borders: Sub-pixel `1px solid --crf-color-border-subtle`.
- Row hover transition: Background fades to `--crf-color-surface-hover` in $120\text{ms}$.
- Monospaced alignment: Numeric data, UUIDs, dates, and latency metrics right-aligned or fixed font width.

### 6.3 Modal Dialogs & Drawers (`Modal` & `Drawer`)

- Backdrop overlay: `rgba(9, 13, 22, 0.75)` with `backdrop-filter: blur(8px)`.
- Entrance animation: Scale `0.96` to `1.0` and opacity `0` to `1` in $200\text{ms}$.
- Dismissal: Clicking backdrop or pressing `Escape` triggers smooth exit.

---

## 7. Domain-Specific Component Blueprints

### 7.1 The 4-Registry Component Suite

#### Tool Registry Card Component:

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│ [🧰 Icon] `elementor_create_container`                  [ v1.2.0 ] [ Edit_Posts ]│
│                                                                                 │
│ Inserts a modern Flexbox or CSS Grid Container into the active Elementor AST.   │
│                                                                                 │
│ ┌─────────────────────────────────────────────────────────────────────────────┐ │
│ │ Args: page_id (int, req), flex_direction (enum: row|col), justify (enum)    │ │
│ └─────────────────────────────────────────────────────────────────────────────┘ │
│ Category: Layout AST  │ Tokens: ~140 tok  │ [ Inspect Schema ] [ Test in Sandbox]│
└─────────────────────────────────────────────────────────────────────────────────┘
```

#### Skill Registry Card Component:

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│ [🧠 Skill] `craftor-elementor-engineer`                       [ Accuracy: 99.2% ]│
│                                                                                 │
│ Autonomous skill mastering Flexbox/Grid AST manipulation & canvas live-sync.    │
│ Bound Tools: 65 Active Tools  │ Gold Benchmark Tests: 48/48 Passed ✅           │
│                                                                                 │
│ [ 📄 View SKILL.md ]    [ 🧪 Run Evals ]    [ 📋 Copy Prompt Template ]         │
└─────────────────────────────────────────────────────────────────────────────────┘
```

#### Agent Marketplace Card Component:

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│ [🦾 Agent Persona] Visual Page Builder Agent               [ Official Verified ]│
│                                                                                 │
│ Specialized agent persona for crafting high-converting responsive landing pages.│
│ Pre-loaded Skills: `craftor-elementor-engineer` + `craftor-ui-ux-designer`       │
│                                                                                 │
│ [ ⚡ Deploy to Workspace ]                      [ ⚙️ Configure Guardrails ]      │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

### 7.2 Dashboard Components

- **Site Health Card:** Includes pulsing status dot (Green = Active, Amber = Pending Update, Red = Unreachable), tier badge (Core, Pro, Enterprise), and connected AI client chips (`Cursor`, `Claude`).
- **Telemetry Metric Card:** Large display metric (`$42.10 Spent`, `14,209 Tool Calls`, `38ms Latency`) accompanied by a $+12.4\%$ trend pill and sparkline trend graph.
- **AI Provider Vault Card:** Masked key preview with 1-click reveal, connection latency ping tester (`[ Test Ping ]`), and token spend meter.

---

### 7.3 WordPress Plugin Components

- **Snapshot History Item:**
  - UUID badge in `JetBrains Mono` (`snp_8f921a`).
  - Relative timestamp (`3 mins ago`).
  - Target entity pill (`Page #104: Home`).
  - Action buttons: `[ 🔍 Visual Diff ]` and `[ ⏪ Instant Rollback ]`.
- **MCP Status Banner:**
  - Active port and transport badges (`Port 8080`, `stdio active`, `SSE 1 stream`).
  - Token security status (`AES-256 Hashed`).

---

### 7.4 Elementor Canvas Floating HUD

- **Floating Position:** Top-center or bottom-right of the active Elementor canvas iframe.
- **Design:** Pill-shaped glassmorphic bar (`rgba(15, 23, 42, 0.85)` with `backdrop-filter: blur(12px)`).
- **Live Ingestion Pulse:** When AI is injecting nodes, an Emerald glow border pulses rhythmically (`animation: pulse 1.5s infinite`).
- **Streaming Token Counter:** Displays real-time token ingestion count (`Ingested: 342 tokens`).
- **Instant Step Revert:** `[ ⏪ Revert Step ]` button instantly restores the preceding micro-checkpoint without leaving the canvas.

---

## 8. Accessibility & Responsive Systems

### 8.1 WCAG 2.1 AA Compliance Matrix

- **Contrast:** Every text element against its surface guarantees $\ge 4.5:1$ contrast ratio.
- **Focus States:** Every interactive element has an unambiguous $2\text{px}$ focus ring with $2\text{px}$ offset (`outline: 2px solid hsl(243, 75%, 59%); outline-offset: 2px`).
- **ARIA Semantic Markup:**
  - Modals have `role="dialog"` and `aria-modal="true"`.
  - Diff viewer sliders have `role="slider"` with `aria-valuenow` and `aria-valuetext`.
  - Status badges have `aria-live="polite"` for dynamic connection updates.

### 8.2 Responsive Breakpoint System

```
┌────────────────────────────────────────────────────────────────────────────────┐
│                               BREAKPOINT TOKENS                                │
├─────────────────┬──────────────┬───────────────────────────────────────────────┤
│ Breakpoint Step │ Min-Width    │ Target Screen Environment                     │
├─────────────────┼──────────────┼───────────────────────────────────────────────┤
│ `sm`            │ `640px`      │ Mobile landscape, compact drawer sheets       │
│ `md`            │ `768px`      │ Tablet portrait, WordPress admin collapsed    │
│ `lg`            │ `1024px`     │ Tablet landscape, standard laptop             │
│ `xl`            │ `1280px`     │ Desktop widescreen, dual-column diff view     │
│ `2xl`           │ `1536px`     │ Ultra-wide monitors, 4-registry canvas matrix │
└─────────────────┴──────────────┴───────────────────────────────────────────────┘
```

---

## 9. Micro-Interactions & Animation Specs

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                     MICRO-INTERACTION SPECIFICATIONS                                   │
├───────────────────┬────────────────────────────┬─────────────────────────────┬─────────────────────────┤
│ Trigger Event     │ Animated Element           │ Motion Transform            │ Timing / Bezier         │
├───────────────────┼────────────────────────────┼─────────────────────────────┼─────────────────────────┤
│ Button Hover      │ Background & Glow          │ Scale: `1.0` -> `1.02`      │ `120ms` ease-out        │
│                   │                            │ Box-Shadow: Glow expand     │                         │
├───────────────────┼────────────────────────────┼─────────────────────────────┼─────────────────────────┤
│ Node Ingestion    │ Elementor Canvas Container │ Border: 2px Emerald pulse   │ `1.5s` infinite loop    │
│ (AI Streaming)    │                            │ Opacity: `0.85` -> `1.0`    │                         │
├───────────────────┼────────────────────────────┼─────────────────────────────┼─────────────────────────┤
│ Diff Slider Drag  │ Split Divider Line         │ TranslateX跟随 cursor       │ Direct `0ms` sync       │
│                   │ Before/After clip-path     │ `clip-path: polygon(...)`   │                         │
├───────────────────┼────────────────────────────┼─────────────────────────────┼─────────────────────────┤
│ Rollback Trigger  │ Snapshot Row               │ Background flash to Amber   │ `300ms` decay to normal │
│                   │ Toast Notification         │ Slide-up from bottom-right  │ `200ms` spring entrance │
├───────────────────┼────────────────────────────┼─────────────────────────────┼─────────────────────────┤
│ Tool Copy Snippet │ "Copy Config" Button       │ Icon morphs to Checkmark    │ `150ms` snap transition │
│                   │ Tooltip                    │ "Copied to Clipboard!"      │ Displays for 2000ms     │
└───────────────────┴────────────────────────────┴─────────────────────────────┴─────────────────────────┘
```

---

_This specification establishes the official Design System for Craftor. All monorepo UI packages, WordPress admin styles, and Next.js dashboard components must strictly consume these token definitions and interaction rules._
