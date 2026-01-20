'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Settings, Trash2, Mail, Check, Clock } from 'lucide-react'

interface Owner {
    id: string
    name: string
    email: string
}

interface Guest {
    id: number
    email: string
    name: string | null
    role: string
    status: string
    projectId?: number
    token?: string | null
    invitedAt?: Date | string | null
    emailStatus?: string
}

interface TeamMemberListProps {
    owner: Owner
    guests: Guest[]
    currentUserId: string
    canManage: boolean
    onEditRole: (guest: Guest) => void
    onDelete: (guestId: number) => void
}

const roleConfig: Record<string, { label: string; className: string }> = {
    'owner': {
        label: 'Owner',
        className: 'bg-amber-100 text-amber-800 border-amber-200',
    },
    'speech-editor': {
        label: 'Speech-Editor',
        className: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    },
    'collaborator': {
        label: 'Collaborator',
        className: 'bg-slate-100 text-slate-600 border-slate-200',
    },
}

const statusConfig: Record<string, { icon: React.ReactNode; label: string; className: string }> = {
    'accepted': {
        icon: <Check className="w-3 h-3" />,
        label: 'Accepted',
        className: 'text-emerald-600',
    },
    'invited': {
        icon: <Clock className="w-3 h-3" />,
        label: 'Pending',
        className: 'text-amber-600',
    },
    'declined': {
        icon: null,
        label: 'Declined',
        className: 'text-red-600',
    },
}

export function TeamMemberList({
    owner,
    guests,
    currentUserId,
    canManage,
    onEditRole,
    onDelete,
}: TeamMemberListProps) {
    const totalMembers = 1 + guests.length // Owner + guests

    return (
        <Card className="border-none shadow-sm rounded-2xl bg-white overflow-hidden">
            <CardHeader className="border-b border-slate-100 bg-white/50 px-8 py-6">
                <CardTitle className="text-xl font-semibold text-slate-800">
                    Team Members ({totalMembers})
                </CardTitle>
                <CardDescription className="text-slate-500">
                    Manage your project team and their permissions
                </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-3">
                {/* Owner Row */}
                <MemberRow
                    name={owner.name}
                    email={owner.email}
                    role="owner"
                    status="accepted"
                    isCurrentUser={owner.id === currentUserId}
                    canManage={false}
                    onEdit={() => { }}
                    onDelete={() => { }}
                />

                {/* Guest Rows */}
                {guests.map((guest) => (
                    <MemberRow
                        key={guest.id}
                        name={guest.name}
                        email={guest.email}
                        role={guest.role}
                        status={guest.status}
                        isCurrentUser={false}
                        canManage={canManage}
                        onEdit={() => onEditRole(guest)}
                        onDelete={() => onDelete(guest.id)}
                    />
                ))}

                {guests.length === 0 && (
                    <div className="text-center py-8 text-slate-500">
                        <p>No team members yet. Invite collaborators below!</p>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

interface MemberRowProps {
    name: string | null
    email: string
    role: string
    status: string
    isCurrentUser: boolean
    canManage: boolean
    onEdit: () => void
    onDelete: () => void
}

function MemberRow({
    name,
    email,
    role,
    status,
    isCurrentUser,
    canManage,
    onEdit,
    onDelete,
}: MemberRowProps) {
    const roleInfo = roleConfig[role] || roleConfig['collaborator']
    const statusInfo = statusConfig[status] || statusConfig['invited']
    const displayName = name || 'Unnamed'
    const initial = displayName.charAt(0).toUpperCase()

    return (
        <div className="flex items-center justify-between p-4 border border-slate-100 rounded-2xl hover:bg-slate-50/80 transition-all bg-white shadow-sm">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                    {initial}
                </div>
                <div>
                    <div className="flex items-center gap-2">
                        <p className="font-semibold text-slate-900">{displayName}</p>
                        {isCurrentUser && (
                            <span className="text-xs text-slate-400">(you)</span>
                        )}
                    </div>
                    <div className="text-sm text-slate-500 flex items-center gap-3 flex-wrap mt-1">
                        <span className="flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5" /> {email}
                        </span>
                        <Badge
                            variant="outline"
                            className={`text-xs font-medium border ${roleInfo.className}`}
                        >
                            {roleInfo.label}
                        </Badge>
                        {role !== 'owner' && status !== 'accepted' && (
                            <span className={`flex items-center gap-1 text-xs ${statusInfo.className}`}>
                                {statusInfo.icon} {statusInfo.label}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {canManage && role !== 'owner' && (
                <div className="flex items-center gap-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onEdit}
                        className="h-9 w-9 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                    >
                        <Settings className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onDelete}
                        className="h-9 w-9 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50"
                    >
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </div>
            )}
        </div>
    )
}
