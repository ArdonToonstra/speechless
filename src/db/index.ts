import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

const getConnectionString = () => {
    if (process.env.DATABASE_URL) return process.env.DATABASE_URL
    if (process.env.POSTGRES_URL) return process.env.POSTGRES_URL

    if (process.env.NODE_ENV === 'production') {
        throw new Error('DATABASE_URL or POSTGRES_URL environment variable is not defined')
    }

    return 'postgres://postgres:postgres@localhost:5435/speechless'
}

const connectionString = getConnectionString()

// For query purposes
const queryClient = postgres(connectionString)
export const db = drizzle(queryClient, { schema })

// Export schema for convenience
export * from './schema'
