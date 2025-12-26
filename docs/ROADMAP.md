# Speechless Feature Roadmap

This document outlines the planned features and improvements for the Speechless application, organized by priority and development phase.

## Phase 1: Authentication & User Management (MVP Polish)
*Goal: Secure user access and provide a seamless onboarding experience.*

- [X] **Sign-up & Login Pages**
  - Create dedicated `/login` and `/signup` pages (replacing the default Payload admin login for clear separation).
  - style with the new "Modern Serenity" theme.
- [ ] **OAuth Integration**
  - Implement Google authentication providers via Payload's auth strategies.
- [X] **Logout Functionality**
  - Add a visible "Log Out" button in the dashboard and profile dropdown.
  - Ensure proper session cleanup and redirect to landing page.
- [X] **User Profile Settings**
  - Allow users to update their name, email, and password.

## Phase 2: Core Editor Experience
*Goal: Making the writing process distraction-free and powerful.*

- [ ] **Editor Enhancements**
  - **Toolbar Polish**: Improve the floating/fixed toolbar design (Bold, Italic, Headers).
  - **Word Count & Timing**: Real-time estimation of speech duration (e.g., "5 min read").
  - **Focus Mode**: A full-screen toggle that hides everything except the text editor.
- [ ] **Auto-Save & Version History**
  - Robust auto-save with visual indicators ("Saving...", "Saved").
  - Simple version history to restore previous drafts.

## Phase 3: Guest Management & Sharing
*Goal: Managing the event and gathering feedback.*

- [ ] **Guest List & Invitations**
  - Ability to add the "Honoree" (person receiving the speech) and Guests.
  - Support for inviting via **Email** and **Postal Address** (printable labels/list).
- [ ] **Magic Link Sharing (Refinement)**
  - Create a dedicated public view page (`/share/[token]`) that is read-only.
- [ ] **Viewer Feedback**
  - Allow viewers/collaborators to leave comments.
- [ ] **PDF Export**
  - "Print to PDF" styled specifically for reading aloud.

## Phase 4: Advanced Content & Venues (Revenue Model)
*Goal: Providing premium content and event services.*

- [ ] **Templates & Example Speeches Library**
  - Extensive library of example speeches for various occasions (Weddings, Birthdays, etc.).
  - "Fill-in-the-blank" style structural templates.
- [ ] **Location Planning**
  - Ability to select/plan the event location.
  - **Mock Locations**: Initial set of curated venues (revenue model foundation).

## Phase 5: Mobile & Offline (PWA)
*Goal: Access anywhere.*

- [ ] **PWA Configuration**
  - Add manifest.json and service workers for installability.
- [ ] **Offline Mode**
  - Cache drafts locally so users can write without an internet connection.

---

## Technical Debt & Infrastructure
- [ ] **Testing**: Set up end-to-end tests for critical flows (Login, Create Project, Share).
- [ ] **Type Safety**: strict TypeScript checks across all server actions and components.
