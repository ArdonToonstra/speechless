'use client'


import React, { useCallback, useEffect, useState, useRef, useMemo } from 'react'
import { useEditor, EditorContent, Editor } from '@tiptap/react'
import { QuestionItem } from '@/db/schema'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Placeholder from '@tiptap/extension-placeholder'
import Highlight from '@tiptap/extension-highlight'
import { cn } from '@/lib/utils'
import {
    Bold,
    Italic,
    Underline as UnderlineIcon,
    Heading1,
    Heading2,
    List as ListIcon,
    ListOrdered,
    Sparkles,
    FileText,
    BookOpen,
    MessageSquare,
    ChevronRight
} from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuSub,
    DropdownMenuSubTrigger,
    DropdownMenuSubContent
} from '@/components/ui/dropdown-menu'
import { SPEECH_TEMPLATES } from './templates'
import { HemingwayPanel } from './HemingwayPanel'
import { analyzeText, AnalysisResult } from '@/lib/textAnalysis'
import { HemingwayExtension } from './extensions/HemingwayExtension'

interface TiptapEditorProps {
    initialContent?: any // Tiptap Content type (string | JSON | null)
    onChange?: (content: string, json: object) => void
    onStatsChange?: (stats: { words: number; chars: number; readTime: number }) => void
    readOnly?: boolean
    placeholder?: string
    questions?: QuestionItem[]
    submissions?: any[] // We can use 'any' or import the type if we want to be strict
    speechReceiverName?: string
}

const ButtonBase = React.forwardRef<
    HTMLButtonElement,
    {
        active: boolean
        onClick: () => void
        children: React.ReactNode
        label: string
        variant?: 'default' | 'accent'
    } & React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ active, onClick, children, label, variant = 'default', className, ...props }, ref) => (
    <button
        ref={ref}
        type="button"
        onClick={onClick}
        title={label}
        className={cn(
            "p-2 rounded w-8 h-8 flex items-center justify-center transition-colors",
            variant === 'accent' && active && "bg-amber-500 text-white",
            variant === 'accent' && !active && "text-amber-600 hover:bg-amber-100 dark:hover:bg-amber-900/30",
            variant === 'default' && active && "bg-primary text-primary-foreground",
            variant === 'default' && !active && "text-foreground hover:bg-muted/30",
            className
        )}
        {...props}
    >
        {children}
    </button>
))
ButtonBase.displayName = "ButtonBase"

