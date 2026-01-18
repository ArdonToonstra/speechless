# Speechless Feature Roadmap

This document outlines the planned features and improvements for the Speechless application, organized by priority and development phase.

- [ ] **OAuth Integration**
  - Implement Google authentication providers via Payload's auth strategies.
- [ ] **Email services**
  - Integrate an email service using Mailjet for account verification and password resets, and invites.
- [ ] **Editor Enhancements**
  - **Toolbar Polish**: Improve the floating/fixed toolbar design (Bold, Italic, Headers).
- [ ] **Viewer Feedback**
  - Allow viewers/collaborators to leave comments.
- [ ] **PDF Export**
  - "Print to PDF" styled specifically for reading aloud.
- [ ] **Templates & Example Speeches Library**
  - Extensive library of example speeches for various occasions (Weddings, Birthdays, etc.).
  - "Fill-in-the-blank" style structural templates.
- [ ] **PWA Configuration**
  - Add manifest.json and service workers for installability.
  - Add docs to guide users on installing the PWA.
- [ ] **Offline Mode**
  - Cache drafts locally so users can write without an internet connection.
- [ ] **Collaboration Features**
  - Real-time collaborative editing with multiple users.
  - User presence indicators and edit tracking.
- [ ] **User Profiles & Settings**
  - Allow users to delete accounts.
- [ ] **Mobile Optimization**
  - Responsive design improvements for mobile devices.
  - Touch-friendly editor controls.


## Technical Debt & Infrastructure
- [ ] **Testing**: Set up end-to-end tests for critical flows (Login, Create Project, Share).
- [ ] **Type Safety**: strict TypeScript checks across all server actions and components.
