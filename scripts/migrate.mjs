import { getPayload } from 'payload'
import config from '../src/payload.config.ts'

const migrate = async () => {
    console.log('Starting database migration...')

    try {
        const payload = await getPayload({ config })
        console.log('✅ Payload initialized - database schema should be created')
        process.exit(0)
    } catch (error) {
        console.error('❌ Migration failed:', error)
        process.exit(1)
    }
}

migrate()
