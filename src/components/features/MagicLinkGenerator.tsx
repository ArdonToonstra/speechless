'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Link2, Copy, Check, RefreshCw, AlertCircle } from 'lucide-react'
import { getMagicLink, regenerateMagicLink, type MagicLinkRole } from '@/actions/magic-links'
import { format, formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'

interface MagicLinkGeneratorProps {
    projectId: number
}

interface MagicLink {
    id: number
    token: string
    role: string
    expiresAt: Date
    usageLimit: number
    usageCount: number
}

export function MagicLinkGenerator({ projectId }: MagicLinkGeneratorProps) {
    const [magicLink, setMagicLink] = useState<MagicLink | null>(null)
    const [selectedRole, setSelectedRole] = useState<MagicLinkRole>('collaborator')
    const [isLoading, setIsLoading] = useState(true)
    const [isRegenerating, setIsRegenerating] = useState(false)
    const [copied, setCopied] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
    const fullLink = magicLink ? `${baseUrl}/join/${magicLink.token}` : ''

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
    const remainingUses = magicLink ? magicLink.usageLimit - magicLink.usageCount : 0
    const isDisabled = isExpired || isAtLimit

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
            <CardContent className="p-6 space-y-6">
                {isLoading ? (
                    <div className="text-center py-8 text-slate-500">
                        Loading...
                    </div>
                ) : error ? (
                    <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-sm text-red-800 flex items-center gap-3">
                        <AlertCircle className="w-5 h-5" />
                        {error}
                    </div>
                ) : (
                    <>
                        {/* Role Selection */}
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

                        {/* Link Display */}
                        <div className="space-y-2">
                            <div className="flex gap-2">
                                <Input
                                    value={fullLink}
                                    readOnly
                                    className={cn(
                                        "bg-slate-50 border-slate-200 rounded-xl h-11 font-mono text-sm",
                                        isDisabled && "opacity-50"
                                    )}
                                />
                                <Button
                                    variant="outline"
                                    onClick={copyToClipboard}
                                    disabled={isDisabled}
                                    className={cn(
                                        "h-11 px-4 rounded-xl shrink-0",
                                        copied && "bg-emerald-50 text-emerald-600 border-emerald-200"
                                    )}
                                >
                                    {copied ? (
                                        <>
                                            <Check className="w-4 h-4 mr-2" />
                                            Copied
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="w-4 h-4 mr-2" />
                                            Copy
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>

                        {/* Status & Meta */}
                        <div className="flex flex-wrap items-center justify-between gap-4 text-sm">
                            <div className="flex items-center gap-4 text-slate-500">
                                {isExpired ? (
                                    <span className="text-red-600 flex items-center gap-1">
                                        <AlertCircle className="w-4 h-4" />
                                        Expired
                                    </span>
                                ) : isAtLimit ? (
                                    <span className="text-amber-600 flex items-center gap-1">
                                        <AlertCircle className="w-4 h-4" />
                                        Usage limit reached
                                    </span>
                                ) : (
                                    <span>
                                        Expires {magicLink && formatDistanceToNow(magicLink.expiresAt, { addSuffix: true })}
                                    </span>
                                )}
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleRegenerate}
                                disabled={isRegenerating}
                                className="text-slate-600 hover:text-slate-900"
                            >
                                <RefreshCw className={cn("w-4 h-4 mr-2", isRegenerating && "animate-spin")} />
                                {isRegenerating ? 'Regenerating...' : 'Regenerate Link'}
                            </Button>
                        </div>

                        {(isExpired || isAtLimit) && (
                            <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl text-sm text-amber-800">
                                This link is no longer valid. Click &quot;Regenerate Link&quot; to create a new one.
                            </div>
                        )}
                    </>
                )}
            </CardContent>
        </Card>
    )
}
