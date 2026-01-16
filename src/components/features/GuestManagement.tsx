'use client'

import React, { useState } from 'react'
import { inviteGuest, deleteGuest } from '@/actions/guests'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Trash2, Plus, Mail, Copy, Check, Loader2 } from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

interface Guest {
    id: number
    email: string
    name: string | null
    projectId: number
    token: string | null
    role: string
    status: string
    invitedAt?: Date | string | null
    emailStatus: string
}

interface GuestManagementProps {
    projectId: number
    guests: Guest[]
    currentUserEmail?: string
}

export function GuestManagement({ projectId, guests, currentUserEmail }: GuestManagementProps) {
    const [email, setEmail] = useState('')
    const [name, setName] = useState('')
    const [role, setRole] = useState<'contributor' | 'collaborator'>('contributor')
    const [isLoading, setIsLoading] = useState(false)
    const [copiedToken, setCopiedToken] = useState<string | null>(null)
    const [successMessage, setSuccessMessage] = useState<string | null>(null)
    const [errorMessage, setErrorMessage] = useState<string | null>(null)
    const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null)
    const router = useRouter()

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setSuccessMessage(null)
        const formData = new FormData()
        formData.append('email', email)
        formData.append('name', name)
        formData.append('role', role)

        const result = await inviteGuest(projectId, formData)
        setEmail('')
        setName('')
        setIsLoading(false)

        if (result.success) {
            setSuccessMessage(result.message || 'Collaborator added successfully!')
            setTimeout(() => setSuccessMessage(null), 5000)
            router.refresh()
        }
    }

    const handleDeleteClick = (guestId: number) => {
        setConfirmDeleteId(guestId)
    }

    const confirmDeletion = async () => {
        if (!confirmDeleteId) return

        // Close dialog immediately or keep open with loading?
        // Let's keep open with loading state on button
        setIsLoading(true)
        setErrorMessage(null)

        const result = await deleteGuest(confirmDeleteId, projectId)

        if (result?.success) {
            setSuccessMessage('Guest removed successfully')
            setTimeout(() => setSuccessMessage(null), 3000)
            router.refresh()
            // Close dialog only on success (or always?)
            setConfirmDeleteId(null)
        } else {
            setErrorMessage(result?.error || 'Failed to remove guest')
            setTimeout(() => setErrorMessage(null), 5000)
            // Keep dialog open if error? Or close?
            // Usually close if error is generic, keep open if we want user to retry.
            // But let's close for now to avoid stuck state if ID is bad.
            setConfirmDeleteId(null)
        }

        setIsLoading(false)
    }

    const copyLink = (token: string) => {
        const url = `${window.location.origin}/invite/${token}`
        navigator.clipboard.writeText(url)
        setCopiedToken(token)
        setTimeout(() => setCopiedToken(null), 2000)
    }

    return (
        <>
            <Dialog open={!!confirmDeleteId} onOpenChange={(open) => !open && !isLoading && setConfirmDeleteId(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Remove Collaborator</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to remove this collaborator? They will no longer have access to this project.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setConfirmDeleteId(null)} disabled={isLoading}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={confirmDeletion} disabled={isLoading}>
                            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Remove
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Card className="border-none shadow-sm rounded-2xl bg-white overflow-hidden">
                <CardHeader className="border-b border-slate-100 bg-white/50 px-8 py-6">
                    <CardTitle className="text-xl font-semibold text-slate-800">Guest List ({guests.length})</CardTitle>
                    <CardDescription className="text-slate-500">Invite friends and family to contribute to your speech.</CardDescription>
                </CardHeader>
                <CardContent className="p-8 space-y-8">
                    {successMessage && (
                        <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-sm text-emerald-800 flex items-center gap-3 shadow-sm">
                            <Check className="w-5 h-5 text-emerald-600" />
                            {successMessage}
                        </div>
                    )}

                    {errorMessage && (
                        <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-sm text-red-800 flex items-center gap-3 shadow-sm">
                            <span className="font-bold">Error:</span> {errorMessage}
                        </div>
                    )}

                    <form onSubmit={handleInvite} className="flex flex-col gap-6 p-6 border border-slate-100 rounded-2xl bg-slate-50/50">
                        <h3 className="font-semibold text-sm text-slate-900 uppercase tracking-wider">Add Collaborator</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-sm font-medium text-slate-700">Name</Label>
                                <Input
                                    id="name"
                                    placeholder="e.g. Aunt May"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="bg-white border-slate-200 focus:border-primary focus:ring-primary shadow-sm h-11 rounded-xl"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-sm font-medium text-slate-700">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="name@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="bg-white border-slate-200 focus:border-primary focus:ring-primary shadow-sm h-11 rounded-xl"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="role" className="text-sm font-medium text-slate-700">Role</Label>
                                <Select value={role} onValueChange={(v: any) => setRole(v)}>
                                    <SelectTrigger className="bg-white border-slate-200 focus:border-primary focus:ring-primary shadow-sm h-11 rounded-xl">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="contributor">Contributor (Input only)</SelectItem>
                                        <SelectItem value="collaborator">Collaborator (Edit speech)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <Button type="submit" disabled={isLoading} className="w-full md:w-auto self-end rounded-xl shadow-sm px-6">
                            {isLoading ? 'Adding...' : <><Plus className="w-4 h-4 mr-2" /> Add Collaborator</>}
                        </Button>
                    </form>

                    <div className="space-y-3">
                        {guests.length === 0 ? (
                            <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                                <p className="text-slate-500">No collaborators invited yet.</p>
                            </div>
                        ) : (
                            guests.map((guest) => (
                                <div key={guest.id} className="flex items-center justify-between p-4 border border-slate-100 rounded-2xl hover:bg-slate-50/80 transition-all bg-white shadow-sm">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                                            {guest.name ? guest.name.charAt(0).toUpperCase() : guest.email.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-slate-900">{guest.name || 'Unnamed Guest'}</p>
                                            <div className="text-sm text-slate-500 flex items-center gap-3 flex-wrap mt-1">
                                                <span className="flex items-center gap-1.5">
                                                    <Mail className="w-3.5 h-3.5" /> {guest.email}
                                                </span>
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 capitalize border border-slate-200">
                                                    {guest.role}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {guest.token && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => copyLink(guest.token!)}
                                                className={cn("text-xs h-9 px-3 rounded-lg hover:bg-slate-100", copiedToken === guest.token && "text-emerald-600 bg-emerald-50 hover:bg-emerald-100")}
                                            >
                                                {copiedToken === guest.token ? <Check className="w-3.5 h-3.5 mr-1.5" /> : <Copy className="w-3.5 h-3.5 mr-1.5" />}
                                                {copiedToken === guest.token ? 'Copied' : 'Copy Link'}
                                            </Button>
                                        )}
                                        <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(guest.id)} className="h-9 w-9 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50">
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>
        </>
    )
}
