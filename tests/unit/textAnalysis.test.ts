import { describe, it, expect } from 'vitest'
import { analyzeText, getIssueColor } from '@/lib/textAnalysis'

// ─── Empty input ──────────────────────────────────────────────────────────────

describe('analyzeText — empty input', () => {
  it('returns zero stats for an empty string', async () => {
    const result = await analyzeText('', 'en')
    expect(result.issues).toHaveLength(0)
    expect(result.stats.wordCount).toBe(0)
    expect(result.stats.sentenceCount).toBe(0)
    expect(result.stats.gradeLevel).toBe(0)
    expect(result.stats.readingTime).toBe(0)
  })

  it('returns zero stats for whitespace-only input', async () => {
    const result = await analyzeText('   \n\t  ', 'en')
    expect(result.stats.wordCount).toBe(0)
  })
})

// ─── English analysis ─────────────────────────────────────────────────────────

describe('analyzeText — English', () => {
  it('counts words correctly', async () => {
    const result = await analyzeText('This is a test sentence.', 'en')
    expect(result.stats.wordCount).toBe(5)
  })

  it('counts sentences correctly', async () => {
    const result = await analyzeText('First sentence. Second sentence. Third one.', 'en')
    expect(result.stats.sentenceCount).toBe(3)
  })

  it('detects passive voice', async () => {
    const result = await analyzeText('The speech was written by the author.', 'en')
    const passiveIssues = result.issues.filter(i => i.type === 'passive')
    expect(passiveIssues.length).toBeGreaterThan(0)
    expect(result.stats.passiveCount).toBeGreaterThan(0)
  })

  it('detects adverbs', async () => {
    const result = await analyzeText('It was really very good.', 'en')
    const adverbIssues = result.issues.filter(i => i.type === 'adverb')
    expect(adverbIssues.length).toBeGreaterThanOrEqual(2)
    expect(result.stats.adverbs).toBeGreaterThanOrEqual(2)
  })

  it('returns non-negative grade level for normal text', async () => {
    const result = await analyzeText(
      'She gave a wonderful speech at the wedding. Everyone enjoyed it.',
      'en',
    )
    expect(result.stats.gradeLevel).toBeGreaterThanOrEqual(0)
  })

  it('reading time is at least 1 minute for 150+ words', async () => {
    const text = Array(155).fill('word').join(' ') + '.'
    const result = await analyzeText(text, 'en')
    expect(result.stats.readingTime).toBeGreaterThanOrEqual(1)
  })

  it('issues have valid start/end offsets within text bounds', async () => {
    const text = 'The report was submitted by the team.'
    const result = await analyzeText(text, 'en')
    for (const issue of result.issues) {
      expect(issue.start).toBeGreaterThanOrEqual(0)
      expect(issue.end).toBeGreaterThanOrEqual(issue.start)
      expect(issue.end).toBeLessThanOrEqual(text.length)
    }
  })
})

// ─── Dutch analysis ───────────────────────────────────────────────────────────

describe('analyzeText — Dutch', () => {
  it('counts words correctly', async () => {
    const result = await analyzeText('Dit is een testzin.', 'nl')
    expect(result.stats.wordCount).toBe(4)
  })

  it('detects Dutch adverbs', async () => {
    const result = await analyzeText('Hij is heel gewoon een aardige man.', 'nl')
    const adverbIssues = result.issues.filter(i => i.type === 'adverb')
    expect(adverbIssues.length).toBeGreaterThanOrEqual(2)
  })

  it('detects Dutch passive voice (werd + ge- participle)', async () => {
    const result = await analyzeText('De toespraak werd geschreven door de spreker.', 'nl')
    const passiveIssues = result.issues.filter(i => i.type === 'passive')
    expect(passiveIssues.length).toBeGreaterThan(0)
  })

  it('flags hard sentences (14+ words)', async () => {
    // 16-word sentence
    const text =
      'Dit is een zin die echt heel erg lang is en moeilijk te lezen kan zijn.'
    const result = await analyzeText(text, 'nl')
    const hardIssues = result.issues.filter(
      i => i.type === 'hard-sentence' || i.type === 'very-hard-sentence',
    )
    expect(hardIssues.length).toBeGreaterThan(0)
  })

  it('returns zero stats for empty Dutch text', async () => {
    const result = await analyzeText('', 'nl')
    expect(result.stats.wordCount).toBe(0)
    expect(result.issues).toHaveLength(0)
  })
})

// ─── getIssueColor ────────────────────────────────────────────────────────────

describe('getIssueColor', () => {
  it('returns a non-empty string for every issue type', () => {
    const types = ['passive', 'hard-sentence', 'very-hard-sentence', 'adverb', 'simpler-alternative'] as const
    for (const type of types) {
      expect(getIssueColor(type).length).toBeGreaterThan(0)
    }
  })
})
