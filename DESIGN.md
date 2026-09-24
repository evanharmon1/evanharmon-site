# The Almanac — Design System

The brand and design system for **evanharmon.com**.

> **Aesthetic in one line:** an aged-paper, woodcut-engraving almanac — antique
> serif typography, gilt ornaments, a tactile printed grain, and bold
> colour-block sections, rendered in a light "Parchment" theme and a dark
> "Midnight" theme.

This file is the **AI-facing statement of intent**. The **canonical runtime
token source is [`src/styles/globals.css`](src/styles/globals.css)** — when the two
disagree, `globals.css` wins for runtime. Stack: **Astro + Tailwind CSS v4**
(CSS-first `@theme`), with **shadcn/ui** wired onto these tokens via a thin role
layer, and **Lucide** for icons.

**Version `1.1.0`.** Changes are recorded as Design Decision Records in
[`docs/design/decisions/`](docs/design/decisions/).

---

## 1. Brand

### 1.1 Personality

A technologist's almanac — equal parts engineer's notebook and 18th-century
broadsheet. Precise and literate, with dry wit. It treats a personal site like a
finely-printed object: numbered sections ("No. 1 — About"), engraved rules,
foil-stamped ornaments.

- **Voice:** literate, wry, understated. "Cantankerous contraptions &
  philosophical piffle." Favour the archaic register ("Send a word", "Elsewhere
  on the machines") but never at the expense of clarity.
- **Tone words:** crafted · antiquarian · tactile · confident · quiet.
- **Avoid:** startup-speak, emoji, neon gradients, drop-shadow card soup, sans-serif body text.

### 1.2 Logo / wordmark

- **Wordmark:** "Evan Harmon" set in the display serif (Cormorant Garamond 600).
- **Monogram:** `EH` in the cover serif (Old Standard TT), inside a gilt circle
  with a double inset keyline — the brand-mark (`BrandMark.astro`, also the
  favicon). 32 px in the header.
- **Clear space:** keep at least the height of the "E" around the wordmark.

### 1.3 Motifs

- **Numbered sections** — each major section carries a fancy numeral ("No. I",
  "No. II"…). On the homepage these sit in the eyebrow cluster above the title.
- **Engraved dividers** — a central diamond `❖` flanked by leaf fleurons `❧` and
  hairline rules (`Divider.astro`).
- **Gilt ornaments** — the heart `❦` (crest), diamond `❖` (dividers, nav
  separators), leaf `❧` (seals, divider sides).
- **Printed grain** — a fine, irregular film grain laid over every surface that
  **scrolls with the page** (it is part of the material, not a screen filter).
---

## 2. Colour

Dual-theme: a light **Parchment** theme (brand-primary palette) and a dark
**Midnight** theme. The site **boots in Midnight** (the live default); a saved
choice always wins. Colours are semantic CSS variables (`--c-*`) that swap per
theme; Tailwind utilities (`bg-paper`, `text-ink`, `text-accent`…) are
theme-aware. Raw hex lives only in the theme blocks of `globals.css`.

### 2.1 Parchment — light (brand-primary palette)

| Token        | Hex                 | Role                                              |
| ------------ | ------------------- | ------------------------------------------------- |
| `paper`      | `#efe6d0`           | Page background                                   |
| `paper-2`    | `#e5d9bb`           | Tinted band / raised surfaces                     |
| `paper-edge` | `#d7c8a2`           | Deepest paper edge                                |
| `ink`        | `#181410`           | Primary text                                      |
| `ink-soft`   | `#443928`           | Secondary text / body                             |
| `ink-faint`  | `#8b7c5c`           | Muted labels, captions                            |
| `line`       | `#c6b78d`           | Hairline borders                                  |
| `rule`       | `#9c8757`           | Stronger rules, engraved keylines                 |
| `accent`     | `#1d6b41`           | **Deep garden green** — eyebrows, numerals, links |
| `gold`       | `#b08016`           | Gilt — brand-mark, icon buttons, ornaments        |
| `blue`       | `#1f4f86`           | Secondary accent                                  |
| `error`      | `#9e2b1e`           | Madder/oxblood — invalid fields, error notes      |
| CTA block    | `#143524`→`#1f4b33` | Green colour-block (hero, "Let's Talk")           |

### 2.2 Midnight — dark

