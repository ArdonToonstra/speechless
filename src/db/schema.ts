import { pgTable, text, serial, timestamp, boolean, jsonb, integer, uniqueIndex } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// ============================================================================
// Better Auth Tables
// ============================================================================

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  initials: text('initials'),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').notNull().default(false),
  image: text('image'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expires_at').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
})

export const account = pgTable('account', {
  id: text('id').primaryKey(),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at'),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

// ============================================================================
// Application Tables
// ============================================================================

export const projects = pgTable('projects', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug'),
  description: text('description'),
  occasionType: text('occasion_type').notNull().default('other'), // wedding, birthday, funeral, retirement, roast, surprise, other
  customOccasion: text('custom_occasion'), // Used when occasionType is 'other'
  speechType: text('speech_type').notNull().default('gift'), // gift, occasion
  occasionDate: timestamp('occasion_date'),
  dateKnown: boolean('date_known').notNull().default(true), // false if user selected "I don't know yet"
  honoree: text('honoree'), // Name of the person receiving the speech
  eventContext: text('event_context'), // Additional context about the event (used for invites)
  city: text('city'), // Optional: location/city for the event
  guestCount: integer('guest_count'), // Optional: estimated number of guests
  ownerId: text('owner_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  draft: jsonb('draft'), // Lexical JSON
  status: text('status').notNull().default('draft'), // draft, final, archived
  shareToken: text('share_token').unique(),
  isPubliclyShared: boolean('is_publicly_shared').notNull().default(false),
  questions: jsonb('questions').$type<QuestionItem[]>().default([]),
  questionnaireIntro: text('questionnaire_intro'),
  emailTemplates: jsonb('email_templates').$type<EmailTemplates>(),
  locationSettings: jsonb('location_settings').$type<LocationSettings>(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const guests = pgTable('guests', {
  id: serial('id').primaryKey(),
  email: text('email').notNull(),
  name: text('name'),
  projectId: integer('project_id')
    .notNull()
    .references(() => projects.id, { onDelete: 'cascade' }),
  token: text('token').unique(),
  role: text('role').notNull().default('collaborator'), // collaborator, speech-editor
  status: text('status').notNull().default('invited'), // invited, accepted, declined
  invitedAt: timestamp('invited_at').defaultNow(),
  emailStatus: text('email_status').notNull().default('pending'), // pending, sent, bounced
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const invitations = pgTable('invitations', {
  id: serial('id').primaryKey(),
  email: text('email').notNull(),
  name: text('name'),
  projectId: integer('project_id')
    .notNull()
    .references(() => projects.id, { onDelete: 'cascade' }),
  role: text('role').notNull().default('attendee'), // attendee, receiver
  personalMessage: text('personal_message'),
  isPremium: boolean('is_premium').notNull().default(false),
  premiumFeature: text('premium_feature'),
  invitedAt: timestamp('invited_at').defaultNow(),
  emailStatus: text('email_status').notNull().default('pending'), // pending, prepared, sent, bounced
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const submissions = pgTable('submissions', {
  id: serial('id').primaryKey(),
  projectId: integer('project_id')
    .notNull()
    .references(() => projects.id, { onDelete: 'cascade' }),
  guestId: integer('guest_id')
    .notNull()
    .references(() => guests.id, { onDelete: 'cascade' }),
  submitterName: text('submitter_name').notNull(),
  answers: jsonb('answers').$type<AnswerItem[]>().default([]),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const magicLinks = pgTable('magic_links', {
  id: serial('id').primaryKey(),
  projectId: integer('project_id')
    .notNull()
    .references(() => projects.id, { onDelete: 'cascade' }),
  token: text('token').notNull().unique(),
  role: text('role').notNull().default('collaborator'), // collaborator, speech-editor
  expiresAt: timestamp('expires_at').notNull(),
  usageLimit: integer('usage_limit').notNull().default(20),
  usageCount: integer('usage_count').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

// Date options proposed by project owner for scheduling
export const dateOptions = pgTable('date_options', {
  id: serial('id').primaryKey(),
  projectId: integer('project_id')
    .notNull()
    .references(() => projects.id, { onDelete: 'cascade' }),
  proposedDate: timestamp('proposed_date').notNull(),
  proposedTime: text('proposed_time'), // Optional time string like "18:00"
  note: text('note'), // Owner's note about this option
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

// Responses from collaborators to date options
export const dateResponses = pgTable('date_responses', {
  id: serial('id').primaryKey(),
  dateOptionId: integer('date_option_id')
    .notNull()
    .references(() => dateOptions.id, { onDelete: 'cascade' }),
  guestId: integer('guest_id')
    .notNull()
    .references(() => guests.id, { onDelete: 'cascade' }),
  response: text('response').notNull(), // 'yes' | 'no' | 'maybe'
  note: text('note'), // Optional note from collaborator
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => [
  uniqueIndex('date_responses_option_guest_unique').on(table.dateOptionId, table.guestId),
])

// ============================================================================
// Type Definitions for JSONB columns
// ============================================================================

export type QuestionItem = {
  id: string
  question: string
  type: 'text' | 'textarea' | 'select' | 'checkbox'
  options?: string[]
  required?: boolean
}

export type AnswerItem = {
  questionId: string
  question: string
  answer: string
}

export type EmailTemplates = {
  attendee?: string
  receiver?: string
}

export type LocationSettings = {
  address?: string
  lat?: number
  lng?: number
  placeId?: string
  name?: string
  slug?: string // Keeping for backward compatibility if needed, or remove if fully replacing
}

// ============================================================================
// Relations
// ============================================================================

export const projectsRelations = relations(projects, ({ one, many }) => ({
  owner: one(user, {
    fields: [projects.ownerId],
    references: [user.id],
  }),
  guests: many(guests),
  invitations: many(invitations),
  submissions: many(submissions),
  magicLinks: many(magicLinks),
  dateOptions: many(dateOptions),
}))

export const guestsRelations = relations(guests, ({ one, many }) => ({
  project: one(projects, {
    fields: [guests.projectId],
    references: [projects.id],
  }),
  submissions: many(submissions),
  dateResponses: many(dateResponses),
}))

export const invitationsRelations = relations(invitations, ({ one }) => ({
  project: one(projects, {
    fields: [invitations.projectId],
    references: [projects.id],
  }),
}))

export const submissionsRelations = relations(submissions, ({ one }) => ({
  project: one(projects, {
    fields: [submissions.projectId],
    references: [projects.id],
  }),
  guest: one(guests, {
    fields: [submissions.guestId],
    references: [guests.id],
  }),
}))

export const magicLinksRelations = relations(magicLinks, ({ one }) => ({
  project: one(projects, {
    fields: [magicLinks.projectId],
    references: [projects.id],
  }),
}))

export const dateOptionsRelations = relations(dateOptions, ({ one, many }) => ({
  project: one(projects, {
    fields: [dateOptions.projectId],
    references: [projects.id],
  }),
  responses: many(dateResponses),
}))

export const dateResponsesRelations = relations(dateResponses, ({ one }) => ({
  dateOption: one(dateOptions, {
    fields: [dateResponses.dateOptionId],
    references: [dateOptions.id],
  }),
  guest: one(guests, {
    fields: [dateResponses.guestId],
    references: [guests.id],
  }),
}))
