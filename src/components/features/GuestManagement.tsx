'use client'

import React, { useState } from 'react'
import { inviteGuest, deleteGuest } from '@/actions/guests'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Trash2, Plus, Mail, Copy, Check } from 'lucide-react'
import { Guest } from '@/payload-types'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

interface GuestManagementProps {
    projectId: number
    guests: Guest[]
}

export function GuestManagement({ projectId, guests }: GuestManagementProps) {
    const [email, setEmail] = useState('')
    const [name, setName] = useState('')
    const [role, setRole] = useState<'contributor' | 'collaborator'>('contributor')
    const [isLoading, setIsLoading] = useState(false)
    const [copiedToken, setCopiedToken] = useState<string | null>(null)
    const [successMessage, setSuccessMessage] = useState<string | null>(null)
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

    const handleDelete = async (guestId: number) => {
        if (confirm('Are you sure you want to remove this guest?')) {
            await deleteGuest(guestId, projectId)
        }
    }

    const copyLink = (token: string) => {
        const url = `${window.location.origin}/invite/${token}`
        navigator.clipboard.writeText(url)
        setCopiedToken(token)
        setTimeout(() => setCopiedToken(null), 2000)
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Guest List ({guests.length})</CardTitle>
                <CardDescription>Invite friends and family to contribute to your speech.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {successMessage && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800 flex items-center gap-2">
                        <Check className="w-4 h-4" />
                        {successMessage}
                    </div>
                )}

                <form onSubmit={handleInvite} className="flex flex-col gap-4 p-4 border rounded-lg bg-muted/20">
                    <h3 className="font-semibold text-sm">Add Collaborator</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                placeholder="e.g. Aunt May"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="name@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="role">Role</Label>
                            <Select value={role} onValueChange={(v: any) => setRole(v)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="contributor">Contributor (Input only)</SelectItem>
                                    <SelectItem value="collaborator">Collaborator (Edit speech)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <Button type="submit" disabled={isLoading} className="w-full md:w-auto self-end">
                        {isLoading ? 'Adding...' : <><Plus className="w-4 h-4 mr-2" /> Add Collaborator</>}
                    </Button>
                </form>

                <div className="space-y-2">
                    {guests.length === 0 ? (
                        <p className="text-muted-foreground text-center py-4">No collaborators invited yet.</p>
                    ) : (
                        guests.map((guest) => (
                            <div key={guest.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/10 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                        {guest.name ? guest.name.charAt(0).toUpperCase() : guest.email.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="font-medium">{guest.name || 'Unnamed Guest'}</p>
                                        <p className="text-xs text-muted-foreground flex items-center gap-2 flex-wrap">
                                            <span className="flex items-center gap-1">
                                                <Mail className="w-3 h-3" /> {guest.email}
                                            </span>
                                            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground capitalize">
                                                {guest.role}
                                            </span>
                                            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                                                Email: Coming Soon
                                            </span>
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {guest.token && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => copyLink(guest.token!)}
                                            className={cn("text-xs", copiedToken === guest.token && "text-green-600")}
                                        >
                                            {copiedToken === guest.token ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
                                            {copiedToken === guest.token ? 'Copied' : 'Copy Link'}
                                        </Button>
                                    )}
                                    <Button variant="ghost" size="icon" onClick={() => handleDelete(guest.id)} className="text-destructive hover:text-destructive/80 hover:bg-destructive/10">
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