| Token     | Hex                 | Role                                |
| --------- | ------------------- | ----------------------------------- |
| `paper`   | `#141925`           | Page background (faint blue-black)  |
| `ink`     | `#f1e6c9`           | Primary text (warm cream)           |
| `accent`  | `#e9ad3a`           | **Vivid gold** — eyebrows, numerals |
| `gold`    | `#e9ad3a`           | Gilt                                |
| `blue`    | `#7fa8d8`           | Secondary accent                    |
| `error`   | `#e08a7a`           | Terracotta — invalid fields, notes  |
| CTA block | `#101a30`→`#18284a` | Blue colour-block                   |

(Full Midnight set lives in `globals.css`.)

### 2.3 Foil & fixed colours

These do **not** swap by theme and are the only sanctioned raw-hex values outside
the token blocks:

- **Foil gradient** (cover crest): `#f3dc9a` → `#c89a3d` → `#8f6620`.
- **CTA on-block text:** warm white `#f4eedd` (headings, `--color-cta-ink`),
  `#efe2c3` (body, `--color-cta-body`).
- **Dark text on gilt buttons:** `#241803`.

### 2.4 Usage rules

- **One accent per theme.** Green carries the light theme; gold carries the dark.
  Never introduce a new hue per section — use type, scale, and the tint band for
  rhythm instead.
- **Accent is for emphasis, not fields:** eyebrows, numerals, link/hover states,
  ornaments. Body text is always `ink` / `ink-soft`.
- **Colour-blocks** (hero & contact) are the only "filled" surfaces — green on
  light, blue on dark — always carrying gold foil ornaments and warm-white text.
- **Alternating sections:** plain `paper` → tinted `paper-2` band → plain →
  colour-block.
- **Error is the one sanctioned non-accent hue.** `error` (madder `#9e2b1e` on
  light, terracotta `#e08a7a` on dark) is reserved for validation — the invalid
  field keyline and the `.field-error` note — never for decoration or emphasis.

---

## 3. Typography

| Role                 | Family                   | Notes                           |
| -------------------- | ------------------------ | ------------------------------- |
| **Display**          | Cormorant Garamond, 600  | Headings, wordmark, hero title  |
| **Body**             | EB Garamond              | Paragraphs, UI text             |
| **Label / eyebrow**  | EB Garamond, small-caps  | Eyebrows, nav, tags, dates      |
| **Cover / monogram** | Old Standard TT          | Brand-mark `EH`, crest          |
| **Numerals**         | Playfair Display, italic | Section "No." + catalog numbers |

Self-hosted via `@fontsource/*` (all OFL). Roles are declared under `@theme` as
`--font-display`, `--font-body`, `--font-numeral`, `--font-cover`.

Fluid `clamp()` scale (`--text-hero`, `--text-cta`, `--text-section`, …) lives in
`globals.css @theme`. Display: `line-height ~1.0`, `letter-spacing 0.004em`,
`text-wrap: balance`, 1px emboss. Body: `1.62` leading, max measure ~52–62ch.
Eyebrows/labels/nav: small-caps, uppercase, widely tracked (`0.16`–`0.28em`).
Numerals: always Playfair Display italic in `accent`. The bio uses a raised
drop-cap initial.

---

## 4. Layout & spacing

- **Container:** `width: min(1140px, 92vw)`, centred (the `wrap` utility).
- **Section rhythm:** `padding-block: clamp(2.25rem, 4.5vw, 4rem)` (`--spacing-section`).
- **Catalog grid (Projects):** 2 columns, hairline dividers between cells; single
  column below 860px.
- **Ledger (Blog):** `date | title + excerpt | category` rows, hairline separators.
- **Radii:** sharp (`0`) for engraved rectangles and cards; circles (`50%`) for
  the brand-mark, header icon buttons, and social icons (32–40 px).
- **Elevation — "engraving", not "float".** Depth is drawn with inset keylines
  (the `engraved` / `gilt-ring` utilities), not soft drop shadows. Reserve true
  drop shadows for nothing on this site.

---

## 5. Ornaments & texture

| Ornament             | Glyph       | Use                        |
| -------------------- | ----------- | -------------------------- |
| Divider              | `❧ — ❖ — ❧` | Between sections           |
| Section / hero crest | `❦`         | Above CTA headings         |
| Nav separator        | `❖`         | Between header links       |
| Seal                 | `❧`         | Top-right of catalog cards |

**The printed grain** (`grain-overlay`): a fine monochrome noise PNG
(`public/grain-noise.png`, 400 px tile) laid as an **absolutely-positioned layer
spanning the whole document** so it scrolls with the content.
`opacity: var(--grain-strength, 0.36)`, `z-index: 50`, `pointer-events: none`.
It must **not** be `position: fixed` — that breaks the printed-material illusion.

---

## 6. Components

Built as pure Astro under `src/components/almanac/`, styled only with the
semantic tokens:

