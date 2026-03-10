'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Settings, Trash2 } from 'lucide-react'

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
        className: 'bg-amber-50 text-amber-700 border-amber-200',
    },
    'speech-editor': {
        label: 'Speech-Editor',
        className: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    },
    'collaborator': {
        label: 'Collaborator',
        className: 'bg-slate-50 text-slate-600 border-slate-200',
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
    return (
        <div>
            <h2 className="text-sm font-medium text-slate-500 mb-3">
                Team ({1 + guests.length})
            </h2>
            <div className="bg-white rounded-xl border border-slate-100 divide-y divide-slate-100 overflow-hidden">
                {/* Owner */}
                <MemberRow
                    name={owner.name}
                    email={owner.email}
                    role="owner"
                    status="accepted"
                    isCurrentUser={owner.id === currentUserId}
                    canManage={false}
                    onEdit={() => {}}
                    onDelete={() => {}}
                />

                {/* Guests */}
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
                    <div className="px-4 py-6 text-center text-sm text-slate-400">
                        No team members yet
                    </div>
                )}
            </div>
        </div>
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
    const displayName = name || email
    const initial = displayName.charAt(0).toUpperCase()
    const isPending = role !== 'owner' && status === 'invited'

    return (
        <div className="flex items-center gap-3 px-4 py-3">
            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 text-sm font-medium shrink-0">
                {initial}
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-900 truncate">{displayName}</span>
                    {isCurrentUser && (
                        <span className="text-xs text-slate-400">you</span>
                    )}
                    {isPending && (
                        <span className="text-xs text-amber-500">pending</span>
                    )}
                </div>
                {name && (
                    <p className="text-xs text-slate-400 truncate">{email}</p>
                )}
            </div>
            <Badge
                variant="outline"
                className={`text-[11px] font-medium shrink-0 ${roleInfo.className}`}
            >
                {roleInfo.label}
            </Badge>
            {canManage && role !== 'owner' && (
                <div className="flex items-center gap-0.5 shrink-0">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onEdit}
                        className="h-7 w-7 text-slate-300 hover:text-slate-600"
                    >
                        <Settings className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onDelete}
                        className="h-7 w-7 text-slate-300 hover:text-red-500"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                </div>
            )}
        </div>
    )
}
