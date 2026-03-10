/**
 * Text Analysis Engine for Hemingway-style writing feedback
 * Supports English (retext plugins) and Dutch (custom regex analysis)
 */

import { unified } from 'unified'
import retextEnglish from 'retext-english'
import retextPassive from 'retext-passive'
import retextReadability from 'retext-readability'
import retextSimplify from 'retext-simplify'
import retextStringify from 'retext-stringify'
// @ts-expect-error - text-readability has no types
import rs from 'text-readability'

export type IssueType =
    | 'passive'
    | 'hard-sentence'
    | 'very-hard-sentence'
    | 'adverb'
    | 'simpler-alternative'

export interface TextIssue {
    type: IssueType
    start: number
    end: number
    message: string
    suggestion?: string
}

export interface AnalysisStats {
    passiveCount: number
    hardSentences: number
    veryHardSentences: number
    adverbs: number
    simplerAlternatives: number
    gradeLevel: number
    readingTime: number
    wordCount: number
    sentenceCount: number
}

export interface AnalysisResult {
    issues: TextIssue[]
    stats: AnalysisStats
}

// Common English adverbs to detect and highlight
const ENGLISH_ADVERB_PATTERNS = [
    'really', 'very', 'extremely', 'absolutely', 'actually', 'basically',
    'certainly', 'clearly', 'completely', 'definitely', 'entirely', 'especially',
    'essentially', 'exactly', 'fairly', 'frankly', 'generally', 'honestly',
    'hopefully', 'incredibly', 'just', 'literally', 'naturally', 'obviously',
    'particularly', 'possibly', 'practically', 'probably', 'quite', 'rather',
    'seriously', 'simply', 'slightly', 'somewhat', 'strongly', 'surely',
    'totally', 'truly', 'usually', 'virtually'
]

// Dutch filler/weakener adverbs (bijwoorden) to detect and highlight
const DUTCH_ADVERB_PATTERNS = [
    'heel', 'erg', 'echt', 'zeer', 'enorm', 'gewoon', 'eigenlijk',
    'toch', 'even', 'duidelijk', 'zeker', 'vanzelfsprekend',
    'uiteraard', 'natuurlijk', 'kennelijk', 'blijkbaar', 'letterlijk',
    'totaal', 'compleet', 'volledig', 'absoluut', 'volkomen', 'werkelijk',
    'inderdaad', 'nogal', 'tamelijk', 'enigszins', 'redelijk',
    'waarschijnlijk', 'misschien', 'mogelijk', 'wellicht', 'vermoedelijk',
    'uitermate', 'buitengewoon', 'bijzonder', 'beslist', 'stellig',
    'simpelweg', 'ronduit', 'gewoonweg'
]

/**
 * Automated Readability Index — language-neutral grade level formula
 * Based on character count and word/sentence counts (no syllable counting needed)
 */
function calculateARI(text: string, wordCount: number, sentenceCount: number): number {
    if (wordCount === 0 || sentenceCount === 0) return 0
    const charCount = text.replace(/\s/g, '').length
    const ari = 4.71 * (charCount / wordCount) + 0.5 * (wordCount / sentenceCount) - 21.43
    return Math.max(0, ari)
}

/**
 * Detect hard/very-hard sentences in Dutch text using word count thresholds
 */
function analyzeDutchSentences(text: string): TextIssue[] {
    const issues: TextIssue[] = []
    const sentenceRegex = /[^.!?]+[.!?]*/g
    let match
    while ((match = sentenceRegex.exec(text)) !== null) {
        const sentence = match[0]
        const words = sentence.trim().split(/\s+/).filter(w => w.length > 0)
        const wordCount = words.length
        if (wordCount >= 14) {
            const isVeryHard = wordCount >= 22
            issues.push({
                type: isVeryHard ? 'very-hard-sentence' : 'hard-sentence',
                start: match.index,
                end: match.index + sentence.length,
                message: isVeryHard ? 'Zeer moeilijk leesbaar' : 'Moeilijk leesbaar',
                suggestion: isVeryHard
                    ? 'Deze zin is erg lang. Probeer hem op te splitsen in 2-3 kortere zinnen.'
                    : 'Probeer deze zin op te splitsen in kortere zinnen.'
            })
        }
    }
    return issues
}

