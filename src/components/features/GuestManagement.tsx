'use client'

import React, { useState } from 'react'
import { inviteGuest, deleteGuest } from '@/actions/guests'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, Mail, Link2, Check, Loader2 } from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { useRouter } from 'next/navigation'
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

// Simplified type for editing - only requires fields used by RoleManagementDialog
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
        <div className="space-y-8">
            {/* Team Members List */}
            <TeamMemberList
                owner={owner}
                guests={guests}
                currentUserId={currentUserId}
                canManage={canManage}
                onEditRole={(guest) => setEditingGuest(guest)}
                onDelete={(guestId) => setConfirmDeleteId(guestId)}
            />

            {/* Add Team Member Section */}
            {canManage && (
                <Card className="border-none shadow-sm rounded-2xl bg-white overflow-hidden">
                    <CardHeader className="border-b border-slate-100 bg-white/50 px-8 py-6">
                        <CardTitle className="text-xl font-semibold text-slate-800">
                            Add Team Member
                        </CardTitle>
                        <CardDescription className="text-slate-500">
                            Invite collaborators via email or share a magic link
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                        {successMessage && (
                            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-sm text-emerald-800 flex items-center gap-3 shadow-sm">
                                <Check className="w-5 h-5 text-emerald-600" />
                                {successMessage}
                            </div>
                        )}

                        {errorMessage && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-sm text-red-800">
                                {errorMessage}
                            </div>
                        )}

                        <Tabs defaultValue="email" className="w-full">
                            <TabsList className="grid w-full grid-cols-2 mb-6 bg-slate-100">
                                <TabsTrigger value="email" className="gap-2 data-[state=active]:bg-white">
                                    <Mail className="w-4 h-4" />
                                    Via Email
                                </TabsTrigger>
                                <TabsTrigger value="link" className="gap-2 data-[state=active]:bg-white">
                                    <Link2 className="w-4 h-4" />
                                    Magic Link
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="email">
                                <form onSubmit={handleInvite} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="name" className="text-sm font-medium text-slate-700">
                                                Name (optional)
                                            </Label>
                                            <Input
                                                id="name"
                                                placeholder="e.g. Aunt May"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                className="bg-white border-slate-200 focus:border-primary focus:ring-primary shadow-sm h-11 rounded-xl"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="email" className="text-sm font-medium text-slate-700">
                                                Email
                                            </Label>
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
                                            <Label htmlFor="role" className="text-sm font-medium text-slate-700">
                                                Role
                                            </Label>
                                            <Select value={role} onValueChange={(v) => setRole(v as Role)}>
                                                <SelectTrigger className="bg-white border-slate-200 focus:border-primary focus:ring-primary shadow-sm h-11 rounded-xl">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="collaborator">Collaborator (Input only)</SelectItem>
                                                    <SelectItem value="speech-editor">Speech-Editor (Edit speech)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <Button
                                        type="submit"
                                        disabled={isLoading || !email.trim()}
                                        className="w-full md:w-auto rounded-xl shadow-sm px-6"
                                    >
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                Sending...
                                            </>
                                        ) : (
                                            <>
                                                <Plus className="w-4 h-4 mr-2" />
                                                Send Invite
                                            </>
                                        )}
                                    </Button>
                                </form>
                            </TabsContent>

                            <TabsContent value="link">
                                <MagicLinkGenerator projectId={projectId} />
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
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
                            Are you sure you want to remove this team member? They will no longer have access to this project.
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
