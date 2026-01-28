/**
 * Text Analysis Engine for Hemingway-style writing feedback
 * Uses retext plugins for sentence analysis and text-readability for grade level
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

// Common adverbs to detect and highlight
const ADVERB_PATTERNS = [
    'really', 'very', 'extremely', 'absolutely', 'actually', 'basically',
    'certainly', 'clearly', 'completely', 'definitely', 'entirely', 'especially',
    'essentially', 'exactly', 'fairly', 'frankly', 'generally', 'honestly',
    'hopefully', 'incredibly', 'just', 'literally', 'naturally', 'obviously',
    'particularly', 'possibly', 'practically', 'probably', 'quite', 'rather',
    'seriously', 'simply', 'slightly', 'somewhat', 'strongly', 'surely',
    'totally', 'truly', 'usually', 'virtually'
]

/**
 * Analyze text for readability issues
 */
export async function analyzeText(text: string): Promise<AnalysisResult> {
    const issues: TextIssue[] = []

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

    // Run retext analysis
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
            // Determine severity based on sentence length (word count)
            // retext-readability puts the actual sentence text in msg.actual
            // Hemingway Editor approach: 
            // - 14-21 words and hard = "hard to read" (yellow)
            // - 22+ words and hard = "very hard to read" (red)
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
    const adverbRegex = new RegExp(`\\b(${ADVERB_PATTERNS.join('|')})\\b`, 'gi')
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

    // Calculate grade level using text-readability
    let gradeLevel = 0
    try {
        gradeLevel = rs.fleschKincaidGrade(text) || 0
        if (isNaN(gradeLevel)) gradeLevel = 0
    } catch {
        gradeLevel = 0
    }

    // Reading time: average 150 words per minute for speeches
    const readingTime = Math.ceil(wordCount / 150)

    // Count issues by type
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

/**
 * Get a human-readable label for an issue type
 */
export function getIssueLabel(type: IssueType): string {
    switch (type) {
        case 'passive':
            return 'Passive Voice'
        case 'hard-sentence':
            return 'Hard to Read'
        case 'very-hard-sentence':
            return 'Very Hard to Read'
        case 'adverb':
            return 'Adverb'
        case 'simpler-alternative':
            return 'Simpler Alternative'
        default:
            return 'Issue'
    }
}
