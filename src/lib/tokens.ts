import { randomBytes } from 'crypto'

/**
 * Generate a secure random token for sharing, guest invites, etc.
 * @param length - Length of the token in bytes (default 32, produces 64 char hex string)
 */
export function generateToken(length = 32): string {
  return randomBytes(length).toString('hex')
}
