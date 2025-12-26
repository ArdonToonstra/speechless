---
trigger: always_on
---

### A. TypeScript
- **Strict Mode**: ON.
- **Payload Types**: ALWAYS import `Config` or generated interface types from `@payload-types`.
- **No `any`**: Explicitly define props and return types.

### B. Mobile First (PWA)
- **Responsive**: Every component must work on mobile (320px+) first.
- **Touch**: Buttons must have 44px+ touch targets.
- **Offline**: Consider how the read-only view works offline (Service Worker strategy - future).

### C. Forbidden Practices
- ❌ Do NOT split the repo into `client` and `server` folders. It is a monorepo Next.js app.
- ❌ Do NOT use `axios` (Use native `fetch` or Payload API).
- ❌ Do NOT hardcode colors (Use Tailwind classes).
- ❌ Do NOT implement custom auth tokens (Use Payload's built-in Authentication).

## 4. Design System: "Modern Serenity"

### A. Visuals
- **Colors**: `Slate-50` (Bg), `Slate-900` (Text), `Indigo-600` (Action), `Amber-400` (Golden Ticket).
- **Typography**:
  - `Geist Sans` / `Inter` -> UI Elements.
  - `Newsreader` / `Merriweather` -> **Speech Content ONLY**.
- **Forms**: Soft `rounded-2xl`, ample padding, minimal borders.

### B. Editor Experience
- The "Editor" should feel like a distinct mode.
- Clean white paper-like background on the darker/softer app background.
- Focus mode support.

### General Philosophy
1.  **Code Quality**: Write clean, self-documenting TypeScript. Always prefer strict types.
2.  **Payload Pattern**: 
    - Use "Local API" (`payload.find`) within Next.js Server Components.
    - **Monolith Advantage**: Share types directly from `payload-types.ts` to frontend components.
3.  **Open Source First**: Prefer libraries that are FOSS and self-hostable.