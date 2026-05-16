import { describe, it, expect } from 'vitest'
import { cn, isSafeRedirect } from '@/lib/utils'

describe('cn', () => {
  it('merges class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })

  it('deduplicates conflicting Tailwind classes (last wins)', () => {
    expect(cn('p-2', 'p-4')).toBe('p-4')
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500')
  })

  it('handles conditional/falsy values', () => {
    expect(cn('foo', false && 'bar', undefined, null as unknown as string, 'baz')).toBe('foo baz')
  })

  it('handles arrays', () => {
    expect(cn(['foo', 'bar'])).toBe('foo bar')
  })

  it('handles empty input', () => {
    expect(cn()).toBe('')
  })
})

describe('isSafeRedirect', () => {
  it('accepts relative paths', () => {
    expect(isSafeRedirect('/dashboard')).toBe(true)
    expect(isSafeRedirect('/en/projects/123')).toBe(true)
    expect(isSafeRedirect('/')).toBe(true)
  })

  it('rejects protocol-relative URLs', () => {
    expect(isSafeRedirect('//evil.com')).toBe(false)
    expect(isSafeRedirect('//evil.com/path')).toBe(false)
  })

  it('rejects absolute URLs with protocol', () => {
    expect(isSafeRedirect('https://evil.com')).toBe(false)
    expect(isSafeRedirect('http://localhost:3000/dashboard')).toBe(false)
    expect(isSafeRedirect('javascript://foo')).toBe(false)
  })

  it('rejects null and undefined', () => {
    expect(isSafeRedirect(null)).toBe(false)
    expect(isSafeRedirect(undefined)).toBe(false)
  })

  it('rejects empty string', () => {
    expect(isSafeRedirect('')).toBe(false)
  })
})
