'use client'

import React, { useState } from 'react'
import { useLocale } from 'next-intl'
import { updateProjectQuestions, sendQuestionnaireToCollaborators } from '@/actions/questionnaire'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Trash2, Plus, GripVertical, Copy, Check, Link2, Mail, Loader2, FileText, ChevronDown } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { getTemplatesForOccasion, type QuestionTemplate } from '@/data/question-templates'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
    DropdownMenuLabel,
} from '@/components/ui/dropdown-menu'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'

interface Question {
    text: string
    id?: string
}

interface QuestionnaireEditorProps {
    projectId: number
    initialQuestions: Question[]
    initialDescription: string
    speechReceiverName?: string
    shareToken?: string
    occasionType?: string
    guests?: Array<{ id: number; name: string | null; email: string }>
    ownerName?: string
}

export function QuestionnaireEditor({
    projectId,
    initialQuestions,
    initialDescription,
    speechReceiverName,
    shareToken,
    occasionType = 'other',
    guests = [],
    ownerName,
}: QuestionnaireEditorProps) {
    const processedInitialQuestions = initialQuestions?.map(q => ({
        text: speechReceiverName ? q.text.replace(/\{speechReceiverName\}/g, speechReceiverName) : q.text
    })) || []

    const [questions, setQuestions] = useState<Question[]>(processedInitialQuestions)
    const [description, setDescription] = useState(initialDescription || '')
    const [isSaving, setIsSaving] = useState(false)
    const [lastSaved, setLastSaved] = useState<Date | null>(null)
    const [linkCopied, setLinkCopied] = useState(false)
    const [confirmTemplate, setConfirmTemplate] = useState<QuestionTemplate | null>(null)
    const [isSendingEmails, setIsSendingEmails] = useState(false)
    const locale = useLocale()

    const templates = getTemplatesForOccasion(occasionType)

    const shareableLink = shareToken
        ? `${typeof window !== 'undefined' ? window.location.origin : ''}/${locale}/questionnaire/${shareToken}`
        : `${typeof window !== 'undefined' ? window.location.origin : ''}/${locale}/questionnaire/${projectId}`

    const copyLink = () => {
        navigator.clipboard.writeText(shareableLink)
        setLinkCopied(true)
        setTimeout(() => setLinkCopied(false), 2000)
    }

    const addQuestion = () => {
        setQuestions([...questions, { text: '' }])
    }

    const removeQuestion = (index: number) => {
        const newQuestions = [...questions]
        newQuestions.splice(index, 1)
        setQuestions(newQuestions)
    }

    const updateQuestion = (index: number, text: string) => {
        const newQuestions = [...questions]
        newQuestions[index].text = text
        setQuestions(newQuestions)
    }

    const loadTemplate = (template: QuestionTemplate) => {
        if (questions.length > 0 && questions.some(q => q.text.trim())) {
            setConfirmTemplate(template)
        } else {
            applyTemplate(template)
        }
    }

    const applyTemplate = (template: QuestionTemplate) => {
        const processedQuestions = template.questions.map(q => ({
            text: speechReceiverName
                ? q.text.replace(/\{speechReceiverName\}/g, speechReceiverName)
                : q.text
        }))
        setQuestions(processedQuestions)
        setConfirmTemplate(null)
        toast.success(`Loaded "${template.name}" template`)
    }

    const handleSave = React.useCallback(async () => {
        setIsSaving(true)
        const formData = new FormData()
        formData.append('questions', JSON.stringify(questions))
        formData.append('description', description)

        const result = await updateProjectQuestions(projectId, formData)

        setIsSaving(false)
        if (result?.error) {
            // Silent fail for auto-save
        } else {
            setLastSaved(new Date())
        }
    }, [questions, description, projectId])

    React.useEffect(() => {
        const timeoutId = setTimeout(() => {
            handleSave()
        }, 1000)

        return () => clearTimeout(timeoutId)
    }, [handleSave])

    return (
        <div className="space-y-6">
            {/* Questions section */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <h2 className="text-sm font-medium text-slate-500">Questions</h2>
                    <div className="flex items-center gap-3">
                        {lastSaved && (
                            <span className="text-xs text-slate-400">
                                Saved {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        )}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
                                    <FileText className="w-3.5 h-3.5" />
                                    Template
                                    <ChevronDown className="w-3 h-3" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-72">
                                <DropdownMenuLabel className="text-xs text-slate-500 font-normal">
                                    Choose a template for {occasionType} speeches
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                {templates.map((template) => (
                                    <DropdownMenuItem
                                        key={template.id}
                                        onClick={() => loadTemplate(template)}
                                        className="flex flex-col items-start py-3 cursor-pointer"
                                    >
                                        <span className="font-medium">{template.name}</span>
                                        <span className="text-xs text-slate-500">{template.description}</span>
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-100 p-4 space-y-3">
                    <div className="space-y-2">
                        <label className="text-xs text-slate-500">Greeting / Instructions</label>
                        <Textarea
                            placeholder="Welcome! We'd love your input..."
                            value={description}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
                            className="min-h-[80px] bg-white border-slate-200 text-sm rounded-lg resize-y"
                        />
                    </div>

                    <div className="space-y-2">
                        {questions.map((q, index) => (
                            <div key={index} className="flex items-center gap-2 group">
                                <div className="text-slate-300 cursor-move hover:text-slate-500 transition-colors">
                                    <GripVertical className="w-4 h-4" />
                                </div>
                                <Input
                                    value={q.text}
                                    onChange={(e) => updateQuestion(index, e.target.value)}
                                    placeholder={`Question ${index + 1}`}
                                    className="bg-white border-slate-200 h-9 text-sm rounded-lg flex-1"
                                />
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeQuestion(index)}
                                    className="h-7 w-7 text-slate-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                            </div>
                        ))}
                    </div>
                    <Button variant="outline" size="sm" onClick={addQuestion} className="w-full border-dashed border-slate-300 rounded-lg h-9 hover:bg-slate-50 hover:border-slate-400 text-slate-600 text-sm">
                        <Plus className="w-3.5 h-3.5 mr-1.5" /> Add Question
                    </Button>
                </div>
            </div>

            {/* Share section - aligned with collaborators page style */}
            <div className="space-y-3">
                <h2 className="text-sm font-medium text-slate-500">Share</h2>

                {/* Via link */}
                <div className="bg-white rounded-xl border border-slate-100 p-4">
                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-3">Via link</p>
                    <div className="flex items-center gap-2">
                        <Button
                            onClick={copyLink}
                            variant="outline"
                            size="sm"
                            className={cn(
                                "h-9 rounded-lg",
                                linkCopied && "bg-emerald-50 text-emerald-600 border-emerald-200"
                            )}
                        >
                            {linkCopied ? (
                                <><Check className="w-3.5 h-3.5 mr-1.5" /> Copied!</>
                            ) : (
                                <><Link2 className="w-3.5 h-3.5 mr-1.5" /> Copy questionnaire link</>
                            )}
                        </Button>
                    </div>
                </div>

                {/* Via email */}
                <div className="bg-white rounded-xl border border-slate-100 p-4">
                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-3">Via email</p>
                    {guests.length === 0 ? (
                        <p className="text-sm text-slate-400">No collaborators yet. Add team members on the collaborators page.</p>
                    ) : (
                        <div className="space-y-3">
                            <div className="space-y-1">
                                {guests.map((g) => (
                                    <div key={g.id} className="flex items-center gap-2 text-sm text-slate-600">
                                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0" />
                                        <span className="font-medium">{g.name || g.email}</span>
                                        {g.name && <span className="text-slate-400 text-xs">{g.email}</span>}
                                    </div>
                                ))}
                            </div>
                            <Button
                                onClick={async () => {
                                    setIsSendingEmails(true)
                                    const result = await sendQuestionnaireToCollaborators(projectId)
                                    setIsSendingEmails(false)
                                    if (result.error) {
                                        toast.error(result.error)
                                    } else {
                                        toast.success(`Questionnaire sent to ${result.sent} collaborator${result.sent === 1 ? '' : 's'}`)
                                    }
                                }}
                                disabled={isSendingEmails}
                                size="sm"
                                className="h-9 rounded-lg px-4"
                            >
                                {isSendingEmails ? (
                                    <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Sending...</>
                                ) : (
                                    <><Mail className="w-3.5 h-3.5 mr-1.5" /> Send to All</>
                                )}
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {/* Confirmation Dialog for Template Loading */}
            <Dialog open={!!confirmTemplate} onOpenChange={() => setConfirmTemplate(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Replace existing questions?</DialogTitle>
                        <DialogDescription>
                            Loading the &quot;{confirmTemplate?.name}&quot; template will replace your current questions.
                            This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setConfirmTemplate(null)}>
                            Cancel
                        </Button>
                        <Button onClick={() => confirmTemplate && applyTemplate(confirmTemplate)}>
                            Load Template
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
