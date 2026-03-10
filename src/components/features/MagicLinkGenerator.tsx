'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Link2, Copy, Check, RefreshCw, AlertCircle } from 'lucide-react'
import { getMagicLink, regenerateMagicLink, type MagicLinkRole } from '@/actions/magic-links'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'
import { useLocale } from 'next-intl'

interface MagicLinkGeneratorProps {
    projectId: number
    compact?: boolean
}

interface MagicLink {
    id: number
    token: string
    role: string
    expiresAt: Date
    usageLimit: number
    usageCount: number
}

export function MagicLinkGenerator({ projectId, compact = false }: MagicLinkGeneratorProps) {
    const [magicLink, setMagicLink] = useState<MagicLink | null>(null)
    const [selectedRole, setSelectedRole] = useState<MagicLinkRole>('collaborator')
    const [isLoading, setIsLoading] = useState(true)
    const [isRegenerating, setIsRegenerating] = useState(false)
    const [copied, setCopied] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const locale = useLocale()

    const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
    const fullLink = magicLink ? `${baseUrl}/${locale}/join/${magicLink.token}` : ''

    const loadMagicLink = useCallback(async () => {
        setIsLoading(true)
        setError(null)
        const result = await getMagicLink(projectId)
        if (result.success && result.magicLink) {
            setMagicLink({
                ...result.magicLink,
                expiresAt: new Date(result.magicLink.expiresAt),
            })
        } else if (result.error) {
            setError(result.error)
        }
        setIsLoading(false)
    }, [projectId])

    useEffect(() => {
        loadMagicLink()
    }, [loadMagicLink])

    async function handleRegenerate() {
        setIsRegenerating(true)
        setError(null)
        const result = await regenerateMagicLink(projectId, selectedRole)
        if (result.success && result.magicLink) {
            setMagicLink({
                ...result.magicLink,
                expiresAt: new Date(result.magicLink.expiresAt),
            })
        } else if (result.error) {
            setError(result.error)
        }
        setIsRegenerating(false)
    }

    function copyToClipboard() {
        if (!fullLink) return
        navigator.clipboard.writeText(fullLink)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const isExpired = magicLink ? new Date(magicLink.expiresAt) < new Date() : false
    const isAtLimit = magicLink ? magicLink.usageCount >= magicLink.usageLimit : false
    const isDisabled = isExpired || isAtLimit

    if (compact) {
        if (isLoading) return <div className="py-2 text-sm text-slate-400">Loading link...</div>
        if (error) return <div className="text-sm text-red-600">{error}</div>

        return (
            <div className="space-y-2">
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={copyToClipboard}
                        disabled={isDisabled}
                        className={cn(
                            "h-9 rounded-lg flex-1 sm:flex-none",
                            copied && "bg-emerald-50 text-emerald-600 border-emerald-200"
                        )}
                    >
                        {copied ? (
                            <><Check className="w-3.5 h-3.5 mr-1.5" /> Copied!</>
                        ) : (
                            <><Link2 className="w-3.5 h-3.5 mr-1.5" /> Copy invite link</>
                        )}
                    </Button>
                    <Select
                        value={selectedRole}
                        onValueChange={(v) => setSelectedRole(v as MagicLinkRole)}
                    >
                        <SelectTrigger className="h-9 text-sm border-slate-200 rounded-lg flex-1 sm:flex-none sm:w-40">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="collaborator">Collaborator</SelectItem>
                            <SelectItem value="speech-editor">Speech-Editor</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span>
                        {isExpired ? (
                            <span className="text-red-500">Expired</span>
                        ) : isAtLimit ? (
                            <span className="text-amber-500">Limit reached</span>
                        ) : magicLink ? (
                            `Expires ${formatDistanceToNow(magicLink.expiresAt, { addSuffix: true })}`
                        ) : null}
                    </span>
                    <span>&middot;</span>
                    <button
                        onClick={handleRegenerate}
                        disabled={isRegenerating}
                        className="hover:text-slate-600 underline underline-offset-2"
                    >
                        {isRegenerating ? 'regenerating...' : 'regenerate'}
                    </button>
                </div>
            </div>
        )
    }

    // Standalone card mode (non-compact)
    const inner = isLoading ? (
        <div className="text-center py-4 text-slate-500 text-sm">Loading...</div>
    ) : error ? (
        <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-sm text-red-800 flex items-center gap-3">
            <AlertCircle className="w-5 h-5" />
            {error}
        </div>
    ) : (
        <div className="space-y-4">
            <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700">
                    New members will join as:
                </Label>
                <Select
                    value={selectedRole}
                    onValueChange={(v) => setSelectedRole(v as MagicLinkRole)}
                >
                    <SelectTrigger className="bg-white border-slate-200 h-11 rounded-xl">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="collaborator">Collaborator (View & submit input)</SelectItem>
                        <SelectItem value="speech-editor">Speech-Editor (Edit speech & manage team)</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="flex items-center gap-3">
                <Button
                    variant="outline"
                    onClick={copyToClipboard}
                    disabled={isDisabled}
                    className={cn(
                        "h-11 px-5 rounded-xl",
                        copied && "bg-emerald-50 text-emerald-600 border-emerald-200"
                    )}
                >
                    {copied ? (
                        <><Check className="w-4 h-4 mr-2" /> Link copied!</>
                    ) : (
                        <><Copy className="w-4 h-4 mr-2" /> Copy Link</>
                    )}
                </Button>
                <span className="text-sm text-slate-400">
                    {isExpired ? 'Expired' : isAtLimit ? 'Usage limit reached' : magicLink ? `Expires ${formatDistanceToNow(magicLink.expiresAt, { addSuffix: true })}` : null}
                </span>
            </div>
            <Button
                variant="ghost"
                size="sm"
                onClick={handleRegenerate}
                disabled={isRegenerating}
                className="text-slate-500 hover:text-slate-800 px-0"
            >
                <RefreshCw className={cn("w-4 h-4 mr-2", isRegenerating && "animate-spin")} />
                {isRegenerating ? 'Regenerating...' : 'Regenerate link'}
            </Button>
        </div>
    )

    return (
        <Card className="border-none shadow-sm rounded-2xl bg-white overflow-hidden">
            <CardHeader className="border-b border-slate-100 bg-white/50 px-8 py-6">
                <CardTitle className="text-xl font-semibold text-slate-800 flex items-center gap-2">
                    <Link2 className="w-5 h-5" />
                    Magic Link
                </CardTitle>
                <CardDescription className="text-slate-500">
                    Share this link to let anyone join as a team member
                </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
                {inner}
            </CardContent>
        </Card>
    )
}