- **Header** — sticky, translucent `paper` with `backdrop-filter`; brand-mark +
  wordmark left, ❖-separated nav + gilt theme-toggle + RSS right, gilt rule beneath.
- **Button** (`Button.astro`) — variants `default | solid | invert | ghost`;
  engraved keylines; `invert`/`ghost` are for the colour-block.
- **Hero** — the "Celestial" colour-block band with the large foil wordmark.
- **About** — drop-cap bio + the whimsical "register" of tallies.
- **Projects** — engraved 2-col catalog with Playfair-italic numerals + `❧` seals.
- **Blog** (`BlogLedger`) — the ledger of posts.
- **Contact** — the closing `❦` colour-block.
- **SocialIcon** — gilt circles with monochrome logos/monograms + hover tooltip.

**Brand marks & specimens** (used on `/brand`, available for reuse):

- **BrandMark** (`BrandMark.astro`) — the gilt `EH` monogram in a gilt-ring circle.
- **Crest** (`Crest.astro`) — the ceremonial circular seal: curved gilt small-caps
  text, engraved rings, `❦` finial, `EH` centre. Token-driven SVG (auto-themes).
- **Bookplate** (`Bookplate.astro`) — the "Ex Libris" ownership plate (double
  engraved frame + monogram + name).
- **Divider** (`Divider.astro`) — the `❧ — ❖ — ❧` inter-section motif.
- **Tag** (`Tag.astro`) — small-caps metadata label; `tone="faint" | "accent"`.
- **Input** (`Input.astro`) — engraved field with optional small-caps label and the
  `invalid` / `error` state (madder/oxblood keyline + `.field-error` note).
- **HeroFrontispiece / HeroPlate** — two alternate page heroes (an inlaid
  book-cover with a rotating engraved sun; a split wordmark + printer's-device
  colophon). The live home hero is the Celestial colour-block.

### shadcn/ui

shadcn components are wired onto these tokens via a thin **role layer** in
`globals.css` (`--background`/`--foreground`/`--primary`/`--border`/… → Almanac
`--c-*`), so any shadcn component is on-brand and follows the same `data-palette`
switch. See `src/components/ui/button.tsx` for the reference wiring. The site's
own UI is Astro; reach for shadcn (React island) only when a component needs
client interactivity.

---

## 7. Theme switching

Every colour token swaps off `document.documentElement.dataset.palette`
(`"parchment"` | `"midnight"`). `ThemeScript.astro` sets it **before paint**
(reads `localStorage["almanac-theme"]`, defaulting to **Midnight**);
`ThemeToggle.astro` flips and persists it. Because the tokens feed Tailwind's
`@theme`, `bg-paper`, `text-accent`, `border-line`, and the `dark:` variant are
all theme-aware automatically.

---

## 8. Motion

Restrained, ink-on-paper. Nav underline grow `0.28s`; button hover
`translateY(-2px)`; catalog/ledger hover slide (`padding`) `0.2–0.25s`;
reveal-on-scroll fade/translate (pure CSS `animation-timeline: view()`, class
`.reveal`). The grain never animates; it scrolls with the page. All decorative
animation is gated behind `prefers-reduced-motion`.

---

## 9. Accessibility

- **Contrast:** body `ink`/`ink-soft` on `paper` clears AA. Keep `ink-faint` for
  non-essential meta only. Warm-white `#f4eedd` on the CTA blocks clears AA.
- **Don't rely on the accent alone** for meaning (links also underline on hover;
  add focus-visible rings).
- **Focus:** every interactive element gets a visible 2px `accent` outline.
- **Motion:** all decorative animation gated behind `prefers-reduced-motion`.
- **Hit targets:** ≥ 40 px for icon buttons.

---

## 10. Do / Don't

**Do**

- Number your sections; set numerals in Playfair italic accent.
- Keep one accent per theme; use the tint band and colour-blocks for rhythm.
- Use engraved inset keylines for depth.
- Let the grain scroll with the page.
- Style only with semantic tokens (`bg-paper`, `text-accent`, …) or the shadcn
  role utilities — never one-off Tailwind colour literals (`text-blue-600`).

**Don't**

- Add a second hue, emoji, or gradient backgrounds beyond the CTA blocks.
- Use sans-serif for body copy.
- Fix the grain to the viewport.
- Float cards on soft drop shadows.

---

Significant or hard-to-reverse design choices get an ADR in
[`docs/decisions/`](docs/decisions/index.md). Deviating from a rule here is allowed when
justified — record *why* in an ADR rather than silently drifting.