/**
 * Detect Dutch passive voice (lijdende vorm) using worden-forms + ge- past participles.
 * Matches: wordt/worden/werd/werden followed by a ge- past participle within the same clause.
 */
function analyzeDutchPassive(text: string): TextIssue[] {
    const issues: TextIssue[] = []
    // Matches worden-form + up to 80 chars (not crossing sentence boundary) + ge- past participle
    const passiveRegex = /\b(wordt|worden|werd|werden)\b[^.!?]{0,80}?\b(ge\w{2,}(?:en|d|t))\b/gi
    let match
    while ((match = passiveRegex.exec(text)) !== null) {
        issues.push({
            type: 'passive',
            start: match.index,
            end: match.index + match[0].length,
            message: 'Lijdende vorm gedetecteerd',
            suggestion: 'Gebruik de bedrijvende vorm voor een krachtigere zin.'
        })
    }
    return issues
}

/**
 * Analyze Dutch text — custom regex-based analysis (no retext-english required)
 */
function analyzeDutchText(text: string): AnalysisResult {
    const issues: TextIssue[] = []

    // Sentence difficulty
    issues.push(...analyzeDutchSentences(text))

    // Passive voice (lijdende vorm)
    issues.push(...analyzeDutchPassive(text))

    // Adverbs (bijwoorden)
    const adverbRegex = new RegExp(`\\b(${DUTCH_ADVERB_PATTERNS.join('|')})\\b`, 'gi')
    let match
    while ((match = adverbRegex.exec(text)) !== null) {
        issues.push({
            type: 'adverb',
            start: match.index,
            end: match.index + match[0].length,
            message: `"${match[0]}" — overweeg dit bijwoord weg te laten`,
            suggestion: 'Sterke werkwoorden werken vaak beter dan bijwoorden.'
        })
    }

    // Stats
    const words = text.split(/\s+/).filter(w => w.length > 0)
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0)
    const wordCount = words.length
    const sentenceCount = sentences.length
    const gradeLevel = calculateARI(text, wordCount, sentenceCount)
    const readingTime = Math.ceil(wordCount / 150)

    const stats: AnalysisStats = {
        passiveCount: issues.filter(i => i.type === 'passive').length,
        hardSentences: issues.filter(i => i.type === 'hard-sentence').length,
        veryHardSentences: issues.filter(i => i.type === 'very-hard-sentence').length,
        adverbs: issues.filter(i => i.type === 'adverb').length,
        simplerAlternatives: 0, // Not available for Dutch (retext-simplify is English-only)
        gradeLevel: Math.round(gradeLevel * 10) / 10,
        readingTime,
        wordCount,
        sentenceCount
    }

    return { issues, stats }
}

/**
 * Analyze text for readability issues.
 * @param text - Plain text content to analyze
 * @param language - 'en' uses retext plugins; 'nl' uses custom Dutch analysis
 */
