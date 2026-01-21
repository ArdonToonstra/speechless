import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view'
import { Node as ProseMirrorNode } from '@tiptap/pm/model'
import { AnalysisResult, getIssueColor, IssueType } from '@/lib/textAnalysis'

export interface HemingwayOptions {
    analysisResult: AnalysisResult | null
}

interface TextNodeMapping {
    textOffset: number
    nodePos: number
    nodeSize: number
}

export const HemingwayExtension = Extension.create<HemingwayOptions>({
    name: 'hemingway',

    addOptions() {
        return {
            analysisResult: null,
        }
    },

    addProseMirrorPlugins() {
        const { options } = this

        return [
            new Plugin({
                key: new PluginKey('hemingway'),
                state: {
                    init() {
                        return DecorationSet.empty
                    },
                    apply(tr, oldSet) {
                        // Check if this transaction has a metadata update for our plugin
                        const hasMeta = tr.getMeta('hemingwayAnalysis') !== undefined
                        if (hasMeta) {
                            const analysisResult = tr.getMeta('hemingwayAnalysis') as AnalysisResult | null
                            // If null, clear decorations; otherwise create new ones
                            if (!analysisResult) {
                                return DecorationSet.empty
                            }
                            return createDecorations(tr.doc, analysisResult)
                        }

                        // If the doc changed, map the decorations
                        // This keeps highlights "sticking" to the text as you type, until re-analysis happens
                        if (tr.docChanged) {
                            return oldSet.map(tr.mapping, tr.doc)
                        }

                        return oldSet
                    },
                },
                props: {
                    decorations(state) {
                        return this.getState(state)
                    },
                },
            }),
        ]
    },
})


function createDecorations(doc: ProseMirrorNode, result: AnalysisResult): DecorationSet {
    const decorations: Decoration[] = []

    if (!result || !result.issues || result.issues.length === 0) {
        return DecorationSet.empty
    }

    // Build a mapping from plain text offsets to document positions
    // This matches getText({ blockSeparator: '\n' }) behavior
    const textMapping: Array<{ textStart: number; textEnd: number; docStart: number; docEnd: number }> = []
    let runningTextOffset = 0
    let isFirstBlock = true

    doc.descendants((node, pos) => {
        if (node.isBlock && !node.isTextblock) {
            // Container blocks (like doc) - skip, let descendants handle children
            return true
        }

        if (node.isTextblock) {
            // Add newline separator between blocks (not before first)
            if (!isFirstBlock) {
                runningTextOffset += 1 // The '\n' separator
            }
            isFirstBlock = false

            // Process text content within this block
            let inlineOffset = 0
            node.forEach((child, offset) => {
                if (child.isText && child.text) {
                    const textLen = child.text.length
                    textMapping.push({
                        textStart: runningTextOffset + inlineOffset,
                        textEnd: runningTextOffset + inlineOffset + textLen,
                        docStart: pos + 1 + offset,
                        docEnd: pos + 1 + offset + textLen
                    })
                    inlineOffset += textLen
                } else if (child.type.name === 'hardBreak') {
                    inlineOffset += 1
                }
            })

            runningTextOffset += node.textContent.length
            return false // Don't descend into textblock children (we handled them)
        }

        return true
    })

    // Now create decorations by mapping issue offsets to document positions
    for (const issue of result.issues) {
        for (const mapping of textMapping) {
            const intersectStart = Math.max(mapping.textStart, issue.start)
            const intersectEnd = Math.min(mapping.textEnd, issue.end)

            if (intersectStart < intersectEnd) {
                const from = mapping.docStart + (intersectStart - mapping.textStart)
                const to = mapping.docStart + (intersectEnd - mapping.textStart)

                decorations.push(
                    Decoration.inline(from, to, {
                        class: getIssueColor(issue.type) + ' cursor-help transition-colors duration-200',
                        'data-issue-type': issue.type,
                        title: issue.message + (issue.suggestion ? `: ${issue.suggestion}` : '')
                    })
                )
            }
        }
    }

    return DecorationSet.create(doc, decorations)
}
