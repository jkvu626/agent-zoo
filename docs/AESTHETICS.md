# AgentZoo Aesthetics

**Design direction:** Warm, cozy, soft edges, bouncy interactions. Feels like a friendly RPG hub or a well-loved tool—not generic SaaS gray.

This doc defines the **design token strategy** so the whole app looks and feels consistent. Define once, use everywhere.

---

## 1. Colors

Settled **warm/cozy** palette. Use these tokens everywhere; no one-off hex or generic gray stacks.

### Palette (CSS variables)

| Token Name | Hex Code | Description & Role |
|------------|----------|---------------------|
| `--bg-app` | `#F9F4ED` | **Warm Linen** — Creamy, off-white base that avoids the sterile feel of pure white. |
| `--bg-panel` | `#FFFFFF` | **Pure Paper** — High-contrast white for cards and interior content panels. |
| `--accent-orange` | `#D9833E` | **Burnt Apricot** — Primary bold color for hero borders, buttons, and highlights. |
| `--accent-green` | `#6B705C` | **Sage Forest** — Deep, muted green for secondary accents and natural elements. |
| `--text-primary` | `#4A3728` | **Deep Espresso** — Warm, dark brown for headings and main body text. |
| `--text-muted` | `#8C7867` | **Soft Clay** — Desaturated brown for subtext, prices, and less critical info. |
| `--border` | `#E3D5C1` | **Oatmeal** — Subtle, warm border color to define sections without being harsh. |
- **Destructive:** Darker/muted apricot (not red). Define a token e.g. 

### Copy-paste (theme.css or :root)

```css
--bg-app: #F9F4ED;
--bg-panel: #FFFFFF;
--accent-orange: #D9833E;
--accent-green: #6B705C;
--text-primary: #4A3728;
--text-muted: #8C7867;
--border: #E3D5C1;
```

