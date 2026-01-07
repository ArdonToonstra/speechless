import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
    await db.execute(sql`
    ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
    ALTER TABLE "media" ENABLE ROW LEVEL SECURITY;
    ALTER TABLE "projects" ENABLE ROW LEVEL SECURITY;
    ALTER TABLE "guests" ENABLE ROW LEVEL SECURITY;
    ALTER TABLE "submissions" ENABLE ROW LEVEL SECURITY;
    ALTER TABLE "invitations" ENABLE ROW LEVEL SECURITY;
    ALTER TABLE "payload_locked_documents" ENABLE ROW LEVEL SECURITY;
    ALTER TABLE "payload_preferences" ENABLE ROW LEVEL SECURITY;
    ALTER TABLE "payload_migrations" ENABLE ROW LEVEL SECURITY;
  `)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
    await db.execute(sql`
    ALTER TABLE "users" DISABLE ROW LEVEL SECURITY;
    ALTER TABLE "media" DISABLE ROW LEVEL SECURITY;
    ALTER TABLE "projects" DISABLE ROW LEVEL SECURITY;
    ALTER TABLE "guests" DISABLE ROW LEVEL SECURITY;
    ALTER TABLE "submissions" DISABLE ROW LEVEL SECURITY;
    ALTER TABLE "invitations" DISABLE ROW LEVEL SECURITY;
    ALTER TABLE "payload_locked_documents" DISABLE ROW LEVEL SECURITY;
    ALTER TABLE "payload_preferences" DISABLE ROW LEVEL SECURITY;
    ALTER TABLE "payload_migrations" DISABLE ROW LEVEL SECURITY;
  `)
}
