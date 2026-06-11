/**
 * Input validation for public (unauthenticated) submission actions.
 *
 * Pure functions, no DB access, so they're unit-testable in isolation and reusable
 * across the questionnaire and scheduling anonymous-write paths. Each returns an
 * error message string when invalid, or null when the input passes.
 */

export const MAX_NAME_LENGTH = 120
export const MAX_ANSWER_LENGTH = 5000
export const MAX_NOTE_LENGTH = 1000

export function validateQuestionnaireInput(input: {
    submitterName: string
    answers: { question: string; answer: string }[]
    questionCount: number
}): string | null {
    const name = input.submitterName?.trim()
    if (!name) return 'Please enter your name'
    if (name.length > MAX_NAME_LENGTH) {
        return `Name must be ${MAX_NAME_LENGTH} characters or fewer`
    }

    if (!Array.isArray(input.answers)) return 'Invalid answers'
    // One answer per project question at most; reject obviously-forged oversized payloads.
    if (input.answers.length > input.questionCount) return 'Too many answers'

    for (const a of input.answers) {
        if (typeof a.answer === 'string' && a.answer.length > MAX_ANSWER_LENGTH) {
            return `Answers must be ${MAX_ANSWER_LENGTH} characters or fewer`
        }
    }

    return null
}

export function validateDateResponseInput(input: {
    guestName: string
    note?: string | null
}): string | null {
    const name = input.guestName?.trim()
    if (!name) return 'Please enter your name'
    if (name.length > MAX_NAME_LENGTH) {
        return `Name must be ${MAX_NAME_LENGTH} characters or fewer`
    }

    if (input.note && input.note.length > MAX_NOTE_LENGTH) {
        return `Note must be ${MAX_NOTE_LENGTH} characters or fewer`
    }

    return null
}
