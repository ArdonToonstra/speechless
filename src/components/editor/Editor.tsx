'use client'

import React, { useEffect, useState } from 'react'
import { LexicalComposer } from '@lexical/react/LexicalComposer'
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin'
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary'
import { HeadingNode, QuoteNode } from '@lexical/rich-text'
import { TableNode, TableCellNode, TableRowNode } from '@lexical/table'
import { ListItemNode, ListNode } from '@lexical/list'
import { CodeHighlightNode, CodeNode } from '@lexical/code'
import { AutoLinkNode, LinkNode } from '@lexical/link'
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin'
import { ListPlugin } from '@lexical/react/LexicalListPlugin'
import { $getRoot, $getSelection, EditorState, $isRangeSelection, SELECTION_CHANGE_COMMAND, COMMAND_PRIORITY_CRITICAL, $createParagraphNode } from 'lexical'
import { $createHeadingNode, $isHeadingNode } from '@lexical/rich-text'
import { $setBlocksType } from '@lexical/selection'
import { $isListNode, INSERT_ORDERED_LIST_COMMAND, INSERT_UNORDERED_LIST_COMMAND, REMOVE_LIST_COMMAND } from '@lexical/list'
import { cn } from '@/lib/utils'
import { Bold, Italic, Underline as UnderlineIcon, Heading1, Heading2, List as ListIcon, ListOrdered } from 'lucide-react'

// Theme
const theme = {
    ltr: 'ltr',
    rtl: 'rtl',
    paragraph: 'mb-4 text-lg leading-relaxed text-foreground font-serif',
    heading: {
        h1: 'text-4xl font-bold mb-4 mt-8 text-foreground',
        h2: 'text-3xl font-bold mb-3 mt-6 text-foreground',
        h3: 'text-2xl font-bold mb-2 mt-4 text-foreground',
    },
    list: {
        ul: 'list-disc ml-6 mb-4 text-foreground',
        ol: 'list-decimal ml-6 mb-4 text-foreground',
    },
    quote: 'border-l-4 border-muted pl-4 italic text-muted-foreground my-4',
    link: 'text-primary underline cursor-pointer',
    text: {
        bold: 'font-bold',
        italic: 'italic',
        underline: 'underline',
        strikethrough: 'line-through',
    },
}

function ToolbarPlugin() {
    const [editor] = useLexicalComposerContext()
    const [isBold, setIsBold] = useState(false)
    const [isItalic, setIsItalic] = useState(false)
    const [isUnderline, setIsUnderline] = useState(false)
    const [blockType, setBlockType] = useState('paragraph')

    const updateToolbar = React.useCallback(() => {
        const selection = $getSelection()
        if ($isRangeSelection(selection)) {
            setIsBold(selection.hasFormat('bold'))
            setIsItalic(selection.hasFormat('italic'))
            setIsUnderline(selection.hasFormat('underline'))

            const anchorNode = selection.anchor.getNode()
            const element = anchorNode.getKey() === 'root'
                ? anchorNode
                : anchorNode.getTopLevelElementOrThrow()

            const elementKey = element.getKey()
            const elementDOM = editor.getElementByKey(elementKey)

            if (elementDOM !== null) {
                if ($isListNode(element)) {
                    const parentList = element.getParent()
                    if ($isListNode(parentList)) {
                        setBlockType(parentList.getTag())
                    } else {
                        setBlockType(element.getTag())
                    }
                } else {
                    const type = $isHeadingNode(element) ? element.getTag() : element.getType()
                    setBlockType(type)
                }
            }
        }
    }, [editor])

    useEffect(() => {
        return editor.registerCommand(
            SELECTION_CHANGE_COMMAND,
            (_payload) => {
                updateToolbar()
                return false
            },
            COMMAND_PRIORITY_CRITICAL,
        )
    }, [editor, updateToolbar])

    useEffect(() => {
        return editor.registerUpdateListener(({ editorState }) => {
            editorState.read(() => {
                updateToolbar()
            })
        })
    }, [editor, updateToolbar])

    const format = (format: 'bold' | 'italic' | 'underline') => {
        editor.update(() => {
            const selection = $getSelection()
            if (selection) {
                // @ts-ignore
                selection.formatText(format)
            }
        })
    }

    const formatHeading = (headingTag: 'h1' | 'h2') => {
        if (blockType === headingTag) {
            // Toggle off? Convert directly to paragraph
            editor.update(() => {
                const selection = $getSelection()
                if ($isRangeSelection(selection)) {
                    $setBlocksType(selection, () => $createParagraphNode())
                }
            })
        } else {
            editor.update(() => {
                const selection = $getSelection()
                if ($isRangeSelection(selection)) {
                    $setBlocksType(selection, () => $createHeadingNode(headingTag))
                }
            })
        }
    }

    const formatList = (listType: 'ul' | 'ol') => {
        if (blockType === listType) {
            editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined)
        } else {
            if (listType === 'ul') {
                editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)
            } else {
                editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)
            }
        }
    }

    const ButtonBase = ({ active, onClick, children, label }: { active: boolean, onClick: () => void, children: React.ReactNode, label: string }) => (
        <button
            onClick={onClick}
            title={label}
            className={cn(
                "p-2 rounded w-8 h-8 flex items-center justify-center transition-colors",
                active ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted/30"
            )}
        >
            {children}
        </button>
    )

    return (
        <div className="flex gap-2 p-2 border-b border-border bg-muted/20 rounded-t-xl sticky top-0 z-10 items-center flex-wrap">
            <div className="flex gap-1">
                <ButtonBase active={blockType === 'h1'} onClick={() => formatHeading('h1')} label="Heading 1">
                    <Heading1 className="w-4 h-4" />
                </ButtonBase>
                <ButtonBase active={blockType === 'h2'} onClick={() => formatHeading('h2')} label="Heading 2">
                    <Heading2 className="w-4 h-4" />
                </ButtonBase>
            </div>
            <div className="w-px h-6 bg-border mx-2" />

            <div className="flex gap-1">
                <ButtonBase active={isBold} onClick={() => format('bold')} label="Bold">
                    <Bold className="w-4 h-4" />
                </ButtonBase>
                <ButtonBase active={isItalic} onClick={() => format('italic')} label="Italic">
                    <Italic className="w-4 h-4" />
                </ButtonBase>
                <ButtonBase active={isUnderline} onClick={() => format('underline')} label="Underline">
                    <UnderlineIcon className="w-4 h-4" />
                </ButtonBase>
            </div>
            <div className="w-px h-6 bg-border mx-2" />

            <div className="flex gap-1">
                <ButtonBase active={blockType === 'ul'} onClick={() => formatList('ul')} label="Bullet List">
                    <ListIcon className="w-4 h-4" />
                </ButtonBase>
                <ButtonBase active={blockType === 'ol'} onClick={() => formatList('ol')} label="Numbered List">
                    <ListOrdered className="w-4 h-4" />
                </ButtonBase>
            </div>
        </div>
    )
}

