'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Loader2, Trash2 } from 'lucide-react'
import { updateGuestRole, deleteGuest } from '@/actions/guests'
import { useRouter } from 'next/navigation'

type Role = 'collaborator' | 'speech-editor'

interface Guest {
    id: number
    email: string
    name: string | null
    role: string
    projectId?: number
    token?: string | null
    status?: string
    invitedAt?: Date | string | null
    emailStatus?: string
}

interface RoleManagementDialogProps {
    guest: Guest | null
    open: boolean
    onOpenChange: (open: boolean) => void
    projectId: number
}

export function RoleManagementDialog({
    guest,
    open,
    onOpenChange,
    projectId,
}: RoleManagementDialogProps) {
    const [selectedRole, setSelectedRole] = useState<Role>((guest?.role as Role) || 'collaborator')
    const [isLoading, setIsLoading] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    // Reset state when guest changes
    React.useEffect(() => {
        if (guest) {
            setSelectedRole((guest.role as Role) || 'collaborator')
            setError(null)
        }
    }, [guest])

    async function handleSave() {
        if (!guest) return
        setIsLoading(true)
        setError(null)

        const result = await updateGuestRole(guest.id, projectId, selectedRole)

        if (result.success) {
            router.refresh()
            onOpenChange(false)
        } else {
            setError(result.error || 'Failed to update role')
        }
        setIsLoading(false)
    }

    async function handleDelete() {
        if (!guest) return
        setIsDeleting(true)
        setError(null)

        const result = await deleteGuest(guest.id, projectId)

        if (result?.success) {
            router.refresh()
            onOpenChange(false)
        } else {
            setError(result?.error || 'Failed to remove member')
        }
        setIsDeleting(false)
    }

    const hasChanges = guest && selectedRole !== guest.role

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Manage {guest?.name || guest?.email}</DialogTitle>
                    <DialogDescription>
                        Change their role or remove them from the project.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {error && (
                        <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-800">
                            {error}
                        </div>
                    )}

                    {/* Role Selection */}
                    <div className="space-y-3">
                        <Label className="text-sm font-medium">Role</Label>
                        <RadioGroup
                            value={selectedRole}
                            onValueChange={(v) => setSelectedRole(v as Role)}
                            className="space-y-2"
                        >
                            <label
                                htmlFor="role-speech-editor"
                                className="flex items-start gap-3 p-4 border rounded-xl cursor-pointer hover:bg-slate-50 transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/5"
                            >
                                <RadioGroupItem value="speech-editor" id="role-speech-editor" className="mt-0.5" />
                                <div>
                                    <p className="font-medium text-slate-900">Speech-Editor</p>
                                    <p className="text-sm text-slate-500">Can edit the speech and manage team members</p>
                                </div>
                            </label>
                            <label
                                htmlFor="role-collaborator"
                                className="flex items-start gap-3 p-4 border rounded-xl cursor-pointer hover:bg-slate-50 transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/5"
                            >
                                <RadioGroupItem value="collaborator" id="role-collaborator" className="mt-0.5" />
                                <div>
                                    <p className="font-medium text-slate-900">Collaborator</p>
                                    <p className="text-sm text-slate-500">Can view and submit input to the speech</p>
                                </div>
                            </label>
                        </RadioGroup>
                    </div>

                    {/* Danger Zone */}
                    <div className="pt-4 border-t">
                        <p className="text-sm font-medium text-slate-700 mb-3">Danger Zone</p>
                        <Button
                            variant="outline"
                            onClick={handleDelete}
                            disabled={isDeleting || isLoading}
                            className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                        >
                            {isDeleting ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                                <Trash2 className="w-4 h-4 mr-2" />
                            )}
                            Remove from Project
                        </Button>
                        <p className="text-xs text-slate-500 mt-2">
                            This will revoke their access immediately.
                        </p>
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isLoading || isDeleting}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={isLoading || isDeleting || !hasChanges}
                    >
                        {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        Save Changes
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
