'use client'

import React, { useState } from 'react'
import { inviteGuest, deleteGuest } from '@/actions/guests'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Check, Loader2 } from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { useRouter } from '@/i18n/navigation'
import { TeamMemberList } from './TeamMemberList'
import { MagicLinkGenerator } from './MagicLinkGenerator'
import { RoleManagementDialog } from './RoleManagementDialog'

interface Owner {
    id: string
    name: string
    email: string
}

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

interface EditableGuest {
    id: number
    email: string
    name: string | null
    role: string
    projectId?: number
}

interface GuestManagementProps {
    projectId: number
    guests: Guest[]
    owner: Owner
    currentUserId: string
    canManage: boolean
}

type Role = 'collaborator' | 'speech-editor'

export function GuestManagement({
    projectId,
    guests,
    owner,
    currentUserId,
    canManage
}: GuestManagementProps) {
    const [email, setEmail] = useState('')
    const [name, setName] = useState('')
    const [role, setRole] = useState<Role>('collaborator')
    const [isLoading, setIsLoading] = useState(false)
    const [successMessage, setSuccessMessage] = useState<string | null>(null)
    const [errorMessage, setErrorMessage] = useState<string | null>(null)
    const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null)
    const [editingGuest, setEditingGuest] = useState<EditableGuest | null>(null)
    const router = useRouter()

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!email.trim()) return

        setIsLoading(true)
        setSuccessMessage(null)
        setErrorMessage(null)

        const formData = new FormData()
        formData.append('email', email)
        formData.append('name', name)
        formData.append('role', role)

        const result = await inviteGuest(projectId, formData)
        setIsLoading(false)

        if (result.success) {
            setEmail('')
            setName('')
            setSuccessMessage(result.message || 'Invite sent!')
            setTimeout(() => setSuccessMessage(null), 5000)
            router.refresh()
        } else {
            setErrorMessage(result.error || 'Failed to send invite')
            setTimeout(() => setErrorMessage(null), 5000)
        }
    }

    const handleDeleteConfirm = async () => {
        if (!confirmDeleteId) return

        setIsLoading(true)
        setErrorMessage(null)

        const result = await deleteGuest(confirmDeleteId, projectId)

        if (result?.success) {
            setSuccessMessage('Member removed')
            setTimeout(() => setSuccessMessage(null), 3000)
            router.refresh()
        } else {
            setErrorMessage(result?.error || 'Failed to remove member')
            setTimeout(() => setErrorMessage(null), 5000)
        }

        setConfirmDeleteId(null)
        setIsLoading(false)
    }

    return (
        <div className="space-y-6">
            {/* Team list */}
            <TeamMemberList
                owner={owner}
                guests={guests}
                currentUserId={currentUserId}
                canManage={canManage}
                onEditRole={(guest) => setEditingGuest(guest)}
                onDelete={(guestId) => setConfirmDeleteId(guestId)}
            />

            {/* Invite section */}
            {canManage && (
                <div className="space-y-3">
                    <h2 className="text-sm font-medium text-slate-500">Invite</h2>

                    {successMessage && (
                        <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-lg text-sm text-emerald-700 flex items-center gap-2">
                            <Check className="w-4 h-4" />
                            {successMessage}
                        </div>
                    )}

                    {errorMessage && (
                        <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-700">
                            {errorMessage}
                        </div>
                    )}

                    {/* Email invite */}
                    <div className="bg-white rounded-xl border border-slate-100 p-4">
                        <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-3">Via email</p>
                        <form onSubmit={handleInvite} className="flex flex-col sm:flex-row gap-2">
                            <Input
                                placeholder="Name (optional)"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="h-9 text-sm bg-white border-slate-200 rounded-lg sm:w-36"
                            />
                            <Input
                                type="email"
                                placeholder="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="h-9 text-sm bg-white border-slate-200 rounded-lg sm:flex-1"
                            />
                            <Select value={role} onValueChange={(v) => setRole(v as Role)}>
                                <SelectTrigger className="h-9 text-sm border-slate-200 rounded-lg sm:w-40">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="collaborator">Collaborator</SelectItem>
                                    <SelectItem value="speech-editor">Speech-Editor</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button
                                type="submit"
                                size="sm"
                                disabled={isLoading || !email.trim()}
                                className="h-9 rounded-lg px-4 shrink-0"
                            >
                                {isLoading ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <><Plus className="w-4 h-4 mr-1" /> Send</>
                                )}
                            </Button>
                        </form>
                    </div>

                    {/* Magic link */}
                    <div className="bg-white rounded-xl border border-slate-100 p-4">
                        <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-3">Via link</p>
                        <MagicLinkGenerator projectId={projectId} compact />
                    </div>
                </div>
            )}

            {/* Role Management Dialog */}
            <RoleManagementDialog
                guest={editingGuest}
                open={!!editingGuest}
                onOpenChange={(open) => !open && setEditingGuest(null)}
                projectId={projectId}
            />

            {/* Delete Confirmation Dialog */}
            <Dialog open={!!confirmDeleteId} onOpenChange={(open) => !open && !isLoading && setConfirmDeleteId(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Remove Team Member</DialogTitle>
                        <DialogDescription>
                            Are you sure? They will lose access to this project.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setConfirmDeleteId(null)} disabled={isLoading}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDeleteConfirm} disabled={isLoading}>
                            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Remove
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