// Simple stats plugin
function StatsPlugin({ onChange }: { onChange: (stats: { words: number, chars: number, readTime: number }) => void }) {
    const [editor] = useLexicalComposerContext()

    useEffect(() => {
        return editor.registerUpdateListener(({ editorState }) => {
            editorState.read(() => {
                const root = $getRoot()
                const textContent = root.getTextContent()
                const words = textContent.split(/\s+/).filter(w => w.length > 0).length
                const chars = textContent.length
                // Average reading speed: 200 words per minute
                const readTime = Math.ceil(words / 200)

                onChange({ words, chars, readTime })
            })
        })
    }, [editor, onChange])

    return null
}

interface EditorProps {
    initialState?: any
    onChange?: (editorState: EditorState) => void
    readOnly?: boolean
    onStatsChange?: (stats: { words: number, chars: number, readTime: number }) => void
}

export function Editor({ initialState, onChange, readOnly = false, onStatsChange }: EditorProps) {
    const initialConfig = {
        namespace: 'SpeechlessEditor',
        theme,
        onError: (e: Error) => console.error(e),
        editable: !readOnly,
        nodes: [
            HeadingNode,
            QuoteNode,
            ListNode,
            ListItemNode,
            LinkNode,
            AutoLinkNode,
            CodeNode,
            CodeHighlightNode,
            TableNode,
            TableCellNode,
            TableRowNode,
        ]
    }

    return (
        <div className="relative w-full max-w-4xl mx-auto min-h-[600px] bg-card rounded-xl shadow-sm border border-border flex flex-col transition-all duration-500">
            <LexicalComposer initialConfig={initialConfig}>
                {!readOnly && <ToolbarPlugin />}
                <div className="relative flex-grow">
                    <RichTextPlugin
                        contentEditable={
                            <ContentEditable className={cn("outline-none p-12 min-h-[600px] text-foreground font-serif text-lg leading-relaxed max-w-none prose prose-slate dark:prose-invert", readOnly && "p-8")} />
                        }
                        placeholder={
                            <div className="absolute top-14 left-14 text-muted-foreground opacity-50 pointer-events-none font-serif text-lg">
                                Start writing your speech...
                            </div>
                        }
                        ErrorBoundary={LexicalErrorBoundary}
                    />
                    <HistoryPlugin />
                    <ListPlugin />
                    <LinkPlugin />
                    {onChange && <OnChangePlugin onChange={onChange} />}
                    {onStatsChange && <StatsPlugin onChange={onStatsChange} />}
                    {initialState && <LoadInitialStatePlugin initialState={initialState} />}
                </div>
            </LexicalComposer>
        </div>
    )
}

function LoadInitialStatePlugin({ initialState }: { initialState: any }) {
    const [editor] = useLexicalComposerContext()
    const [isLoaded, setIsLoaded] = useState(false)

    useEffect(() => {
        if (!isLoaded && initialState) {
            try {
                const state = typeof initialState === 'string' ? JSON.parse(initialState) : initialState
                const editorState = editor.parseEditorState(state)
                editor.setEditorState(editorState)
                setIsLoaded(true)
            } catch (e) {
                console.error("Failed to load initial state", e)
            }
        }
    }, [editor, initialState, isLoaded])

    return null
}
