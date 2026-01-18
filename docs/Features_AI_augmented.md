# Speechless Features & Refactoring Checklist

## 1. Authentication & Security
- [ ] **User Login & Authentication**
  - [ ] OAuth integration with Google for easy sign-in.
- [ ] **Email Services (Mailjet)**
  - [X] Account verification emails.
  - [ ] Password reset flows.
  - [ ] Invitation emails (project invites).
  - [ ] System notifications and updates.

## 2. General UX & Technical Principles
- [ ] **Language Support**: Bilingual (Tweetalig), **Dutch first**.
- [ ] **Device Strategy**: Desktop first, with later mobile optimization.
  - [ ] **Exception**: Questionnaire/Input module must be **Mobile First/Friendly** from the start.
- [ ] **Data Persistence**: "Save in between" functionality (Auto-save/Drafts).
- [ ] **Feedback Loop**: Feedback button to report issues or suggest features.

## 3. Core User Flows
- [ ] **Public Pages**
  - [ ] Home page (Landing) + Process flow visualization (how the product works).
  - [ ] Login & Signup flows.
  - [ ] 

- [ ] **Onboarding Flow**
  - [ ] **Type Selection**: 
    - Option A: Speech as a gift (Speech als cadeau).
    - Option B: Speech for the occasion (Speech voor de gelegenheid).
  - [ ] **Flow: Speech as a Gift**
    - [ ] Occasion Input: Wedding, retirement, funeral, birthday, roast, surprise, other (text input).
    - [ ] Date Input: Specific date, "Unknown", or "Help me via Date Picker".
    - [ ] Context: Title of speech, Honoree Name, Event Context (used for invites).
    - [ ] Logistics (Optional): City/Location, Number of guests (used for filters).
  - [ ] **Flow: Speech for the Occasion**
    - [ ] Occasion Input (same as above).
    - [ ] Date Input (same as above).
    - [ ] Context (same as above).

## 4. Dashboard
- [ ] **Project Layout**
  - [ ] Display projects/speeches as cards.
  - [ ] Card Info: Speech Title, Date, Status (In Progress, Completed, Delivered), Team Count.
- [ ] **Account Management**: Settings page link.
- [ ] **Actions**: Log out.
- [ ] **Quick Access**: Quick invite button (Magic project link).

## 5. Project Workspace (The "Speech" Page)

### A. Overview Tab
- [ ] **Basic Info Display**: Title, Occasion, Date, Honoree.
- [ ] **Process Tracker**: Steps to complete the speech creation process.

### B. Collaboration Tab
- [ ] **Team Management**
  - [ ] List team members with roles (Owner, Speech-Editor, Collaborator).
  - [ ] Owner permissions: Manage roles, delete members, revoke invites.
- [ ] **Invites**
  - [ ] Invite via Email.
  - [ ] Invite via Magic Link.
- [ ] **Future (V2.0)**: "Speech Giver Selector" (Wheel of Fortune style).

### C. Input Gathering (Questionnaire) Tab
- [ ] **Questionnaire Builder**
  - [ ] Structured questions (memories, anecdotes, stories).
  - [ ] Prefilled with 3 templates per occasion type.
  - [ ] Editing capabilities: Add/Edit questions.
- [ ] **UX Enhancements**
  - [ ] Estimated completion time display.
  - [ ] Magic link + Email sharing option.
- [ ] **Future (V2.0)**: Deadlines & Reminders.

### D. Questionnaire Answers Tab
- [ ] **Answers View**
  - [ ] Detailed View: By Question (bundled inputs, mood-board style).
  - [ ] List View: Total list of answers.
  - [ ] **Interaction**: Open answers in a new tab/view.
- [ ] **User Editing**: Users can edit answers after submission.
- [ ] **Future (V2.0)**: Voting system (upvote content) & Canvas organization.

### E. Speech Editor Tab
- [ ] **Rich Text Editor**
  - [ ] Basic formatting: Bold, Italic, Underline, Headers, Bullets.
- [ ] **Integration**: Easy access to "Input Answers" sidebar/modal to insert content.
- [ ] **Writing Aids**
  - [ ] Template suggestions (Occasion + Question based).
  - [ ] Links to Content Library (tips/examples).
  - [ ] Word count & Estimated read-aloud time.
- [ ] **Review**: Commenting functionality for team feedback.
- [ ] **Export**: PDF Export (Styled for reading aloud - large font/spacing).
- [ ] **Future Updates**
  - [ ] (V1.5) Readability tools (Hemingway-style, no AI yet).
  - [ ] (V2.0) Advanced commenting, Version history/Rollback, Real-time Collab.

### F. Date Poll Tab
- [ ] **Setup**: Project owner creates date poll.
- [ ] **Voting**: Team members vote on proposed dates.
- [ ] **Results**: Display results and confirm selected date.

### G. Location Tab
- [ ] **Integration**: Google Maps API.
  - [ ] Filter presets: Occasion type, number of guests.
- [ ] **Selection**: Track selected location.
  - [ ] Display selected location on Dashboard & Overview.
  - [ ] "Custom Location" input option.
- [ ] **Future (V2.0)**: Curated "First Class" locations list (Google Maps as fallback).

### H. Invites Tab (Event Guest Management)
- [ ] **Concept**: Originally for "Speech as a gift", but adaptable for other occasions.
- [ ] **Message Customization**: Default template based on input vs User edit.
- [ ] **Physical Invites**: Option to send Golden/Silver tickets via post.
  - [ ] Address collection form.
- [ ] **Timeline**: Notification logic (Send min. 5 days before event).
- [ ] **Admin**: Notification to system admin to fulfill physical invites.

## 6. Account Settings
- [ ] Change Password.
- [ ] Edit Profile (Name, Photo).
- [ ] Delete Account.
- [ ] Data Export (GDPR Compliance).

## 7. Content Library
- [ ] "How to build a good speech" guides.
- [ ] Templates for different speech types.
- [ ] Do's and Don'ts.

## 8. Future Concepts & Monetization
- [ ] **Moodboard Repurposing**: Reuse questionnaire responses for physical gifts (Poster/Book).
- [ ] **Location Monetization**: Commission on bookings via validated location service.
