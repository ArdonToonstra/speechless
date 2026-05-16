import { describe, it, expect } from 'vitest'
import { generateToken } from '@/lib/tokens'

describe('generateToken', () => {
  it('returns a 64-character hex string by default', () => {
    const token = generateToken()
    expect(token).toHaveLength(64)
    expect(token).toMatch(/^[0-9a-f]+$/)
  })

  it('returns length * 2 hex characters for a custom length', () => {
    expect(generateToken(16)).toHaveLength(32)
    expect(generateToken(8)).toHaveLength(16)
    expect(generateToken(64)).toHaveLength(128)
  })

  it('output contains only hex characters', () => {
    const token = generateToken(32)
    expect(token).toMatch(/^[0-9a-f]+$/)
  })

  it('produces unique values on each call', () => {
    const tokens = Array.from({ length: 10 }, () => generateToken())
    const unique = new Set(tokens)
    expect(unique.size).toBe(10)
  })
})
