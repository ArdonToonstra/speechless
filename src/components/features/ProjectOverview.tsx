'use client'

import React, { useState } from 'react'
import { updateProjectMetadata } from '@/actions/overview'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Save, Loader2, Calendar as CalendarIcon } from 'lucide-react'
import { toast } from 'sonner'
import { Project } from '@/payload-types'

interface ProjectOverviewProps {
    project: Project
}

export function ProjectOverview({ project }: ProjectOverviewProps) {
    const [title, setTitle] = useState(project.title)
    const [date, setDate] = useState(new Date(project.date).toISOString().split('T')[0])
    const [type, setType] = useState<string>(project.type)
    const [occasionType, setOccasionType] = useState<string>((project as any).occasionType || 'gift')
    const [isSaving, setIsSaving] = useState(false)

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSaving(true)

        const formData = new FormData()
        formData.append('title', title)
        formData.append('date', date)
        formData.append('type', type)
        formData.append('occasionType', occasionType)

        const result = await updateProjectMetadata(project.id, formData)

        setIsSaving(false)
        if (result?.error) {
            toast.error('Failed to update project details')
        } else {
            toast.success('Project details updated!')
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Project Details</CardTitle>
                <CardDescription>Update the core information for your speech.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSave} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Speech Title</Label>
                        <Input
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="font-medium text-lg"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Your Role / Context</Label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div
                                className={`cursor-pointer border rounded-lg p-4 transition-all hover:bg-muted/50 ${occasionType === 'gift' ? 'border-primary ring-1 ring-primary bg-primary/5' : 'border-border'}`}
                                onClick={() => setOccasionType('gift')}
                            >
                                <div className="font-semibold text-sm mb-1">🎁 Guest Speaker (Present)</div>
                                <div className="text-xs text-muted-foreground">I'm giving this speech as a surprise/gift. I need to organize the moment and invites.</div>
                            </div>
                            <div
                                className={`cursor-pointer border rounded-lg p-4 transition-all hover:bg-muted/50 ${occasionType === 'standard' ? 'border-primary ring-1 ring-primary bg-primary/5' : 'border-border'}`}
                                onClick={() => setOccasionType('standard')}
                            >
                                <div className="font-semibold text-sm mb-1">🎤 Event Host (Standard)</div>
                                <div className="text-xs text-muted-foreground">I'm hosting or just speaking. Logistics/invites are handled separately.</div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="type">Occasion Type</Label>
                            <Select value={type} onValueChange={setType}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="wedding">Wedding</SelectItem>
                                    <SelectItem value="birthday">Birthday</SelectItem>
                                    <SelectItem value="funeral">Funeral</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="date">Date</Label>
                            <div className="relative">
                                <Input
                                    id="date"
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    className="pl-10"
                                />
                                <CalendarIcon className="w-4 h-4 text-muted-foreground absolute left-3 top-3 pointer-events-none" />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end pt-4">
                        <Button type="submit" disabled={isSaving}>
                            {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                            Save Changes
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    )
}