Use these in **Tailwind** via `theme.extend.colors` (see [Where tokens live](#where-tokens-live)). For focus rings and hover states, derive from `--accent-orange` (e.g. darker shade or same token) as needed.

---

## 2. Typography

Two font roles; 2–3 sizes. Keeps hierarchy clear without clutter.

### Token names

| Token | Purpose |
|-------|---------|
| `--font-display` | Headings, character names, nav labels—distinctive, a bit of personality |
| `--font-body` | Body text, descriptions—readable, comfortable for long copy |

### Sizes

| Name | Use | Example (rem) |
|------|-----|----------------|
| `--text-small` | Captions, metadata, labels | 0.875rem |
| `--text-body` | Default body | 1rem |
| `--text-large` | Section headings, big labels | 1.25rem |
| `--text-display` | Page title, hero text | 1.5rem – 2rem |

### Font stack (Fredoka + Cabin)

```css
--font-display: "Fredoka", sans-serif;   /* rounded, friendly headings */
--font-body: "Cabin", "Segoe UI", sans-serif;
```

Define **2–3 sizes** in the theme (e.g. `text-sm`, `text-base`, `text-lg`) and map them to these tokens so Tailwind classes stay consistent.

---

## 3. Motion

Shared **Framer Motion** variants so panels, buttons, and cards all feel like one system. Prefer **springs** for bouncy; use **tween** only when you need exact timing.

### Variants to define and reuse

| Variant | Use | Feel |
|---------|-----|------|
| `springBouncy` | Buttons (tap), cards (hover), small UI feedback | Playful, responsive |
| `springSmooth` | Panels, modals, sidebar open/close | Calm, polished |
| `fadeInUp` | List items, content reveal, page transitions | Gentle entrance |

### Example definitions (use in a shared file, e.g. `src/motion.ts` or `src/theme/motion.ts`)

```ts
import { type Variants } from "framer-motion";

export const springBouncy = {
  type: "spring",
  stiffness: 400,
  damping: 25,
};

export const springSmooth = {
  type: "spring",
  stiffness: 300,
  damping: 30,
};

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

// Optional: wrap in a common config so Framer Motion and Tailwind can share duration if needed
export const motionTokens = {
  springBouncy,
  springSmooth,
  fadeInUp,
} as const;
```

Use `transition={springBouncy}` on buttons and `variants={fadeInUp}` on list/content so the whole app feels consistent.

---

## 4. Spacing & radius

**Soft edges** = generous radius on panels and cards. **Consistent padding** = same card/panel padding everywhere.

### Token names

| Token | Purpose |
|-------|---------|
| `--radius-sm` | Buttons, tags, small controls |
| `--radius-md` | Inputs, small cards |
| `--radius-panel` | Panels, sidebars, large cards |
| `--radius-card` | Card containers (can match panel or be slightly smaller) |
| `--padding-card` | Inner padding for cards |
| `--padding-panel` | Inner padding for panels |

### Example values (soft, cozy)

```css
--radius-sm: 0.375rem;   /* 6px */
--radius-md: 0.5rem;     /* 8px */
--radius-panel: 1rem;    /* 16px */
--radius-card: 0.75rem;  /* 12px */
--padding-card: 1rem;
--padding-panel: 1.25rem;
```

Use these in **Tailwind** via `theme.extend.borderRadius` and `theme.extend.spacing` (or reference CSS vars in the theme).

---

## Where tokens live

**Chosen approach: CSS variables + Tailwind.** All design tokens are defined in a single CSS file; Tailwind's theme references those variables. One source of truth for colors, typography, spacing, and radius. Tailwind classes and raw CSS stay in sync; theme switching later is easy (e.g. change `:root` or use a `data-theme` selector).

### 1. Define tokens in CSS

**`src/theme.css`** — Create this file and put every token in `:root`. Import it once at app entry (e.g. in `main.tsx` or root layout).

```css
:root {
  /* Colors (see §1) */
  --bg-app: #F9F4ED;
  --bg-panel: #FFFFFF;
  --accent-orange: #D9833E;
  --accent-green: #6B705C;
  --text-primary: #4A3728;
  --text-muted: #8C7867;
  --border: #E3D5C1;

  /* Typography (see §2) */
  --font-display: "Fredoka", sans-serif;
  --font-body: "Cabin", "Segoe UI", sans-serif;
  --text-small: 0.875rem;
  --text-body: 1rem;
  --text-large: 1.25rem;
  --text-display: 1.5rem;

  /* Spacing & radius (see §4) */
  --radius-sm: 0.375rem;
  --radius-md: 0.5rem;
  --radius-panel: 1rem;
  --radius-card: 0.75rem;
  --padding-card: 1rem;
  --padding-panel: 1.25rem;
}
```

### 2. Reference variables in Tailwind

**`tailwind.config.ts`** — In `theme.extend`, reference the CSS variables (no hex or raw values). Use these so utility classes like `bg-bg-app`, `text-text-primary`, `font-display`, `rounded-panel` work.

```ts
theme: {
  extend: {
    colors: {
      "bg-app": "var(--bg-app)",
      "bg-panel": "var(--bg-panel)",
      "accent-orange": "var(--accent-orange)",
      "accent-green": "var(--accent-green)",
      "text-primary": "var(--text-primary)",
      "text-muted": "var(--text-muted)",
      border: "var(--border)",
    },
    fontFamily: {
      display: ["var(--font-display)"],
      body: ["var(--font-body)"],
    },
    fontSize: {
      xs: "var(--text-small)",
      base: "var(--text-body)",
      lg: "var(--text-large)",
      "2xl": "var(--text-display)",
    },
    borderRadius: {
      sm: "var(--radius-sm)",
      md: "var(--radius-md)",
      panel: "var(--radius-panel)",
      card: "var(--radius-card)",
    },
    spacing: {
      "card": "var(--padding-card)",
      "panel": "var(--padding-panel)",
    },
  },
},
```

### 3. Use the theme

- Import `src/theme.css` at app entry so `:root` is applied.
- Use Tailwind classes: `bg-bg-app`, `bg-bg-panel`, `text-text-primary`, `text-text-muted`, `font-display`, `font-body`, `rounded-panel`, `rounded-card`, `p-panel`, `p-card`, etc.
- Motion tokens (springBouncy, springSmooth, fadeInUp) stay in JS/TS (e.g. `src/motion.ts`); they are not in CSS.

---

## Checklist

- [ ] **Colors** — All UI uses `--bg-app`, `--bg-panel`, `--accent-orange`, `--accent-green`, `--text-primary`, `--text-muted`, `--border`; no one-off hex/gray in components.
- [ ] **Typography** — Headings use `font-display`; body uses `font-body`; 2–3 sizes only.
- [ ] **Motion** — Buttons/panels use `springBouncy` / `springSmooth`; reveals use `fadeInUp`.
- [ ] **Spacing & radius** — Panels and cards use `--radius-panel` / `--radius-card` and `--padding-panel` / `--padding-card`.
- [ ] **Tokens** — Defined in `src/theme.css` (`:root`) and referenced in `tailwind.config.ts` (theme.extend).

---

## Summary

| Area | Strategy |
|------|----------|
| **Colors** | Settled palette: `--bg-app` (Warm Linen), `--bg-panel` (Pure Paper), `--accent-orange` (Burnt Apricot), `--accent-green` (Sage Forest), `--text-primary`, `--text-muted`, `--border` (Oatmeal). No generic gray stacks. |
| **Typography** | `--font-display`, `--font-body`; 2–3 sizes (small, body, large/heading). |
| **Motion** | Shared Framer Motion variants: `springBouncy`, `springSmooth`, `fadeInUp`. Reuse everywhere. |
| **Spacing & radius** | `--radius-panel`, `--radius-card`, `--padding-card`, `--padding-panel` in Tailwind theme or CSS vars. |
| **Placement** | **CSS + Tailwind:** `src/theme.css` defines all tokens in `:root`; `tailwind.config.ts` references them in theme.extend. Motion in `src/motion.ts`. |

Result: one coherent, warm, soft-edged, bouncy UI that stays consistent as the app grows.
