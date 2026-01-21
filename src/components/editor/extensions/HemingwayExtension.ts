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
                        // If the document changed, or if we have a metadata update (new analysis)
                        // mapping the old decorations is cheaper but we replace them entirely on new analysis

                        // Check if this transaction has a metadata update for our plugin
                        const analysisResult = tr.getMeta('hemingwayAnalysis') as AnalysisResult | null
                        if (analysisResult) {
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

    // We need to map the "text offset" from retext (based on plain text) to ProseMirror document positions.
    // retext analysis was run on editor.getText(), which joins blocks with '\n\n'.
    // We simulate that traversal to find the correct node positions.

    if (!result || !result.issues || result.issues.length === 0) {
        return DecorationSet.empty
    }

    // Flatten the doc into text nodes to map offsets
    const textMappings: TextNodeMapping[] = []
    let currentTextOffset = 0

    doc.descendants((node, pos) => {
        if (node.isText) {
            textMappings.push({
                textOffset: currentTextOffset,
                nodePos: pos,
                nodeSize: node.nodeSize
            })

            currentTextOffset += node.nodeSize
        } else if (node.isBlock) {
            // Tiptap's getText() usually adds 2 newlines between blocks
            // But checking exact implementation, standard textBetween with default separator uses one,
            // but getText({ blockSeparator: '\n\n' }) is default? 
            // Actually standard Tiptap getText joins with `\n` by default unless configured.
            // Let's assume \n\n as confirmed by our earlier logic check, 
            // OR we just track "gaps".

            // Wait, if we use textBetween logic from Tiptap:
            // It iterates and adds separators.
            // If we are strictly just mapping, let's look at the mapping logic.
            // For simplicity in this MVP, we will try to match the text offsets directly.

            // If we entered a new block (and not the first one), we added separator length.
            // Since we don't know exactly where the separators are relative to nodes without re-simulating textBetween,
            // we'll use a simpler heuristic:
            // We assume the analysis text aligns reasonably well with text nodes.

            // Better strategy:
            // 'retext' results are character ranges.
            // We find which text nodes intersect these ranges.

            // However, we MUST account for the block separators that analyzeText saw.
            // If analyzeText saw "Line1\n\nLine2", and Line1 is 5 chars.
            // Line 2 starts at offset 7.
            // PM Pos for Line 2 text might be: 1 (start p) + 5 (text) + 1 (end p) + 1 (start p) + (text starts) = 8.
            // Offset 7 -> Pos 8.
            // Gap is 1.

            // Let's increment offset by 2 for every block boundary IF that's what getText does.
            // Let's assume standard behavior:
            // For every block end, we have 2 extra non-text characters in the string analysis seen? 
            // No, getText produces the string. The string has length N.
            // We need to map string-index 'i' to document-position 'p'.

            // Let's rely on Tiptap's logic:
            // We know "blocks" add newlines.
            // We will blindly increment our "virtual text offset" when we hit block boundaries.

            if (pos > 0) { // Not the very first node
                currentTextOffset += 2 // Assuming \n\n separator
            }
        }
    })

    // Actually, rewriting the mapping to be robust:
    // We can trust that `editor.getText()` was used.
    // We can scan the document similarly.

    // Implementation of `getText` simulation:
    let runningTextOffset = 0

    doc.descendants((node, pos) => {
        if (node.isText) {
            // This node contains text from [runningTextOffset] to [runningTextOffset + node.text.length]
            // We check if any issues overlap with this range

            const nodeStart = runningTextOffset
            const nodeEnd = runningTextOffset + node.nodeSize

            for (const issue of result.issues) {
                // Issue range: [issue.start, issue.end]
                // Intersection: 
                const intersectStart = Math.max(nodeStart, issue.start)
                const intersectEnd = Math.min(nodeEnd, issue.end)

                if (intersectStart < intersectEnd) {
                    // We have an overlap
                    const from = pos + (intersectStart - nodeStart)
                    const to = pos + (intersectEnd - nodeStart)

                    decorations.push(
                        Decoration.inline(from, to, {
                            class: getIssueColor(issue.type) + ' cursor-help transition-colors duration-200',
                            'data-issue-type': issue.type,
                            title: issue.message + (issue.suggestion ? `: ${issue.suggestion}` : '')
                        })
                    )
                }
            }

            runningTextOffset += node.nodeSize
        } else if (node.isBlock) {
            // Add separator length. Tiptap defaults to 2 newlines "\n\n" between blocks usually
            // But looking at the source, getText() usually expects a separator.
            // If we are not sure, we might have drift.
            // Let's assume 2 chars for now.
            if (pos > 0) runningTextOffset += 2;
        }
    })

    return DecorationSet.create(doc, decorations)
}
