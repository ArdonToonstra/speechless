# Internationalization (i18n) Plan

## Overview

This document outlines the plan for adding Dutch and English language support to the Speechless application. This implementation should be done **after the app is fully developed in English** as a final enhancement phase.

## Technology Stack

- **Library**: `next-intl` (most popular for Next.js 15 App Router)
- **Routing Strategy**: URL-based locale routing (`/en/*`, `/nl/*`)
- **Supported Locales**: English (`en`), Dutch (`nl`)
- **Default Locale**: English (`en`)

## Key Decisions

### 1. User Preference Storage
- **Decision**: Store user language preference in database
- **Implementation**: Add `preferredLocale` field to `user` table in schema
- **Behavior**: 
  - Persists across devices and sessions
  - Overrides browser default once set

### 2. Guest-Facing Content Locale
- **Decision**: Guest-facing content (invites, questionnaires, share pages) uses project owner's locale
- **Rationale**: Ensures consistency in communication from project owner to guests
- **Implementation**: 
  - Email invitations use owner's `preferredLocale` in URL (`/nl/invite/[token]`)
  - Share links generated with owner's locale
  - Guests can manually switch language if needed via locale switcher

### 3. Database Stored Content
- **Decision**: User-generated content stored in project owner's locale only
- **Affected Fields**:
  - `projects.questions` (JSONB array)
  - `projects.questionnaireIntro` (text)
  - `projects.emailTemplates` (JSONB)
  - `projects.description` (text)
- **Rationale**: Simplifies data model; content tied to owner's preference

### 4. Enum Values and Dropdowns
- **Decision**: Store English keys in database, translate labels in UI
- **Example**: 
  - Database: `occasionType: 'wedding'`
  - Translation keys: `occasionTypes.wedding` → "Wedding" / "Bruiloft"
  - Other enums: status values, role types, project types
- **Rationale**: Keeps database language-agnostic, enables easy label changes

### 5. Error Messages
- **Decision**: Keep server-side error messages in English for initial implementation
- **Rationale**: Simplifies early development; can be localized later if needed
- **Future Enhancement**: Could pass translation keys from server actions to translate on client

### 6. SEO and Metadata
- **Decision**: Localize all page metadata per locale
- **Implementation**: Use `next-intl`'s `getTranslations()` in `generateMetadata()` functions
- **Scope**: Page titles, descriptions, Open Graph tags

### 7. New User Default Locale
- **Decision**: Detect locale from browser on signup, save to database
- **Implementation**:
  - Read `Accept-Language` header in middleware/auth flow
  - Store in `preferredLocale` during user creation
  - Provide locale selector in onboarding flow
- **Fallback**: Default to `'en'` if detection fails

### 8. Existing Users Migration
- **Decision**: Run database migration to add `preferredLocale` column
- **Migration Strategy**:
  - Add column with default value `'en'` for existing users
  - NOT NULL constraint with default
  - Update on next login based on browser detection (optional enhancement)

### 9. URL Structure for Shared Content
- **Decision**: Locale included in all URLs, including shared links
- **Examples**:
  - `/en/share/abc123` (English)
  - `/nl/invite/xyz789` (Dutch)
- **Behavior**: 
  - Email links use project owner's locale
  - Manual locale switching available via UI

## Implementation Steps

### Phase 1: Setup and Configuration

1. **Install Dependencies**
   ```bash
   pnpm add next-intl
   ```

2. **Configure next-intl Plugin**
   - Update `next.config.mjs` with `next-intl` plugin
   - Set locales: `['en', 'nl']`
   - Set default locale: `'en'`

3. **Create Translation Files**
   - Create `messages/en.json`
   - Create `messages/nl.json`
   - Organize with namespaces:
     - `common` - Shared UI elements, buttons, labels
     - `auth` - Login, signup, password reset
     - `dashboard` - Dashboard page
     - `projects` - Project management
     - `questionnaire` - Questionnaire builder and form
     - `settings` - Settings page
     - `email` - Email templates
     - `validation` - Form validation messages
     - `occasionTypes` - Wedding, Birthday, Funeral, Other
     - `roles` - User roles
     - `status` - Status values

### Phase 2: Database Schema Updates

4. **Add User Locale Preference**
   ```typescript
   // In src/db/schema.ts
   export const user = pgTable('user', {
     // ... existing fields
     preferredLocale: text('preferred_locale').notNull().default('en'),
   })
   ```

5. **Run Database Migration**
   ```bash
   pnpm db:generate
   pnpm db:migrate
   ```

