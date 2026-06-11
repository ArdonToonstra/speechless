---
name: Toast
description: A warm, collaborative speech-writing platform that turns anxiety into applause.
colors:
  primary: "#166162"
  accent: "#409498"
  secondary: "#8EA9BB"
  celebration: "#93895E"
  background: "#F6F5EF"
  card: "#FFFFFF"
  foreground: "#0D0F0B"
  muted: "#695D50"
  destructive: "#EF4444"
typography:
  display:
    fontFamily: "Newsreader, Georgia, serif"
    fontSize: "clamp(3rem, 5vw, 4.5rem)"
    fontWeight: 700
    lineHeight: 1.05
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Newsreader, Georgia, serif"
    fontSize: "1.875rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "normal"
  title:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: "-0.01em"
  body:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "normal"
  label:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "0.08em"
rounded:
  sm: "4px"
  md: "6px"
  lg: "8px"
  card: "12px"
  pill: "9999px"
spacing:
  xs: "8px"
  sm: "12px"
  md: "16px"
  lg: "24px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.background}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
    height: "40px"
  button-primary-hover:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.background}"
  button-secondary:
    backgroundColor: "{colors.secondary}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
  cta-pill:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.background}"
    rounded: "{rounded.pill}"
    padding: "16px 32px"
  card:
    backgroundColor: "{colors.card}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.card}"
    padding: "24px"
  input:
    backgroundColor: "transparent"
    textColor: "{colors.foreground}"
    rounded: "{rounded.md}"
    padding: "4px 12px"
    height: "40px"
  badge:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.background}"
    rounded: "{rounded.md}"
    padding: "2px 10px"
---

# Design System: Toast

## 1. Overview

**Creative North Star: "The Warm Table"**

