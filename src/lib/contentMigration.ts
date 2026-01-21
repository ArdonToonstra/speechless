/**
 * Content Migration Utility
 * Converts Lexical editor JSON to Tiptap/ProseMirror JSON format
 */

interface LexicalNode {
    type: string
    children?: LexicalNode[]
    text?: string
    format?: number
    tag?: string
    listType?: string
    value?: number
    direction?: string
    indent?: number
}

interface LexicalRoot {
    root: LexicalNode
}

interface TiptapNode {
    type: string
    content?: TiptapNode[]
    text?: string
    marks?: Array<{ type: string }>
    attrs?: Record<string, unknown>
}

interface TiptapDoc {
    type: 'doc'
    content: TiptapNode[]
}

// Lexical format flags
const FORMAT_BOLD = 1
const FORMAT_ITALIC = 2
const FORMAT_UNDERLINE = 8

/**
 * Detect if content is in Lexical format
 */
export function isLexicalFormat(content: unknown): boolean {
    if (!content || typeof content !== 'object') return false
    const obj = content as Record<string, unknown>
    return 'root' in obj && typeof obj.root === 'object'
}

/**
 * Detect if content is in Tiptap format
 */
export function isTiptapFormat(content: unknown): boolean {
    if (!content || typeof content !== 'object') return false
    const obj = content as Record<string, unknown>
    return obj.type === 'doc' && Array.isArray(obj.content)
}

/**
 * Convert Lexical text formatting flags to Tiptap marks
 */
function convertMarks(format: number | undefined): Array<{ type: string }> {
    const marks: Array<{ type: string }> = []
    if (!format) return marks

    if (format & FORMAT_BOLD) marks.push({ type: 'bold' })
    if (format & FORMAT_ITALIC) marks.push({ type: 'italic' })
    if (format & FORMAT_UNDERLINE) marks.push({ type: 'underline' })

    return marks
}

/**
 * Convert a Lexical node to Tiptap format
 */
function convertNode(lexicalNode: LexicalNode): TiptapNode | TiptapNode[] | null {
    switch (lexicalNode.type) {
        case 'root':
            return {
                type: 'doc',
                content: convertChildren(lexicalNode.children)
            }

        case 'paragraph':
            const paragraphContent = convertChildren(lexicalNode.children)
            // If empty paragraph, include an empty text node
            return {
                type: 'paragraph',
                content: paragraphContent.length > 0 ? paragraphContent : undefined
            }

        case 'heading':
            return {
                type: 'heading',
                attrs: { level: lexicalNode.tag === 'h1' ? 1 : lexicalNode.tag === 'h2' ? 2 : 3 },
                content: convertChildren(lexicalNode.children)
            }

        case 'list':
            const listType = lexicalNode.listType === 'bullet' ? 'bulletList' : 'orderedList'
            return {
                type: listType,
                content: convertChildren(lexicalNode.children)
            }

        case 'listitem':
            // Tiptap expects listItem to wrap a paragraph
            const listItemContent = convertChildren(lexicalNode.children)
            return {
                type: 'listItem',
                content: [{
                    type: 'paragraph',
                    content: listItemContent
                }]
            }

        case 'text':
            if (!lexicalNode.text) return null
            const marks = convertMarks(lexicalNode.format)
            const textNode: TiptapNode = {
                type: 'text',
                text: lexicalNode.text
            }
            if (marks.length > 0) {
                textNode.marks = marks
            }
            return textNode

        case 'linebreak':
            return {
                type: 'hardBreak'
            }

        case 'quote':
            return {
                type: 'blockquote',
                content: convertChildren(lexicalNode.children)
            }

        case 'code':
            return {
                type: 'codeBlock',
                content: convertChildren(lexicalNode.children)
            }

        case 'link':
            // Convert link children with link mark
            const linkChildren = convertChildren(lexicalNode.children)
            return linkChildren.map(child => ({
                ...child,
                marks: [
                    ...(child.marks || []),
                    { type: 'link', attrs: { href: (lexicalNode as unknown as { url: string }).url } }
                ]
            }))

        default:
            // Try to convert unknown nodes as paragraphs with children
            if (lexicalNode.children) {
                return {
                    type: 'paragraph',
                    content: convertChildren(lexicalNode.children)
                }
            }
            return null
    }
}

/**
 * Convert an array of Lexical children to Tiptap nodes
 */
function convertChildren(children: LexicalNode[] | undefined): TiptapNode[] {
    if (!children) return []

    const result: TiptapNode[] = []

    for (const child of children) {
        const converted = convertNode(child)
        if (converted) {
            if (Array.isArray(converted)) {
                result.push(...converted)
            } else {
                result.push(converted)
            }
        }
    }

    return result
}

/**
 * Convert Lexical JSON to Tiptap JSON
 */
export function convertLexicalToTiptap(lexicalContent: LexicalRoot): TiptapDoc {
    try {
        const result = convertNode(lexicalContent.root) as TiptapNode

        if (result.type === 'doc') {
            return result as TiptapDoc
        }

        // Wrap in doc if needed
        return {
            type: 'doc',
            content: [result]
        }
    } catch (error) {
        console.error('Failed to convert Lexical to Tiptap:', error)
        // Return empty document
        return {
            type: 'doc',
            content: [{ type: 'paragraph' }]
        }
    }
}

/**
 * Normalize content to Tiptap format
 * Handles detection and conversion automatically
 */
export function normalizeContent(content: unknown): TiptapDoc | null {
    if (!content) return null

    // If it's a string, try to parse it
    if (typeof content === 'string') {
        try {
            content = JSON.parse(content)
        } catch {
            // If not valid JSON, treat as plain text
            return {
                type: 'doc',
                content: [{
                    type: 'paragraph',
                    content: [{ type: 'text', text: content as string }]
                }]
            }
        }
    }

    // Already Tiptap format
    if (isTiptapFormat(content)) {
        return content as TiptapDoc
    }

    // Convert from Lexical
    if (isLexicalFormat(content)) {
        return convertLexicalToTiptap(content as LexicalRoot)
    }

    // Unknown format, return null
    console.warn('Unknown content format:', content)
    return null
}

/**
 * Convert Tiptap JSON to HTML for storage/display
 */
export function tiptapToHtml(doc: TiptapDoc): string {
    // Basic conversion for server-side use
    // The actual rendering should use Tiptap's generateHTML
    function nodeToHtml(node: TiptapNode): string {
        if (node.type === 'text') {
            let text = node.text || ''
            if (node.marks) {
                for (const mark of node.marks) {
                    switch (mark.type) {
                        case 'bold':
                            text = `<strong>${text}</strong>`
                            break
                        case 'italic':
                            text = `<em>${text}</em>`
                            break
                        case 'underline':
                            text = `<u>${text}</u>`
                            break
                    }
                }
            }
            return text
        }

        const children = node.content?.map(nodeToHtml).join('') || ''

        switch (node.type) {
            case 'doc':
                return children
            case 'paragraph':
                return `<p>${children}</p>`
            case 'heading':
                const level = (node.attrs?.level as number) || 1
                return `<h${level}>${children}</h${level}>`
            case 'bulletList':
                return `<ul>${children}</ul>`
            case 'orderedList':
                return `<ol>${children}</ol>`
            case 'listItem':
                return `<li>${children}</li>`
            case 'blockquote':
                return `<blockquote>${children}</blockquote>`
            case 'codeBlock':
                return `<pre><code>${children}</code></pre>`
            case 'hardBreak':
                return '<br>'
            default:
                return children
        }
    }

    return nodeToHtml(doc)
}
