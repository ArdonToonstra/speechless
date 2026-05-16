import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export const TEST_EMAIL = 'playwright@speechless.test'
export const TEST_PASSWORD = 'TestPass123!'
export const TEST_NAME = 'Playwright Bot'
export const AUTH_FILE = path.join(__dirname, '.auth/user.json')
