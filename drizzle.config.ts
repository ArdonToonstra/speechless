import { defineConfig } from 'drizzle-kit'

const getUrl = () => {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL
  if (process.env.POSTGRES_URL) return process.env.POSTGRES_URL
  if (process.env.STORAGE_DATABASE_URL) return process.env.STORAGE_DATABASE_URL
  return 'postgres://postgres:postgres@localhost:5435/speechless'
}

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: getUrl(),
  },
})
