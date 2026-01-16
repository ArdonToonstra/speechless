import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL || 'postgres://postgres:postgres@localhost:5435/speechless'

// For query purposes
const queryClient = postgres(connectionString)
export const db = drizzle(queryClient, { schema })

// Export schema for convenience
export * from './schema'
