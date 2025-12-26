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
import { $getRoot, $getSelection, EditorState } from 'lexical'
import { cn } from '@/lib/utils'

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

    // Quick and dirty toolbar for MVP. 
    // In a real app, listen to selection changes to highlight active buttons.
    const format = (format: 'bold' | 'italic' | 'underline') => {
        editor.update(() => {
            const selection = $getSelection()
            if (selection) {
                // @ts-ignore
                selection.formatText(format)
            }
        })
    }

    return (
        <div className="flex gap-2 p-2 border-b border-border bg-muted/20 rounded-t-xl sticky top-0 z-10">
            <button onClick={() => format('bold')} className="p-2 hover:bg-muted/30 rounded font-bold text-foreground">B</button>
            <button onClick={() => format('italic')} className="p-2 hover:bg-muted/30 rounded italic text-foreground">I</button>
            <button onClick={() => format('underline')} className="p-2 hover:bg-muted/30 rounded underline text-foreground">U</button>
            {/* Add more buttons here */}
        </div>
    )
}

interface EditorProps {
    initialState?: any
    onChange: (editorState: EditorState) => void
    readOnly?: boolean
}

export function Editor({ initialState, onChange, readOnly = false }: EditorProps) {
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
        <div className="relative w-full max-w-4xl mx-auto min-h-[500px] bg-card rounded-xl shadow-sm border border-border flex flex-col">
            <LexicalComposer initialConfig={initialConfig}>
                {!readOnly && <ToolbarPlugin />}
                <div className="relative flex-grow">
                    <RichTextPlugin
                        contentEditable={
                            <ContentEditable className={cn("outline-none p-8 min-h-[500px] text-foreground", readOnly && "p-8")} />
                        }
                        placeholder={
                            <div className="absolute top-10 left-10 text-muted-foreground opacity-50 pointer-events-none">
                                Start writing your speech...
                            </div>
                        }
                        ErrorBoundary={LexicalErrorBoundary}
                    />
                    <HistoryPlugin />
                    <ListPlugin />
                    <LinkPlugin />
                    <OnChangePlugin onChange={onChange} />
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
                // Parse if string, otherwise use as object
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
