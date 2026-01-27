# Toast Features & Refactoring Checklist

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
  - [X] Home page (Landing) + Process flow visualization (how the product works).
  - [X] Login & Signup flows.

- [ ] **Onboarding Flow**
  - [ ] **Type Selection**: 
    - Option A: Speech as a gift (Speech als cadeau).
    - Option B: Speech for the occasion (location/time is set by someone else/speech receiver) (Speech voor de gelegenheid).
  - [ ] **Flow: Speech as a Gift**
    - [X] Occasion Input: Wedding, retirement, funeral, birthday, roast, surprise, other (text input).
    - [ ] Date Input: Specific date, "Unknown", or "Help me via Date Picker".
    - [ ] Context: Title of speech, Honoree Name, Event Context (used for invites).
    - [ ] Logistics (Optional): City/Location, Number of guests (used for filters).
  - [ ] **Flow: Speech for the Occasion**
    - [ ] Occasion Input (same as above).
    - [ ] Date Input (same as above).
    - [ ] Context (same as above).

## 4. Dashboard
- [ ] **Project Layout**
  - [X] Display projects/speeches as cards.
  - [ ] Card Info: Speech Title, Date, Status (In Progress, Completed, Delivered), Team Count.
- [X] **Account Management**: Settings page link.
- [X] **Actions**: Log out.
- [ ] **Quick Access**: Quick invite button (Magic project link).

## 5. Project Workspace (The "Speech" Page)

### A. Overview Tab
- [X] **Basic Info Display**: Title, Occasion, Date, Honoree.
- [ ] **Process Tracker**: Steps to complete the speech creation process.

### B. Collaboration Tab
- [ ] **Team Management**
  - [x] List team members with roles (Owner, Speech-Editor, Collaborator).
  - [X] Owner permissions: Manage roles, delete members, revoke invites.
- [ ] **Invites**
  - [ ] Invite via Email.
  - [X] Invite via Magic Link.


### C. Input Gathering (Questionnaire) Tab
- [ ] **Questionnaire Builder**
  - [ ] Structured questions (memories, anecdotes, stories).
  - [X] Prefilled with 3 templates per occasion type.
  - [X] Editing capabilities: Add/Edit questions.
  - [ ] Magic link + Email sharing option.
- [ ] **Future (V2.0)**: Set Deadlines & pre set reminders for those who haven't filled in the questionnaire.

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
  - [X] Word count & Estimated read-aloud time.
- [ ] **Review**: Commenting functionality for team feedback.
- [ ] **Export**: PDF Export (Styled for reading aloud - large font/spacing).
- [ ] Readability tools (Hemingway-style, no AI yet).


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
- [X] Delete Account.
- [ ] Data Export (GDPR Compliance).

## 7. Content Library
- [ ] "How to build a good speech" guides.
- [ ] Templates for different speech types.
- [ ] Do's and Don'ts.

## 8. Future Concepts & Monetization
- [ ] **Moodboard Repurposing**: Reuse questionnaire responses for physical gifts (Poster/Book).
- [ ] **Location Monetization**: Commission on bookings via validated location service. Curated "First Class" locations list (Google Maps as fallback).
- [ ] **Future (V2.0)**: "Speech Giver Selector" (Wheel of Fortune style).
- [ ] (V2.0) Advanced commenting, Version history/Rollback, Real-time Collab.