export async function analyzeText(text: string, language: 'en' | 'nl' = 'en'): Promise<AnalysisResult> {
    if (!text || text.trim().length === 0) {
        return {
            issues: [],
            stats: {
                passiveCount: 0,
                hardSentences: 0,
                veryHardSentences: 0,
                adverbs: 0,
                simplerAlternatives: 0,
                gradeLevel: 0,
                readingTime: 0,
                wordCount: 0,
                sentenceCount: 0
            }
        }
    }

    if (language === 'nl') {
        return analyzeDutchText(text)
    }

    // English analysis using retext plugins
    const issues: TextIssue[] = []

    const processor = unified()
        .use(retextEnglish)
        .use(retextPassive)
        .use(retextReadability, { age: 16 }) // Target audience age
        .use(retextSimplify)
        .use(retextStringify)

    const file = await processor.process(text)

    // Process messages from retext plugins
    const messages = file.messages || []

    for (const msg of messages) {
        if (!msg.place) continue

        let start = 0
        let end = 0

        if ('start' in msg.place) {
            // It's a Position (range)
            start = msg.place.start?.offset ?? 0
            end = msg.place.end?.offset ?? start
        } else {
            // It's a Point (single location)
            start = msg.place.offset ?? 0
            end = start
        }

        if (msg.source === 'retext-passive') {
            issues.push({
                type: 'passive',
                start,
                end,
                message: 'Passive voice detected',
                suggestion: 'Consider using active voice'
            })
        } else if (msg.source === 'retext-readability') {
            // Hemingway approach: 14-21 words = hard (yellow), 22+ = very hard (red)
            const sentenceText = typeof msg.actual === 'string' ? msg.actual : text.slice(start, end)
            const wordCount = sentenceText.split(/\s+/).filter((w: string) => w.length > 0).length
            const isVeryHard = wordCount >= 22
            issues.push({
                type: isVeryHard ? 'very-hard-sentence' : 'hard-sentence',
                start,
                end,
                message: isVeryHard ? 'Very hard to read' : 'Hard to read',
                suggestion: isVeryHard
                    ? 'This sentence is very long. Try breaking it into 2-3 shorter sentences.'
                    : 'Try breaking this into shorter sentences'
            })
        } else if (msg.source === 'retext-simplify') {
            issues.push({
                type: 'simpler-alternative',
                start,
                end,
                message: msg.message,
                suggestion: msg.expected ? String(msg.expected) : undefined
            })
        }
    }

    // Detect adverbs
    const adverbRegex = new RegExp(`\\b(${ENGLISH_ADVERB_PATTERNS.join('|')})\\b`, 'gi')
    let match
    while ((match = adverbRegex.exec(text)) !== null) {
        issues.push({
            type: 'adverb',
            start: match.index,
            end: match.index + match[0].length,
            message: `"${match[0]}" - consider removing this adverb`,
            suggestion: 'Strong verbs often work better than adverbs'
        })
    }

    // Calculate stats
    const words = text.split(/\s+/).filter(w => w.length > 0)
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0)
    const wordCount = words.length
    const sentenceCount = sentences.length

    // Calculate grade level using text-readability (Flesch-Kincaid)
    let gradeLevel = 0
    try {
        gradeLevel = rs.fleschKincaidGrade(text) || 0
        if (isNaN(gradeLevel)) gradeLevel = 0
    } catch {
        gradeLevel = 0
    }

    // Reading time: average 150 words per minute for speeches
    const readingTime = Math.ceil(wordCount / 150)

    const stats: AnalysisStats = {
        passiveCount: issues.filter(i => i.type === 'passive').length,
        hardSentences: issues.filter(i => i.type === 'hard-sentence').length,
        veryHardSentences: issues.filter(i => i.type === 'very-hard-sentence').length,
        adverbs: issues.filter(i => i.type === 'adverb').length,
        simplerAlternatives: issues.filter(i => i.type === 'simpler-alternative').length,
        gradeLevel: Math.round(gradeLevel * 10) / 10,
        readingTime,
        wordCount,
        sentenceCount
    }

    return { issues, stats }
}

/**
 * Get a color class for an issue type (Tailwind classes)
 */
export function getIssueColor(type: IssueType): string {
    switch (type) {
        case 'passive':
            return 'bg-blue-200 dark:bg-blue-900/50'
        case 'hard-sentence':
            return 'bg-yellow-200 dark:bg-yellow-900/50'
        case 'very-hard-sentence':
            return 'bg-red-200 dark:bg-red-900/50'
        case 'adverb':
            return 'bg-purple-200 dark:bg-purple-900/50'
        case 'simpler-alternative':
            return 'border-b-2 border-green-500'
        default:
            return ''
    }
}
