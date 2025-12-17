# AI Agent Rules & Guidelines: Collaborative Speech App

> **CRITICAL**: usage of this document is MANDATORY for all AI agents working on this codebase.

## 1. Project Context
We are building a **Collaborative Speech Writing Application**. It is a **Next.js 15 + Payload CMS 3.0** monolithic application.
- **Goal**: Help users write speeches together, organize the event logistics, and invite guests.
- **Vibe**: "Modern Serenity" — lightweight, subtle, premium, distraction-free.

## 2. Tech Stack (Strict)
- **Framework**: Next.js 15 (App Router).
- **CMS**: Payload CMS 3.0 (Beta/Latest) - Integrated mode.
- **Database**: PostgreSQL (Dockerized).
- **Styling**: TailwindCSS.
- **Language**: TypeScript (Strict).
- **Package Manager**: pnpm (recommended) or npm.

## 3. Architectural Patterns

### A. The "Integrated Monolith"
- **CMS & Frontend are ONE application**.
- Payload runs at `/admin` (or configured route) and manages the database.
- The Frontend runs at `/` and consumes data via the **Local API**.
- **Rule**: NEVER fetch data using `fetch('http://localhost:3000/api/...')` inside Server Components.
- **Rule**: ALWAYS use `import { getPayload } from 'payload'` and `payload.find(...)`. This preserves types and improves performance.

### B. Directory Structure
```
/src
  /app
    /(frontend)    # Main user facing app
    /(payload)     # Payload admin routes
  /components      # Reusable UI components
    /ui            # Primitive "shadcn-like" components
    /features      # Complex feature-based components (e.g. SpeechEditor)
  /collections     # Payload Collection Configs (Database Schema)
  /globals         # Payload Global Configs
  /lib             # Utilities
  /styles          # Global CSS
```

### C. Data Fetching
- **Server Components**: Direct DB access via Payload Local API.
- **Client Components**: Server Actions (preferred) or `useQuery` (if using React Query/SWR - optional).

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

## 5. Coding Standards

### A. TypeScript
- **Strict Mode**: ON.
- **Payload Types**: ALWAYS import `Config` or generated interface types from `@payload-types`.
- **No `any`**: Explicitly define props and return types.

### B. Mobile First (PWA)
- **Responsive**: Every component must work on mobile (320px+) first.
- **Touch**: Buttons must have 44px+ touch targets.
- **Offline**: Consider how the read-only view works offline (Service Worker strategy - future).

## 6. Feature Implementation Priorities (MVP)
1.  **User Flow**: Onboarding Wizard -> Create Project -> Dashboard.
2.  **Core Tool**: Collaborative Text Editor (Yjs/Lexical).
3.  **Sharing**: Magic Link generation logic.

## 7. Forbidden Practices
- ❌ Do NOT split the repo into `client` and `server` folders. It is a monorepo Next.js app.
- ❌ Do NOT use `axios` (Use native `fetch` or Payload API).
- ❌ Do NOT hardcode colors (Use Tailwind classes).
- ❌ Do NOT implement custom auth tokens (Use Payload's built-in Authentication).
