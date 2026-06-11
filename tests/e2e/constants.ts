import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export const TEST_EMAIL = 'playwright@speechless.test'
export const TEST_PASSWORD = 'TestPass123!'
export const TEST_NAME = 'Playwright Bot'
export const AUTH_FILE = path.join(__dirname, '.auth/user.json')

// A second, independent user — used for permission/IDOR tests where a non-owner
// (and non-member) must be denied access to another user's project.
export const TEST_EMAIL_2 = 'playwright2@speechless.test'
export const TEST_PASSWORD_2 = 'TestPass123!'
export const TEST_NAME_2 = 'Playwright Bot Two'
export const AUTH_FILE_2 = path.join(__dirname, '.auth/user2.json')
