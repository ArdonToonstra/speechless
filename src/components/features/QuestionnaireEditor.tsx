'use client'

import React, { useState } from 'react'
import { useLocale } from 'next-intl'
import { updateProjectQuestions, sendQuestionnaireToCollaborators, sendQuestionnaireToEmails } from '@/actions/questionnaire'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Trash2, Plus, GripVertical, Copy, Check, Link2, Mail, Loader2, FileText, ChevronDown, X } from 'lucide-react'
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
    const [isSendingAdditional, setIsSendingAdditional] = useState(false)
    const [additionalEmails, setAdditionalEmails] = useState<{ email: string; name: string }[]>([])
    const [newEmail, setNewEmail] = useState('')
    const [newName, setNewName] = useState('')
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

    const addAdditionalEmail = () => {
        if (newEmail && newEmail.includes('@')) {
            setAdditionalEmails([...additionalEmails, { email: newEmail, name: newName }])
            setNewEmail('')
            setNewName('')
        }
    }

    const removeAdditionalEmail = (index: number) => {
        setAdditionalEmails(additionalEmails.filter((_, i) => i !== index))
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

            {/* Share section - two columns side by side */}
            <div className="space-y-3">
                <h2 className="text-sm font-medium text-slate-500">Share</h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Via link */}
                    <div className="bg-white rounded-xl border border-slate-100 p-4">
                        <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-3">Via link</p>
                        <Button
                            onClick={copyLink}
                            variant="outline"
                            size="sm"
                            className={cn(
                                "h-9 rounded-lg w-full",
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

                    {/* Via email — collaborators */}
                    <div className="bg-white rounded-xl border border-slate-100 p-4">
                        <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-3">Via email — collaborators</p>
                        {guests.length === 0 ? (
                            <p className="text-xs text-slate-400">No collaborators yet.</p>
                        ) : (
                            <div className="space-y-2">
                                <div className="space-y-1">
                                    {guests.map((g) => (
                                        <div key={g.id} className="flex items-center gap-1.5 text-xs text-slate-600">
                                            <span className="w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0" />
                                            <span className="font-medium truncate">{g.name || g.email}</span>
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
                                            toast.success(`Sent to ${result.sent} collaborator${result.sent === 1 ? '' : 's'}`)
                                        }
                                    }}
                                    disabled={isSendingEmails}
                                    size="sm"
                                    className="h-9 rounded-lg w-full"
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

                {/* Via email — additional */}
                <div className="bg-white rounded-xl border border-slate-100 p-4">
                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-3">Via email — additional</p>
                    <div className="flex flex-col sm:flex-row gap-2 mb-2">
                        <Input
                            placeholder="Name (optional)"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            className="h-9 text-sm bg-white border-slate-200 rounded-lg sm:w-36"
                        />
                        <Input
                            type="email"
                            placeholder="Email"
                            value={newEmail}
                            onChange={(e) => setNewEmail(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addAdditionalEmail())}
                            className="h-9 text-sm bg-white border-slate-200 rounded-lg sm:flex-1"
                        />
                        <Button
                            onClick={addAdditionalEmail}
                            variant="outline"
                            size="sm"
                            disabled={!newEmail.includes('@')}
                            className="h-9 rounded-lg px-4 shrink-0"
                        >
                            <Plus className="w-4 h-4 mr-1" /> Add
                        </Button>
                    </div>
                    {additionalEmails.length > 0 && (
                        <>
                            <div className="space-y-1 mb-3">
                                {additionalEmails.map((r, index) => (
                                    <div key={index} className="flex items-center gap-2 px-2 py-1 rounded-lg text-sm">
                                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0" />
                                        <span className="font-medium text-slate-900 truncate">{r.name || r.email}</span>
                                        {r.name && <span className="text-xs text-slate-400 truncate">{r.email}</span>}
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removeAdditionalEmail(index)}
                                            className="h-6 w-6 ml-auto text-slate-300 hover:text-red-500 hover:bg-red-50 shrink-0"
                                        >
                                            <X className="w-3 h-3" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                            <Button
                                onClick={async () => {
                                    setIsSendingAdditional(true)
                                    const result = await sendQuestionnaireToEmails(
                                        projectId,
                                        additionalEmails.map(r => ({ email: r.email, name: r.name || undefined }))
                                    )
                                    setIsSendingAdditional(false)
                                    if (result.error) {
                                        toast.error(result.error)
                                    } else {
                                        toast.success(`Sent to ${result.sent} recipient${result.sent === 1 ? '' : 's'}`)
                                        setAdditionalEmails([])
                                    }
                                }}
                                disabled={isSendingAdditional}
                                size="sm"
                                className="h-9 rounded-lg px-4"
                            >
                                {isSendingAdditional ? (
                                    <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Sending...</>
                                ) : (
                                    <><Mail className="w-3.5 h-3.5 mr-1.5" /> Send to {additionalEmails.length}</>
                                )}
                            </Button>
                        </>
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
