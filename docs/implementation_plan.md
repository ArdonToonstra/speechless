# Project Foundation: Collaborative Speech Application

## Goal Description
To establish the technical and conceptual foundation for a Node.js, Payload CMS, and PostgreSQL application designed for collaborative speech writing and event organization. This phase focuses on planning, rule-setting, and feature definition.

## User Review Required
> [!NOTE]
> **Architecture Decision**: We are proceeding with the **Integrated Payload 3.0** approach. This means the CMS and Frontend live in the *same* Next.js application.
> **CSS Choice**: We will use **TailwindCSS** for its utility-first approach, which accelerates development and is ideal for responsive PWA designs.

## 1. Tech Stack Proposal

### Core
- **Runtime**: Node.js (Latest LTS)
- **CMS / Backend Framework**: Payload CMS 3.0 (Native Next.js integration)
- **Database**: PostgreSQL (Running in **Docker**)
- **Language**: TypeScript (Strict mode)

### Frontend
- **Framework**: Next.js (Version `^15.5.7`)
- **Architecture**: Single App (Payload + Frontend together)
- **Styling**: **TailwindCSS** (Definitive choice)
- **Mobile Strategy**: PWA (Progressive Web App)
  - Manifest file for installability.
  - Responsive design first.

### Collaborative Features (Post-MVP)
- **Engine**: **Yjs** + **Hocuspocus** (Open Source, Self-hosted).

### Infrastructure
- **Storage**: Local file storage (MVP).
- **Maps**: OpenStreetMap / Leaflet (dummy data for MVP).

## 2. Feature Breakdown

### Core Experience (The "User Journey")
1.  **Onboarding Wizard**:
    - First-time user flow: Set Speech Context (Wedding, Birthday, etc.) -> Set Date.
    - Creates the first "Project" automatically.
    - **Countdown Timer**: Subtle visual indicator of time remaining until the event.
2.  **Dashboard**:
    - Manage multiple Speech Projects.
    - "Add New Project" option.

### Speech Writing Tools
1.  **Templates**: Library of starter structures (e.g., "The Funny Best Man", "The Emotional Parent").
2.  **Editor Enhancements**:
    - **Export**: Download as PDF or Word (.docx).
    - **Practice Mode**: Distraction-free view, simple timer, voice recording (future).

### Event & Logistics (Monetization & Revenue)
1.  **Location Finder**:
    - MVP: List with dummy data.
    - Future: Commission-based booking model.
2.  **Professional Help**:
    - "Request Feedback" button.
    - Paid service flow (Submit draft -> Expert review).

### Social & Sharing
1.  **Project Sharing**:
    - **Magic Link**: Generate a unique, time-limit optional link to join the project as a Viewer or Editor.
    - **Email Invite**: Send a secure invitation directly to an email address (required for specific role management).
2.  **Golden Ticket**: Digital invite for the Speech Receiver (Date + Location + Special Message).
3.  **Silver Tickets**: Digital invites for guests/collaborators.

## 3. Design System ("Modern Serenity")
To achieve a "lightweight and subtle" feel that is still modern:

### Visual Language
- **Typography**: 
  - *UI*: **Geist Sans** or **Inter** (Clean, legible, modern defaults).
  - *Speech Editor*: **Newsreader** or **Merriweather** (Serif). Gives a "writerly" and "pro" feel when actually composing the speech.
- **Palette**:
  - **Base**: `Slate-50` to `Slate-100` (Off-white backgrounds, reduced eye strain).
  - **Text**: `Slate-900` (Primary) and `Slate-500` (Secondary/Muted).
  - **Accents**: 
    - *Primary*: **Indigo-600** (Trust, Calm, "Digital").
    - *Celebration*: **Amber-400** (Used sparingly for "Golden Tickets" and "Success" states).
- **Components**:
  - **Glassmorphism**: Subtle backdrop blurs (`backdrop-blur-md`) on sticky navigational elements.
  - **Soft Edges**: Generous border radius (`rounded-2xl` for cards, `rounded-full` for buttons).
  - **Elevation**: Flat design generally, but deep, soft shadows (`shadow-xl`) for the "Paper" editor to make it feel lifted off the screen.

## 4. AI Agent Rules & Guidelines
These rules will serve as the "System Instructions" for any future AI working on this codebase.

### General Philosophy
1.  **Code Quality**: Write clean, self-documenting TypeScript. Always prefer strict types.
2.  **Payload Pattern**: 
    - Use "Local API" (`payload.find`) within Next.js Server Components.
    - **Monolith Advantage**: Share types directly from `payload-types.ts` to frontend components.
3.  **Open Source First**: Prefer libraries that are FOSS and self-hostable.

### Specific DOs and DON'Ts
- **DO** use Next.js 15 `app` directory features (Server Actions, Server Components).
- **DO** ensure all UI is strictly responsive (Mobile First design).
- **DON'T** introduce proprietary SaaS dependencies (e.g., Auth0, Firebase) - stick to Payload Auth.
- **DON'T** over-engineer the microservices. Keep it monolithic (One Next.js app) until strictly necessary.

### Architectural Rules
1.  **File Structure**:
    - `/src/payload`: Payload-specific configurations.
    - `/src/collections`: DB Schema definitions.
    - `/src/app/(app)`: Frontend routes.
    - `/src/app/(payload)`: CMS Admin routes.
    - `/src/components`: UI components.
2.  **State Management**: 
    - Server State: React Server Components.
    - Client State: URL Search Params > Local State > Global Store (Zustand - only if complex).

---

## Verification Plan
Since this is a planning phase, verification will consist of:
1.  **User Approval**: Confirming the Tech Stack and Feature List matches the vision.
2.  **Documentation Check**: Ensuring the "AI Rules" document is comprehensive and saved to the repo (when created).
