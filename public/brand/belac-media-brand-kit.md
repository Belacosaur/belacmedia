# Belac Media — Brand kit

**Positioning:** Modern Australian Premium — a Perth-based digital studio focused on **relieving the operational weight** of social and brand execution (workflows, approvals, brand consistency), not on promising viral reach.

**Primary web:** https://belacmedia.com  
**Contact:** hello@belacmedia.com  
**Region:** Perth, Western Australia, Australia

---

## 1. Logo system

Use **transparent PNG** lockups only (no forced plates on dark backgrounds unless accessibility requires it).

| Asset | Path | When to use |
|--------|------|-------------|
| **Symbol** | `/logosymbol.png` | Favicon-scale, app icon contexts, very small UI (e.g. mobile nav). |
| **Lettermark** | `/symbolletterlogo.png` | Footer, email signatures, narrow headers. |
| **Horizontal** | `/symbolhorizontallogo.png` | Default web header, presentations, letterheads (digital). |
| **Vertical** | `/symbolverticallogo.png` | Hero splash, posters, social cover-style vertical frames. |

**Rules**

- Do not stretch; preserve aspect ratio.
- Prefer **midnight** (`#121414`) or true black behind gold/white logo treatments; on **light** backgrounds use the asset as provided (typically dark mark + gold detail).
- Minimum clear space: **0.5×** the height of the “BELAC” word or symbol bounding box on all sides where practical.
- Do not rotate, outline, or add drop shadows for “decoration” unless in a documented marketing template.

---

## 2. Colour

| Token (CSS) | Hex | Role |
|-------------|-----|------|
| `--bp-midnight` | `#121414` | Primary dark UI, hero, footer |
| `--bp-midnight-soft` | `#1a1c1c` | Dark gradients, depth |
| `--bp-gold` | `#c5a059` | Brand accent, emphasis on dark |
| `--bp-gold-dim` | `#9a7d46` | Muted gold on light |
| `--bp-surface` | `#fcf8f8` | Light page background |
| `--bp-surface-low` | `#f6f3f2` | Alternate bands |
| `--bp-on-surface` | `#1c1b1b` | Body/headings on light |
| `--bp-on-surface-variant` | `#434747` | Secondary text on light |
| `--bp-hero-ink` | `#f4f0ef` | Primary text on dark |
| `--bp-hero-ink-muted` | `rgba(244,240,239,0.68)` | Secondary text on dark |

**Accessibility:** Pair gold with sufficient contrast on both light and dark; when in doubt default body copy to **hero ink** / **on-surface**, not gold alone.

---

## 3. Typography

- **Display / headlines:** **Noto Serif** — weights 600–700, slightly tight tracking for large sizes.
- **UI / marketing body:** **Space Grotesk** — 400–600; uppercase micro-labels with increased letter-spacing where used on site.

Google Fonts link (matches production): Noto Serif + Space Grotesk (+ Plus Jakarta Sans for non-marketing portal surfaces).

---

## 4. Voice & tone

**Sound like:** a calm senior operator — direct, specific, Australian-English, no growth-hack clichés.

**Lead with:** workflows (e.g. Planable, Meta Business), approvals, brand kits, consistency, engineering when needed.

**Do not promise:** guaranteed reach, “going viral,” or vanity metrics as deliverables. Exceptional reach may happen; it is not sold as the product.

---

## 5. Social & email

- **Company name:** Belac Media (two words, title case B and M).
- **Bio line (example):** Social and brand execution for Australian teams — less noise in the feed, more runway in the week.
- **Facebook:** use the official square mark in UI; link to the verified company profile only.

---

## 6. File manifest (repo)

All logo PNGs live in **`Frontend/public/`** root for stable URLs:

- `logosymbol.png`
- `symbolletterlogo.png`
- `symbolhorizontallogo.png`
- `symbolverticallogo.png`

Machine-readable **`tokens.json`** is in this folder.

---

*Internal reference — update when visual identity changes.*
