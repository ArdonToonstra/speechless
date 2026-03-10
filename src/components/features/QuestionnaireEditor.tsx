'use client'

import React, { useState } from 'react'
import { useLocale } from 'next-intl'
import { updateProjectQuestions, sendQuestionnaireToCollaborators } from '@/actions/questionnaire'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Trash2, Plus, GripVertical, Copy, Check, Link2, Mail, Loader2, FileText, ChevronDown } from 'lucide-react'
import { toast } from 'sonner'
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
    id?: string // for key purposes if needed, though index works for simple list
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
    // Replace placeholder in initial questions
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

    // Get available templates for this occasion
    const templates = getTemplatesForOccasion(occasionType)

    // Generate shareable link using share token (non-guessable)
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
        // If there are existing questions, ask for confirmation
        if (questions.length > 0 && questions.some(q => q.text.trim())) {
            setConfirmTemplate(template)
        } else {
            applyTemplate(template)
        }
    }

    const applyTemplate = (template: QuestionTemplate) => {
        // Replace placeholder with actual name if available
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

    // Auto-save effect
    React.useEffect(() => {
        const timeoutId = setTimeout(() => {
            handleSave()
        }, 1000) // 1s debounce

        return () => clearTimeout(timeoutId)
    }, [handleSave])

    return (
        <div className="space-y-6">
            <Card className="border-none shadow-sm rounded-2xl bg-white overflow-hidden">
                <CardHeader className="border-b border-slate-100 bg-white/50 px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-xl font-semibold text-slate-800">Questionnaire</CardTitle>
                            <CardDescription className="text-slate-500">Customize the questions your guests will answer.</CardDescription>
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="gap-2">
                                    <FileText className="w-4 h-4" />
                                    Load Template
                                    <ChevronDown className="w-4 h-4" />
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
                </CardHeader>
                <CardContent className="p-8 space-y-8">
                    <div className="space-y-3">
                        <Label htmlFor="description" className="text-sm font-medium text-slate-700">Greeting / Instructions</Label>
                        <Textarea
                            id="description"
                            placeholder="Welcome! We'd love your input..."
                            value={description}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
                            className="min-h-[100px] bg-white border-slate-200 focus:border-primary focus:ring-primary shadow-sm rounded-xl resize-y"
                        />
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label className="text-sm font-medium text-slate-700">Questions</Label>
                            {lastSaved && (
                                <p className="text-xs text-slate-400">
                                    Saved {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            )}
                        </div>
                        <div className="space-y-3">
                            {questions.map((q, index) => (
                                <div key={index} className="flex items-start gap-3 group">
                                    <div className="mt-3.5 text-slate-300 cursor-move hover:text-slate-500 transition-colors">
                                        <GripVertical className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1">
                                        <Input
                                            value={q.text}
                                            onChange={(e) => updateQuestion(index, e.target.value)}
                                            placeholder={`Question ${index + 1}`}
                                            className="bg-white border-slate-200 focus:border-primary focus:ring-primary shadow-sm h-11 rounded-xl"
                                        />
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => removeQuestion(index)}
                                        className="h-11 w-11 rounded-xl text-slate-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                        <Button variant="outline" size="sm" onClick={addQuestion} className="w-full border-dashed border-slate-300 rounded-xl h-11 hover:bg-slate-50 hover:border-slate-400 text-slate-600">
                            <Plus className="w-4 h-4 mr-2" /> Add Question
                        </Button>
                    </div>


                </CardContent>
            </Card>

            {/* Shareable Link Section */}
            <Card className="border-none shadow-sm rounded-2xl bg-white overflow-hidden">
                <CardHeader className="border-b border-slate-100 bg-white/50 px-8 py-6">
                    <CardTitle className="text-xl font-semibold text-slate-800 flex items-center gap-2">
                        <Link2 className="w-5 h-5" />
                        Share Questionnaire
                    </CardTitle>
                    <CardDescription className="text-slate-500">
                        Share this link with guests to collect their responses
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                    {/* Copy link (no URL shown) */}
                    <div className="flex items-center gap-3">
                        <Button
                            onClick={copyLink}
                            variant="outline"
                            className={linkCopied ? "bg-emerald-50 text-emerald-600 border-emerald-200 rounded-xl h-11 px-5" : "rounded-xl h-11 px-5"}
                        >
                            {linkCopied ? (
                                <>
                                    <Check className="w-4 h-4 mr-2" />
                                    Link copied!
                                </>
                            ) : (
                                <>
                                    <Copy className="w-4 h-4 mr-2" />
                                    Copy Link
                                </>
                            )}
                        </Button>
                        <span className="text-sm text-slate-400">Share with anyone to collect responses</span>
                    </div>

                    {/* Divider */}
                    <div className="flex items-center gap-3">
                        <hr className="flex-1 border-slate-100" />
                        <span className="text-xs text-slate-400 font-medium uppercase tracking-wide">or</span>
                        <hr className="flex-1 border-slate-100" />
                    </div>

                    {/* Send to collaborators */}
                    <div className="space-y-3">
                        <p className="text-sm font-medium text-slate-700 flex items-center gap-2">
                            <Mail className="w-4 h-4 text-slate-400" />
                            Send to collaborators
                        </p>
                        {guests.length === 0 ? (
                            <p className="text-sm text-slate-400">No collaborators yet. Add team members on the collaborators page.</p>
                        ) : (
                            <>
                                <ul className="space-y-1.5">
                                    {guests.map((g) => (
                                        <li key={g.id} className="flex items-center gap-2 text-sm text-slate-600">
                                            <span className="w-2 h-2 rounded-full bg-slate-300 shrink-0" />
                                            <span className="font-medium">{g.name || g.email}</span>
                                            {g.name && <span className="text-slate-400">{g.email}</span>}
                                        </li>
                                    ))}
                                </ul>
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
                                    className="rounded-xl h-11 px-5"
                                >
                                    {isSendingEmails ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Sending...
                                        </>
                                    ) : (
                                        <>
                                            <Mail className="w-4 h-4 mr-2" />
                                            Send to All
                                        </>
                                    )}
                                </Button>
                            </>
                        )}
                    </div>
                </CardContent>
            </Card>

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
