import { describe, it, expect } from 'vitest'
import {
  validateQuestionnaireInput,
  validateDateResponseInput,
  MAX_NAME_LENGTH,
  MAX_ANSWER_LENGTH,
  MAX_NOTE_LENGTH,
} from '@/lib/validation'

describe('validateQuestionnaireInput', () => {
  const ok = {
    submitterName: 'Alex',
    answers: [{ question: 'Q1', answer: 'A short answer' }],
    questionCount: 3,
  }

  it('accepts valid input', () => {
    expect(validateQuestionnaireInput(ok)).toBeNull()
  })

  it('rejects an empty or whitespace-only name', () => {
    expect(validateQuestionnaireInput({ ...ok, submitterName: '' })).toMatch(/name/i)
    expect(validateQuestionnaireInput({ ...ok, submitterName: '   ' })).toMatch(/name/i)
  })

  it('rejects a name over the length cap, accepts one at the cap', () => {
    expect(
      validateQuestionnaireInput({ ...ok, submitterName: 'a'.repeat(MAX_NAME_LENGTH + 1) }),
    ).toMatch(/name/i)
    expect(
      validateQuestionnaireInput({ ...ok, submitterName: 'a'.repeat(MAX_NAME_LENGTH) }),
    ).toBeNull()
  })

  it('rejects more answers than the project has questions', () => {
    const answers = Array.from({ length: 4 }, (_, i) => ({ question: `Q${i}`, answer: 'x' }))
    expect(validateQuestionnaireInput({ ...ok, answers, questionCount: 3 })).toMatch(/too many/i)
  })

  it('allows answers up to the question count', () => {
    const answers = Array.from({ length: 3 }, (_, i) => ({ question: `Q${i}`, answer: 'x' }))
    expect(validateQuestionnaireInput({ ...ok, answers, questionCount: 3 })).toBeNull()
  })

  it('rejects an answer over the length cap', () => {
    const answers = [{ question: 'Q1', answer: 'a'.repeat(MAX_ANSWER_LENGTH + 1) }]
    expect(validateQuestionnaireInput({ ...ok, answers })).toMatch(/answers/i)
  })

  it('accepts an answer exactly at the length cap', () => {
    const answers = [{ question: 'Q1', answer: 'a'.repeat(MAX_ANSWER_LENGTH) }]
    expect(validateQuestionnaireInput({ ...ok, answers })).toBeNull()
  })

  it('rejects a non-array answers payload', () => {
    // @ts-expect-error deliberately malformed input
    expect(validateQuestionnaireInput({ ...ok, answers: 'nope' })).toMatch(/invalid/i)
  })
})

describe('validateDateResponseInput', () => {
  it('accepts a valid name and note', () => {
    expect(validateDateResponseInput({ guestName: 'Sam', note: 'works for me' })).toBeNull()
  })

  it('accepts a missing/empty note', () => {
    expect(validateDateResponseInput({ guestName: 'Sam' })).toBeNull()
    expect(validateDateResponseInput({ guestName: 'Sam', note: null })).toBeNull()
  })

  it('rejects an empty name', () => {
    expect(validateDateResponseInput({ guestName: '   ' })).toMatch(/name/i)
  })

  it('rejects a name over the length cap', () => {
    expect(
      validateDateResponseInput({ guestName: 'a'.repeat(MAX_NAME_LENGTH + 1) }),
    ).toMatch(/name/i)
  })

  it('rejects a note over the length cap, accepts one at the cap', () => {
    expect(
      validateDateResponseInput({ guestName: 'Sam', note: 'a'.repeat(MAX_NOTE_LENGTH + 1) }),
    ).toMatch(/note/i)
    expect(
      validateDateResponseInput({ guestName: 'Sam', note: 'a'.repeat(MAX_NOTE_LENGTH) }),
    ).toBeNull()
  })
})
