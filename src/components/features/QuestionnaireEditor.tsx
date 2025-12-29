'use client'

import React, { useState } from 'react'
import { updateProjectQuestions } from '@/actions/questionnaire'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Trash2, Plus, GripVertical, Save, Loader2, Copy, Check, Link2, Mail } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface Question {
    text: string
    id?: string // for key purposes if needed, though index works for simple list
}

interface QuestionnaireEditorProps {
    projectId: number
    initialQuestions: Question[]
    initialDescription: string
    speechReceiverName?: string
    magicLinkToken?: string
}

export function QuestionnaireEditor({ projectId, initialQuestions, initialDescription, speechReceiverName, magicLinkToken }: QuestionnaireEditorProps) {
    const [questions, setQuestions] = useState<Question[]>(initialQuestions || [])
    const [description, setDescription] = useState(initialDescription || '')
    const [isSaving, setIsSaving] = useState(false)
    const [linkCopied, setLinkCopied] = useState(false)
    const router = useRouter()

    // Generate shareable link using magic token (non-guessable)
    const shareableLink = magicLinkToken
        ? `${typeof window !== 'undefined' ? window.location.origin : ''}/questionnaire/${magicLinkToken}`
        : `${typeof window !== 'undefined' ? window.location.origin : ''}/questionnaire/${projectId}`

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

    const handleSave = async () => {
        setIsSaving(true)
        const formData = new FormData()
        formData.append('questions', JSON.stringify(questions))
        formData.append('description', description)

        const result = await updateProjectQuestions(projectId, formData)

        setIsSaving(false)
        if (result?.error) {
            alert('Failed to save questionnaire') // Replace with toast if available
        } else {
            toast.success('Questionnaire saved successfully!')
        }
    }

    // Helper to replace placeholder in displayed questions
    const renderQuestionText = (text: string) => {
        if (speechReceiverName) {
            return text.replace(/{speechReceiverName}/g, speechReceiverName)
        }
        return text
    }

    return (
        <div className="space-y-6">
            <Card className="border-none shadow-sm rounded-2xl bg-white overflow-hidden">
                <CardHeader className="border-b border-slate-100 bg-white/50 px-8 py-6">
                    <CardTitle className="text-xl font-semibold text-slate-800">Questionnaire</CardTitle>
                    <CardDescription className="text-slate-500">Customize the questions your guests will answer.</CardDescription>
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
                            {speechReceiverName && (
                                <p className="text-xs text-slate-500">
                                    Use <code className="bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 text-xs font-mono">{'{speechReceiverName}'}</code> to personalize
                                </p>
                            )}
                        </div>
                        <div className="space-y-3">
                            {questions.map((q, index) => (
                                <div key={index} className="flex items-start gap-3 group">
                                    <div className="mt-3.5 text-slate-300 cursor-move hover:text-slate-500 transition-colors">
                                        <GripVertical className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1 space-y-1.5">
                                        <Input
                                            value={q.text}
                                            onChange={(e) => updateQuestion(index, e.target.value)}
                                            placeholder={`Question ${index + 1}`}
                                            className="bg-white border-slate-200 focus:border-primary focus:ring-primary shadow-sm h-11 rounded-xl"
                                        />
                                        {speechReceiverName && q.text.includes('{speechReceiverName}') && (
                                            <p className="text-xs text-emerald-600 flex items-center gap-1.5 pl-1">
                                                <span className="font-semibold">Preview:</span> {renderQuestionText(q.text)}
                                            </p>
                                        )}
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

                    <div className="flex justify-end pt-6 border-t border-slate-100">
                        <Button onClick={handleSave} disabled={isSaving} className="rounded-xl px-6 shadow-sm">
                            {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                            Save Changes
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Shareable Link Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Link2 className="w-5 h-5" />
                        Share Questionnaire
                    </CardTitle>
                    <CardDescription>Share this link with guests to collect their responses</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex gap-2">
                        <Input
                            value={shareableLink}
                            readOnly
                            className="font-mono text-sm"
                        />
                        <Button
                            onClick={copyLink}
                            variant={linkCopied ? "default" : "outline"}
                            className="shrink-0"
                        >
                            {linkCopied ? (
                                <>
                                    <Check className="w-4 h-4 mr-2" />
                                    Copied!
                                </>
                            ) : (
                                <>
                                    <Copy className="w-4 h-4 mr-2" />
                                    Copy Link
                                </>
                            )}
                        </Button>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="w-4 h-4" />
                        <span>Email sending:</span>
                        <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                            Coming Soon
                        </Badge>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