### Phase 3: Routing Restructure

6. **Restructure App Directory**
   - Create `src/app/[locale]` directory
   - Move all routes under `src/app/(frontend)` to `src/app/[locale]/(frontend)`
   - Keep `src/app/api` routes outside locale structure (API routes don't need locale)
   - Update imports and references

7. **Create i18n Configuration**
   - Create `src/i18n.ts` with locale configuration
   - Export `locales`, `defaultLocale` constants

8. **Update Middleware**
   - Add `next-intl` middleware for locale detection and routing
   - Integrate with existing auth middleware
   - Detect browser locale for new users
   - Redirect to user's `preferredLocale` on login

### Phase 4: Root Layout Updates

9. **Update Root Layout**
   - Update `src/app/[locale]/layout.tsx` to receive `locale` param
   - Set `<html lang={locale}>`
   - Initialize `NextIntlClientProvider` with messages
   - Create `generateStaticParams()` for both locales

10. **Add Locale Provider**
    - Wrap app with `NextIntlClientProvider`
    - Load appropriate message bundle per locale

### Phase 5: Component Updates

11. **Create Translation Keys**
    - Audit all hardcoded strings in components
    - Create comprehensive translation keys in JSON files
    - Group by feature/namespace

12. **Update Server Components**
    - Import `getTranslations` from `next-intl/server`
    - Replace hardcoded strings: `const t = await getTranslations('namespace')`
    - Use: `t('key')`

13. **Update Client Components**
    - Import `useTranslations` from `next-intl`
    - Replace hardcoded strings: `const t = useTranslations('namespace')`
    - Use: `t('key')`

14. **Priority Components to Update** (in order):
    - Auth pages: `/login`, `/signup`, `/forgot-password`
    - Dashboard: `/dashboard/page.tsx`
    - Project management: `ProjectCard`, `ProjectHeader`, `ProjectOverview`
    - Questionnaire: `QuestionnaireEditor`, `QuestionnaireForm`
    - Settings: `/settings/*`
    - Guest-facing: `InviteAcceptance`, `ShareDialog`, `SubmissionsList`

### Phase 6: Date and Number Formatting

15. **Update date-fns Usage**
    - Import Dutch locale: `import { nl } from 'date-fns/locale'`
    - Pass locale to `format()` calls based on active locale:
      ```typescript
      import { useLocale } from 'next-intl'
      import { format } from 'date-fns'
      import { nl, enUS } from 'date-fns/locale'
      
      const locale = useLocale()
      const dateLocale = locale === 'nl' ? nl : enUS
      format(date, 'PPP', { locale: dateLocale })
      ```

16. **Update Relative Time Formatting**
    - Use `next-intl`'s `useFormatter()` or `date-fns`'s `formatDistanceToNow` with locale
    - Update `ProjectCard` countdown timer

### Phase 7: Locale Switcher

17. **Create Locale Switcher Component**
    - Create `src/components/LocaleSwitcher.tsx`
    - Use `usePathname()` and `useRouter()` from `next/navigation`
    - Switch between `/en/[path]` and `/nl/[path]`
    - Update user's `preferredLocale` in database on switch
    - Show current locale with flag or label

18. **Add to Navigation**
    - Add to main navigation/header
    - Add to settings page
    - Ensure visible on all pages

### Phase 8: Metadata Localization

19. **Localize Page Metadata**
    - Create metadata translation keys for all pages
    - Update `generateMetadata()` functions:
      ```typescript
      export async function generateMetadata({ params: { locale } }) {
        const t = await getTranslations({ locale, namespace: 'metadata' })
        return {
          title: t('dashboard.title'),
          description: t('dashboard.description'),
        }
      }
      ```

20. **Localize Open Graph Tags**
    - Add OG title, description for both locales
    - Update manifest.ts for PWA support

### Phase 9: Email Localization

21. **Update Email Templates**
    - Load translations in email sending functions
    - Use project owner's `preferredLocale` to select template language
    - Update `src/lib/email.ts`:
      ```typescript
      const t = await getTranslations({ locale: owner.preferredLocale, namespace: 'email' })
      ```

22. **Localize Email Content**
    - Subject lines
    - Body text
    - Button labels
    - Footer text

### Phase 10: User Settings

23. **Add Language Preference to Settings**
    - Add locale selector to user settings page
    - Update `preferredLocale` on save
    - Show current locale
    - Provide preview of how app will appear

24. **Update Onboarding Flow**
    - Add locale selection step in onboarding
    - Store preference during initial setup
    - Skip if already detected from browser

### Phase 11: Testing

25. **Create Translation Coverage Tests**
    - Ensure all keys exist in both `en.json` and `nl.json`
    - Check for missing translations
    - Validate JSON structure

26. **Manual Testing**
    - Test all pages in both locales
    - Verify locale switching works correctly
    - Test guest flows with different owner locales
    - Verify email sending in correct locale
    - Test date formatting in both locales
    - Check metadata/SEO for both locales

27. **Update Playwright Tests**
    - Add locale-aware test cases
    - Test locale switching
    - Test guest invitation flows with different locales

## Translation File Structure

Example structure for `messages/en.json`:

```json
{
  "common": {
    "save": "Save",
    "cancel": "Cancel",
    "delete": "Delete",
    "edit": "Edit",
    "close": "Close",
    "loading": "Loading...",
    "error": "An error occurred",
    "success": "Success!"
  },
  "auth": {
    "login": "Log in",
    "signup": "Sign up",
    "email": "Email",
    "password": "Password",
    "welcomeBack": "Welcome Back",
    "signInToContinue": "Sign in to continue writing."
  },
  "dashboard": {
    "title": "Dashboard",
    "myProjects": "My Projects",
    "createProject": "Create New Project"
  },
  "projects": {
    "name": "Project Name",
    "description": "Description",
    "occasionDate": "Occasion Date",
    "daysToGo": "{count} days to go",
    "today": "Today!",
    "passed": "Passed",
    "noDateSet": "No date set"
  },
  "occasionTypes": {
    "wedding": "Wedding",
    "birthday": "Birthday",
    "funeral": "Funeral",
    "other": "Other"
  },
  "questionnaire": {
    "title": "Questionnaire",
    "addQuestion": "Add Question",
    "questionType": "Question Type",
    "required": "Required"
  },
  "settings": {
    "title": "Settings",
    "language": "Language",
    "selectLanguage": "Select your preferred language"
  }
}
```

## Migration SQL

```sql
-- Add preferredLocale column to user table
ALTER TABLE "user" 
ADD COLUMN "preferred_locale" TEXT NOT NULL DEFAULT 'en';

-- Add check constraint for valid locales
ALTER TABLE "user"
ADD CONSTRAINT "user_preferred_locale_check" 
CHECK ("preferred_locale" IN ('en', 'nl'));
```

## URLs Before and After

### Before
- `/login`
- `/dashboard`
- `/projects/123`
- `/share/abc123`

### After
- `/en/login` or `/nl/login`
- `/en/dashboard` or `/nl/dashboard`
- `/en/projects/123` or `/nl/projects/123`
- `/en/share/abc123` or `/nl/share/abc123`

## Locale Detection Flow

1. **New User Signup**:
   - Read `Accept-Language` header
   - Default to `'en'` if not detected
   - Save to `preferredLocale` in database
   - Show locale selector in onboarding

2. **Returning User**:
   - Read `preferredLocale` from database
   - Redirect to `/[locale]/...` on login
   - Middleware handles automatic routing

3. **Guest User (Not Logged In)**:
   - Use project owner's locale for invite/share pages
   - Allow manual switch via locale switcher
   - Cookie stores preference for session

4. **Manual Switch**:
   - User clicks locale switcher
   - Update `preferredLocale` in database (if logged in)
   - Navigate to `/[newLocale]/[currentPath]`

## Future Enhancements (Optional)

- Add more languages (German, French, Spanish)
- Localize server action error messages
- Add RTL language support
- Locale-specific number formatting (decimals, currency)
- Automatic translation suggestions for user-generated content
- Multi-locale support for project content (allow owners to create versions in multiple languages)

## Notes

- API routes remain at `/api/*` (no locale prefix)
- Static assets remain language-agnostic
- Keep database enum values in English (keys only)
- All UI-facing text goes through translation layer
- Server components use `getTranslations()`, client components use `useTranslations()`
- Error boundaries and fallback UI need translation support

## Implementation Timeline

This should be implemented **after the core app is fully developed in English**. Estimated effort: 2-3 weeks for full implementation and testing.

**Why wait?**
- Allows focus on feature development without translation overhead
- Prevents constant updates to translation files during rapid iteration
- Ensures stable UI text before creating translations
- Easier to batch all translations at once with full context

## Resources

- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [Next.js Internationalization Guide](https://nextjs.org/docs/app/building-your-application/routing/internationalization)
- [date-fns Locales](https://date-fns.org/docs/I18n)
