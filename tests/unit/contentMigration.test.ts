import { describe, it, expect } from 'vitest'
import {
  isLexicalFormat,
  isTiptapFormat,
  convertLexicalToTiptap,
  normalizeContent,
  tiptapToHtml,
} from '@/lib/contentMigration'

// ─── Format detection ────────────────────────────────────────────────────────

describe('isLexicalFormat', () => {
  it('detects Lexical content', () => {
    expect(isLexicalFormat({ root: { type: 'root', children: [] } })).toBe(true)
  })

  it('rejects Tiptap content', () => {
    expect(isLexicalFormat({ type: 'doc', content: [] })).toBe(false)
  })

  it('rejects primitives', () => {
    expect(isLexicalFormat(null)).toBe(false)
    expect(isLexicalFormat(undefined)).toBe(false)
    expect(isLexicalFormat('string')).toBe(false)
    expect(isLexicalFormat(42)).toBe(false)
  })
})

describe('isTiptapFormat', () => {
  it('detects Tiptap content', () => {
    expect(isTiptapFormat({ type: 'doc', content: [] })).toBe(true)
    expect(isTiptapFormat({ type: 'doc', content: [{ type: 'paragraph' }] })).toBe(true)
  })

  it('rejects Lexical content', () => {
    expect(isTiptapFormat({ root: { type: 'root' } })).toBe(false)
  })

  it('rejects content missing required fields', () => {
    expect(isTiptapFormat({ type: 'doc' })).toBe(false) // no content array
    expect(isTiptapFormat({ content: [] })).toBe(false) // no type: 'doc'
  })

  it('rejects primitives', () => {
    expect(isTiptapFormat(null)).toBe(false)
    expect(isTiptapFormat(undefined)).toBe(false)
  })
})

// ─── Lexical → Tiptap conversion ─────────────────────────────────────────────

describe('convertLexicalToTiptap', () => {
  it('converts a simple paragraph with plain text', () => {
    const lexical = {
      root: {
        type: 'root',
        children: [
          {
            type: 'paragraph',
            children: [{ type: 'text', text: 'Hello world', format: 0 }],
          },
        ],
      },
    }
    const result = convertLexicalToTiptap(lexical)
    expect(result.type).toBe('doc')
    expect(result.content[0].type).toBe('paragraph')
    expect(result.content[0].content?.[0]).toMatchObject({ type: 'text', text: 'Hello world' })
  })

  it('converts bold text (format flag 1)', () => {
    const lexical = {
      root: {
        type: 'root',
        children: [
          {
            type: 'paragraph',
            children: [{ type: 'text', text: 'Bold', format: 1 }],
          },
        ],
      },
    }
    const result = convertLexicalToTiptap(lexical)
    const textNode = result.content[0].content?.[0]
    expect(textNode?.marks).toContainEqual({ type: 'bold' })
  })

  it('converts italic text (format flag 2)', () => {
    const lexical = {
      root: {
        type: 'root',
        children: [
          {
            type: 'paragraph',
            children: [{ type: 'text', text: 'Italic', format: 2 }],
          },
        ],
      },
    }
    const result = convertLexicalToTiptap(lexical)
    const textNode = result.content[0].content?.[0]
    expect(textNode?.marks).toContainEqual({ type: 'italic' })
  })

  it('converts underline text (format flag 8)', () => {
    const lexical = {
      root: {
        type: 'root',
        children: [
          {
            type: 'paragraph',
            children: [{ type: 'text', text: 'Underline', format: 8 }],
          },
        ],
      },
    }
    const result = convertLexicalToTiptap(lexical)
    const textNode = result.content[0].content?.[0]
    expect(textNode?.marks).toContainEqual({ type: 'underline' })
  })

  it('converts bold + italic combined (format flag 3)', () => {
    const lexical = {
      root: {
        type: 'root',
        children: [
          {
            type: 'paragraph',
            children: [{ type: 'text', text: 'Both', format: 3 }],
          },
        ],
      },
    }
    const result = convertLexicalToTiptap(lexical)
    const textNode = result.content[0].content?.[0]
    expect(textNode?.marks).toContainEqual({ type: 'bold' })
    expect(textNode?.marks).toContainEqual({ type: 'italic' })
  })

  it('converts h1 heading', () => {
    const lexical = {
      root: {
        type: 'root',
        children: [
          {
            type: 'heading',
            tag: 'h1',
            children: [{ type: 'text', text: 'Title', format: 0 }],
          },
        ],
      },
    }
    const result = convertLexicalToTiptap(lexical)
    expect(result.content[0].type).toBe('heading')
    expect(result.content[0].attrs?.level).toBe(1)
  })

  it('produces a valid doc structure for empty root', () => {
    const lexical = { root: { type: 'root', children: [] } }
    const result = convertLexicalToTiptap(lexical)
    expect(result.type).toBe('doc')
    expect(Array.isArray(result.content)).toBe(true)
  })
})

// ─── normalizeContent ─────────────────────────────────────────────────────────

describe('normalizeContent', () => {
  it('returns Tiptap content as-is', () => {
    const tiptap = { type: 'doc', content: [{ type: 'paragraph' }] }
    expect(normalizeContent(tiptap)).toEqual(tiptap)
  })

  it('converts Lexical content to Tiptap', () => {
    const lexical = {
      root: {
        type: 'root',
        children: [{ type: 'paragraph', children: [] }],
      },
    }
    const result = normalizeContent(lexical)
    expect(result?.type).toBe('doc')
  })

  it('returns null for null/undefined', () => {
    expect(normalizeContent(null)).toBeNull()
    expect(normalizeContent(undefined)).toBeNull()
  })

  it('parses a JSON string of Tiptap content', () => {
    const tiptap = { type: 'doc', content: [] }
    const result = normalizeContent(JSON.stringify(tiptap))
    expect(result?.type).toBe('doc')
  })

  it('wraps a raw string in a paragraph when it is not valid JSON', () => {
    const result = normalizeContent('Hello plain text')
    expect(result?.type).toBe('doc')
    expect(result?.content[0]?.type).toBe('paragraph')
  })
})

// ─── tiptapToHtml ─────────────────────────────────────────────────────────────

describe('tiptapToHtml', () => {
  it('renders a paragraph', () => {
    const doc = {
      type: 'doc' as const,
      content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Hello' }] }],
    }
    expect(tiptapToHtml(doc)).toBe('<p>Hello</p>')
  })

  it('renders a heading', () => {
    const doc = {
      type: 'doc' as const,
      content: [
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: 'Title' }],
        },
      ],
    }
    expect(tiptapToHtml(doc)).toBe('<h2>Title</h2>')
  })

  it('renders bold text', () => {
    const doc = {
      type: 'doc' as const,
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'Bold', marks: [{ type: 'bold' }] }],
        },
      ],
    }
    expect(tiptapToHtml(doc)).toBe('<p><strong>Bold</strong></p>')
  })

  it('renders an empty doc as an empty string', () => {
    const doc = { type: 'doc' as const, content: [] }
    expect(tiptapToHtml(doc)).toBe('')
  })
})