Toast is the supportive friend who sits down next to you at the celebration table and says "you've got this." The interface exists to calm a nervous, first-time speech-writer and to make collaboration feel welcoming, not administrative. Warmth is structural here: it lives in the off-white paper-warm canvas (#F6F5EF), the deep dependable teal (#166162), and a Newsreader serif that gives headings the cadence of something handwritten and heartfelt — never the chrome of an enterprise dashboard.

The system pairs an editorial serif voice for emotional moments (hero, section titles, the speech itself) with Inter for the calm, legible machinery of the product (labels, controls, data). Surfaces are soft and rounded, elevation is gentle and ambient, and color is deployed with restraint so the rare celebratory gold actually feels like a celebration. This is a product-register system first — the tool should disappear into the task — with one expressive landing surface where the brand is allowed to sing.

It explicitly rejects three things, carried from PRODUCT.md: **cold corporate SaaS** (no navy-and-gray dashboard chrome on an emotional task), the **clinical AI writing tool** (nothing that implies the machine authors the speech), and the **cluttered, overwhelming** screen that intimidates a non-writer who is already anxious.

**Key Characteristics:**
- Warm paper-off-white canvas, not stark white or cream-by-default sand
- Deep teal as the dependable primary; muted gold reserved for genuine celebration
- Serif (Newsreader) for emotion, sans (Inter) for the working UI
- Soft rounded surfaces (8–12px), gentle ambient shadows
- Restraint: one accent at a time, complexity revealed progressively
- Full light/dark parity

## 2. Colors

A warm, grounded palette: paper-toned neutrals, a deep teal spine, and a single gold that earns its rare appearances.

### Primary
- **Deep Teal** (#166162 / `hsl(181 63% 23%)`): The dependable brand spine. Primary buttons, links, active nav, focus rings, key iconography. Carries trust and calm — the color of "you're in good hands."

### Secondary
- **Muted Sky Blue** (#8EA9BB / `hsl(204 25% 64%)`): A soft, low-stakes support color for secondary buttons and quiet surfaces. Cool counterweight to the warm neutrals; never competes with the teal.

### Tertiary
- **Vibrant Teal** (#409498 / `hsl(182 41% 42%)`): A brighter sibling of the primary, used for hover affordances and lighter accents (it backs the `accent` token, e.g. ghost/outline button hover surfaces).
- **Celebration Gold** (#93895E / `hsl(49 22% 47%)`): The milestone color. Reserved for genuine moments of celebration — a finished speech, a completed flow, a "golden ticket." Its rarity is the entire point.

### Neutral
- **Warm Paper** (#F6F5EF / `hsl(53 27% 95%)`): The body canvas. Warm off-white, not stark white, not sand — the warmth comes from a real low-chroma tint, not a cream default.
- **Card White** (#FFFFFF): Pure white for elevated content surfaces sitting on the warm canvas, so cards read as lifted paper.
- **Ink** (#0D0F0B / `hsl(80 18% 5%)`): Near-black with a faint olive cast. Primary text and high-emphasis foreground.
- **Warm Brown** (#695D50 / `hsl(31 14% 36%)`): Borders, inputs, and muted/secondary text. This is the system's most fragile color for contrast — see the Named Rule below.
- **Alert Red** (#EF4444 / `hsl(0 84% 60%)`): Destructive actions and errors only.

### Named Rules
**The Earned Gold Rule.** Celebration gold appears only at moments that are actually a celebration — never as decoration, never as a third button color. If gold shows up on a routine screen, it has been spent and the next real milestone will land flat.

**The Warm-Brown Contrast Rule.** Warm Brown (#695D50) and `muted-foreground` are the system's contrast liability on the #F6F5EF canvas. Body text must clear 4.5:1; if muted brown body copy is even close, push it toward Ink. Never use it for placeholder text or anything a user must read carefully.

## 3. Typography

**Display Font:** Newsreader (with Georgia, serif fallback) — available in normal and italic
**Body Font:** Inter (with system-ui, sans-serif fallback)

**Character:** A deliberate contrast pairing — a warm, literary transitional serif for the emotional register against a neutral, highly legible grotesque sans for the working interface. The serif carries feeling (it's the voice of the speech itself); the sans carries function. They share no DNA, which is exactly why the pairing reads as intentional rather than accidental.

### Hierarchy
- **Display** (Newsreader, 700, `clamp(3rem, 5vw, 4.5rem)`, line-height 1.05, tracking -0.02em): Landing hero and the largest emotional headlines. Serif, bold, tracked slightly tight. Ceiling is ~4.5rem — the page invites, it does not shout.
- **Headline** (Newsreader, 700, 1.875rem / `text-3xl`): Section titles, project names, modal titles where warmth matters.
- **Title** (Inter, 600, ~1rem, tracking tight): Card titles and in-product headings — `font-semibold leading-none tracking-tight`. Sans, because this is working UI.
- **Body** (Inter, 400, 1rem, line-height ~1.6): Default reading text. Cap prose at 65–75ch. The serif may be used for the speech draft and pull-quotes to give the writing itself an editorial voice.
- **Label** (Inter, 700, 0.75rem / `text-xs`, tracking 0.08em, often UPPERCASE): Eyebrows, badges, metadata, status. The system's one tracked-uppercase device — see the rule.

### Named Rules
**The Serif-for-Feeling Rule.** Newsreader is for emotion and identity — hero, section titles, the speech, pull-quotes. It never carries dense UI machinery (form labels, table data, button text). When in doubt, the working UI is Inter.

**The Uppercase-Label Restraint Rule.** Tracked uppercase (the `label` role) is a real device in this system, but it is for metadata and status chips, not a decorative eyebrow above every section. Use it where it labels, not where it ornaments.

## 4. Elevation

A gently-lifted system, not a flat one. Surfaces use soft, ambient shadows (Tailwind's `shadow` / `shadow-sm` for controls and resting cards, escalating to `shadow-xl` / `shadow-2xl` for the landing's showcase cards). Depth is conveyed by white cards floating on the warm paper canvas as much as by the shadow itself — the tonal jump from #F6F5EF to #FFFFFF does real work. Shadows are warm-neutral and diffuse; they suggest paper lifted off a table, never hard drop-shadows.

### Shadow Vocabulary
- **Resting** (`box-shadow: 0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)` — Tailwind `shadow`): Default for cards, primary buttons, inputs at rest.
- **Subtle** (`box-shadow: 0 1px 2px rgba(0,0,0,0.05)` — Tailwind `shadow-sm`): Secondary/outline buttons, quiet controls.
- **Showcase** (`box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25)` — Tailwind `shadow-2xl`): Reserved for the landing-page product-peek cards and hero moments only.

### Named Rules
**The Lifted-Paper Rule.** Elevation reads as paper on a warm table: soft, ambient, warm-neutral. If a shadow looks hard, dark, or tight-radius, it's wrong — diffuse it. Heavy `shadow-2xl` is a landing-page device, not a product-UI default.

## 5. Components

Built on shadcn/ui (New York style) over Radix primitives. The vocabulary is deliberately consistent screen-to-screen — same button shape, same control language — so the product feels trustworthy and the tool disappears.

### Buttons
- **Shape:** Gently curved (6px / `rounded-md`); heights `h-10` default, `h-9` sm, `h-11` lg. CTA buttons on the landing use full pills (`rounded-full`, `px-8 py-4`).
- **Primary:** Deep Teal background, paper-white text, resting `shadow`, `px-4 py-2`. Hover dims to `primary/90`. This is the affirmative action everywhere.
- **Secondary:** Muted Sky Blue background, Ink text, `shadow-sm`; hover `secondary/80`.
- **Outline:** 1px input-brown border on transparent/canvas; hover fills with the Vibrant-Teal `accent` surface.
- **Ghost:** No chrome at rest; hover fills with the `accent` surface. **Link:** teal text, underline on hover.
- **Focus:** `focus-visible:ring-1 ring-ring` (teal). Disabled: 50% opacity, no pointer events.

### Cards / Containers
- **Corner Style:** Soft (12px / `rounded-xl`).
- **Background:** Card White (#FFFFFF) on the warm canvas.
- **Shadow Strategy:** Resting `shadow` (see Elevation); showcase shadows only on the landing.
- **Border:** 1px Warm-Brown border at low emphasis.
- **Internal Padding:** 24px (`p-6`); header/content/footer share the same rhythm.

### Inputs / Fields
- **Style:** `h-10`, 6px radius, 1px Warm-Brown border, transparent background, `shadow-sm`, `px-3 py-1`.
- **Focus:** `focus-visible:ring-1 ring-ring` (teal), outline removed.
- **Placeholder:** muted — but must still clear 4.5:1 (see the Warm-Brown Contrast Rule). Disabled: `cursor-not-allowed`, 50% opacity.

### Chips / Badges
- **Style:** 6px radius, `text-xs font-semibold`, `px-2.5 py-0.5`, transparent border.
- **Variants:** Default (teal/paper), Secondary (sky blue/ink), Destructive (red/white), Outline (ink text only). Status pills on the landing use tinted backgrounds (emerald/amber) for state.

### Navigation
- Inter throughout. Teal for active/current; muted brown for resting items lifting to Ink on hover. Mobile collapses to a structural menu, not fluid resizing.

### Signature Component — The Timeline
The landing page's vertical step timeline (gather → co-write → locate → tickets) is a distinctive narrative device: a centered connecting line with alternating cards and colored nodes (teal and amber). It's a brand surface, not a product pattern — keep its expressiveness on the landing and don't import its decoration into the app.

## 6. Do's and Don'ts

### Do:
- **Do** keep Deep Teal (#166162) as the single affirmative action color; one accent at a time.
- **Do** use Newsreader serif for emotion (hero, titles, the speech, pull-quotes) and Inter for all working UI.
- **Do** float white cards on the warm #F6F5EF canvas and let the tonal jump carry depth; keep shadows soft, warm, and diffuse.
- **Do** reserve Celebration Gold for genuine milestones — the Earned Gold Rule.
- **Do** verify Warm-Brown (#695D50) text clears 4.5:1 on the canvas; push toward Ink (#0D0F0B) when close.
- **Do** reveal complexity progressively — a non-writer meets a simple surface; logistics and advanced editing unfold on demand.
- **Do** respect `prefers-reduced-motion`; motion is reassurance, never a barrier.

### Don't:
- **Don't** let Toast read as **cold corporate SaaS** — no navy-and-gray dashboard chrome, no enterprise-tool sterility on an emotional, personal task.
- **Don't** imply the **clinical AI writing tool** that authors the speech for the user — copy, UI, and iconography assist the writer's own voice; they never replace it.
- **Don't** ship **cluttered, overwhelming** screens that intimidate an already-anxious non-writer; guard against cognitive overload.
- **Don't** spend Celebration Gold on routine screens or use it as a third button color.
- **Don't** use Warm-Brown for placeholder text or anything a user must read carefully — it's the contrast liability.
- **Don't** add a tracked-uppercase eyebrow above every section; the label device labels, it doesn't ornament.
- **Don't** use heavy `shadow-2xl` as a product-UI default — that's a landing-page-only device.
- **Don't** add decorative `border-left`/`border-right` colored stripes on cards or callouts; use full borders or background tints.
- **Don't** put Newsreader serif into dense UI machinery (form labels, table data, button text).