export function TiptapEditor({
    initialContent,
    onChange,
    onStatsChange,
    readOnly = false,
    placeholder = "Start writing your speech...",
    questions = [],
    submissions = [],
    speechReceiverName = 'them'
}: TiptapEditorProps) {
    const [hemingwayEnabled, setHemingwayEnabled] = useState(false)
    const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
    const [isAnalyzing, setIsAnalyzing] = useState(false)
    const analysisTimeoutRef = useRef<NodeJS.Timeout | null>(null)

    // Group answers logic
    const groupedAnswers = useMemo(() => {
        if (!questions?.length || !submissions?.length) return []

        const renderQuestion = (text: string) => {
            return text.replace(/{speechReceiverName}/g, speechReceiverName || 'them')
        }

        return questions.map((q) => {
            const questionText = renderQuestion(q.question)
            const answersForQuestion: { answer: string; submitterName: string }[] = []

            submissions.forEach((submission) => {
                if (!submission.answers) return

                const matchingAnswer = submission.answers.find((a: any) => {
                    return a.question === questionText ||
                        a.question === q.question ||
                        a.question.replace(/{speechReceiverName}/g, speechReceiverName || 'them') === questionText
                })

                if (matchingAnswer && matchingAnswer.answer && matchingAnswer.answer.trim()) {
                    answersForQuestion.push({
                        answer: matchingAnswer.answer,
                        submitterName: submission.submitterName || 'Anonymous',
                    })
                }
            })

            return {
                question: questionText || "Unknown Question",
                answers: answersForQuestion,
            }
        }).filter(group => group.answers.length > 0)
    }, [questions, submissions, speechReceiverName])

    // Use refs to avoid stale closures in callbacks
    const hemingwayEnabledRef = useRef(hemingwayEnabled)
    const editorRef = useRef<Editor | null>(null)

    // Keep refs in sync with state
    useEffect(() => {
        hemingwayEnabledRef.current = hemingwayEnabled
    }, [hemingwayEnabled])

    // Run analysis with debounce
    const runDebouncedAnalysis = useCallback((text: string) => {
        if (analysisTimeoutRef.current) {
            clearTimeout(analysisTimeoutRef.current)
        }

        setIsAnalyzing(true)
        analysisTimeoutRef.current = setTimeout(async () => {
            try {
                const result = await analyzeText(text)
                setAnalysisResult(result)

                // Update highlights using the ref
                const currentEditor = editorRef.current
                if (currentEditor && !currentEditor.isDestroyed) {
                    currentEditor.view.dispatch(
                        currentEditor.view.state.tr.setMeta('hemingwayAnalysis', result)
                    )
                }
            } catch (error) {
                console.error('Analysis failed:', error)
            } finally {
                setIsAnalyzing(false)
            }
        }, 500)
    }, [])

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [1, 2, 3]
                }
            }),
            Underline,
            Placeholder.configure({
                placeholder,
                emptyEditorClass: 'is-editor-empty'
            }),
            Highlight.configure({
                multicolor: true
            }),
            HemingwayExtension
        ],
        content: initialContent || '',
        immediatelyRender: false,
        editable: !readOnly,
        editorProps: {
            attributes: {
                class: cn(
                    'outline-none min-h-[600px] text-foreground font-serif text-lg leading-relaxed max-w-none prose prose-slate dark:prose-invert',
                    'prose-headings:text-foreground prose-p:mb-4 prose-p:leading-relaxed',
                    'prose-h1:text-4xl prose-h1:font-bold prose-h1:mb-4 prose-h1:mt-8',
                    'prose-h2:text-3xl prose-h2:font-bold prose-h2:mb-3 prose-h2:mt-6',
                    'prose-h3:text-2xl prose-h3:font-bold prose-h3:mb-2 prose-h3:mt-4',
                    'prose-ul:list-disc prose-ul:ml-6 prose-ul:mb-4',
                    'prose-ol:list-decimal prose-ol:ml-6 prose-ol:mb-4',
                    readOnly ? 'p-8' : 'p-12'
                )
            }
        },
        onUpdate: ({ editor }) => {
            const text = editor.getText({ blockSeparator: '\n' })
            const json = editor.getJSON()

            // Calculate stats
            const words = text.split(/\s+/).filter(w => w.length > 0).length
            const chars = text.length
            const readTime = Math.ceil(words / 150) // 150 wpm for speeches

            onStatsChange?.({ words, chars, readTime })
            onChange?.(editor.getHTML(), json)

            // Trigger analysis if Hemingway mode is enabled (use ref for current value)
            if (hemingwayEnabledRef.current) {
                runDebouncedAnalysis(text)
            }
        }
    })

    // Keep editor ref in sync
    useEffect(() => {
        editorRef.current = editor
    }, [editor])

    // Toggle Hemingway mode
    const toggleHemingway = useCallback(() => {
        const newState = !hemingwayEnabled
        setHemingwayEnabled(newState)

        if (newState && editor) {
            runDebouncedAnalysis(editor.getText({ blockSeparator: '\n' }))
        } else {
            setAnalysisResult(null)
            // Clear decorations when disabling Hemingway mode
            if (editor && !editor.isDestroyed) {
                editor.view.dispatch(
                    editor.view.state.tr.setMeta('hemingwayAnalysis', null)
                )
            }
        }
    }, [hemingwayEnabled, editor, runDebouncedAnalysis])

    // Initial stats calculation
    useEffect(() => {
        if (editor && onStatsChange) {
            const text = editor.getText({ blockSeparator: '\n' })
            const words = text.split(/\s+/).filter(w => w.length > 0).length
            const chars = text.length
            const readTime = Math.ceil(words / 150)
            onStatsChange({ words, chars, readTime })
        }
    }, [editor, onStatsChange])

    // Cleanup
    useEffect(() => {
        return () => {
            if (analysisTimeoutRef.current) {
                clearTimeout(analysisTimeoutRef.current)
            }
        }
    }, [])

    if (!editor) {
        return null
    }


    return (
        <div className="relative w-full flex flex-col">
            {/* Toolbar */}
            {!readOnly && (
                <div className="flex gap-2 p-3 border-b border-border bg-card items-center flex-wrap justify-between">
                    <div className="flex gap-2 items-center flex-wrap">
                        {/* Heading buttons */}
                        <div className="flex gap-1">
                            <ButtonBase
                                active={editor.isActive('heading', { level: 1 })}
                                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                                label="Heading 1"
                            >
                                <Heading1 className="w-4 h-4" />
                            </ButtonBase>
                            <ButtonBase
                                active={editor.isActive('heading', { level: 2 })}
                                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                                label="Heading 2"
                            >
                                <Heading2 className="w-4 h-4" />
                            </ButtonBase>
                        </div>

                        <div className="w-px h-6 bg-border mx-2" />

                        {/* Text formatting */}
                        <div className="flex gap-1">
                            <ButtonBase
                                active={editor.isActive('bold')}
                                onClick={() => editor.chain().focus().toggleBold().run()}
                                label="Bold"
                            >
                                <Bold className="w-4 h-4" />
                            </ButtonBase>
                            <ButtonBase
                                active={editor.isActive('italic')}
                                onClick={() => editor.chain().focus().toggleItalic().run()}
                                label="Italic"
                            >
                                <Italic className="w-4 h-4" />
                            </ButtonBase>
                            <ButtonBase
                                active={editor.isActive('underline')}
                                onClick={() => editor.chain().focus().toggleUnderline().run()}
                                label="Underline"
                            >
                                <UnderlineIcon className="w-4 h-4" />
                            </ButtonBase>
                        </div>

                        <div className="w-px h-6 bg-border mx-2" />

                        {/* Lists */}
                        <div className="flex gap-1">
                            <ButtonBase
                                active={editor.isActive('bulletList')}
                                onClick={() => editor.chain().focus().toggleBulletList().run()}
                                label="Bullet List"
                            >
                                <ListIcon className="w-4 h-4" />
                            </ButtonBase>
                            <ButtonBase
                                active={editor.isActive('orderedList')}
                                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                                label="Numbered List"
                            >
                                <ListOrdered className="w-4 h-4" />
                            </ButtonBase>
                        </div>

                        <div className="w-px h-6 bg-border mx-2" />

                        {/* Templates & Library */}
                        <div className="flex gap-1">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <ButtonBase
                                        active={false}
                                        onClick={() => { }}
                                        label="Insert Template"
                                    >
                                        <FileText className="w-4 h-4" />
                                    </ButtonBase>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="start">
                                    <DropdownMenuLabel>Speech Templates</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    {SPEECH_TEMPLATES.map((template) => (
                                        <DropdownMenuItem
                                            key={template.id}
                                            onClick={() => {
                                                editor.chain().focus('end').insertContent(template.content).run()
                                            }}
                                        >
                                            {template.label}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <ButtonBase
                                        active={false}
                                        onClick={() => { }}
                                        label="Content Library"
                                    >
                                        <BookOpen className="w-4 h-4" />
                                    </ButtonBase>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="start">
                                    <DropdownMenuLabel>Helpful Resources</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => window.open('https://coveteur.com/how-to-write-a-good-wedding-speech', '_blank')}>
                                        How to Write a Good Wedding Speech
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => window.open('https://www.oprahdaily.com/life/health/a64041503/how-to-write-a-speech/', '_blank')}>
                                        Oprah Daily: How to Write a Speech
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>

                    {/* Hemingway toggle */}
                    <div className="flex gap-1 items-center">
                        <ButtonBase
                            active={hemingwayEnabled}
                            onClick={toggleHemingway}
                            label="Writing Assistant"
                            variant="accent"
                        >
                            <Sparkles className="w-4 h-4" />
                        </ButtonBase>
                        {hemingwayEnabled && (
                            <span className="text-xs text-amber-600 dark:text-amber-400 font-medium ml-1 hidden sm:inline">
                                Writing Assistant
                            </span>
                        )}
                    </div>
                </div>
            )}

            {/* Editor with Hemingway Panel */}
            <div className={cn(
                "relative flex-grow flex",
                hemingwayEnabled ? "flex-col lg:flex-row" : ""
            )}>
                {/* Editor Content */}
                <div className={cn(
                    "flex-grow relative",
                    hemingwayEnabled ? "lg:w-2/3" : "w-full"
                )}>
                    <EditorContent editor={editor} />

                    {/* Placeholder and Hemingway highlight styling */}
                    <style jsx global>{`
            .ProseMirror p.is-editor-empty:first-child::before {
              content: attr(data-placeholder);
              float: left;
              color: var(--muted-foreground);
              opacity: 0.5;
              pointer-events: none;
              height: 0;
              font-style: italic;
            }
            
            .ProseMirror:focus {
              outline: none;
            }
            
            /* Hemingway highlight styles - ensure they override prose styles */
            .ProseMirror [data-issue-type="passive"] {
              background-color: rgb(191 219 254) !important; /* blue-200 */
              border-radius: 2px;
              padding: 0 2px;
              margin: 0 -2px;
            }
            .dark .ProseMirror [data-issue-type="passive"] {
              background-color: rgb(30 58 138 / 0.5) !important; /* blue-900/50 */
            }
            
            .ProseMirror [data-issue-type="hard-sentence"] {
              background-color: rgb(254 240 138) !important; /* yellow-200 */
              border-radius: 2px;
              padding: 0 2px;
              margin: 0 -2px;
            }
            .dark .ProseMirror [data-issue-type="hard-sentence"] {
              background-color: rgb(113 63 18 / 0.5) !important; /* yellow-900/50 */
            }
            
            .ProseMirror [data-issue-type="very-hard-sentence"] {
              background-color: rgb(254 202 202) !important; /* red-200 */
              border-radius: 2px;
              padding: 0 2px;
              margin: 0 -2px;
            }
            .dark .ProseMirror [data-issue-type="very-hard-sentence"] {
              background-color: rgb(127 29 29 / 0.5) !important; /* red-900/50 */
            }
            
            .ProseMirror [data-issue-type="adverb"] {
              background-color: rgb(233 213 255) !important; /* purple-200 */
              border-radius: 2px;
              padding: 0 2px;
              margin: 0 -2px;
            }
            .dark .ProseMirror [data-issue-type="adverb"] {
              background-color: rgb(88 28 135 / 0.5) !important; /* purple-900/50 */
            }
            
            .ProseMirror [data-issue-type="simpler-alternative"] {
              border-bottom: 2px solid rgb(34 197 94) !important; /* green-500 */
            }
          `}</style>
                </div>

                {/* Hemingway Panel */}
                {hemingwayEnabled && !readOnly && (
                    <div className="lg:w-1/3 border-l border-border">
                        <HemingwayPanel
                            result={analysisResult}
                            isAnalyzing={isAnalyzing}
                        />
                    </div>
                )}
            </div>
        </div>
    )
}

export default TiptapEditor
