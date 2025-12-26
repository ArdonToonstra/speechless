'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Share2, Copy, Check, Globe, Lock } from 'lucide-react'
import { generateMagicLink, toggleSharing } from '@/actions/sharing'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface ShareDialogProps {
    projectId: string
    initialToken?: string | null
    initialEnabled?: boolean | null
}

export function ShareDialog({ projectId, initialToken, initialEnabled }: ShareDialogProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [token, setToken] = useState(initialToken)
    const [enabled, setEnabled] = useState(initialEnabled || false)
    const [loading, setLoading] = useState(false)
    const [copied, setCopied] = useState(false)

    const origin = typeof window !== 'undefined' ? window.location.origin : ''
    const shareUrl = token ? `${origin}/share/${token}` : ''

    const handleGenerate = async () => {
        setLoading(true)
        const res = await generateMagicLink(projectId)
        if (res.success && res.token) {
            setToken(res.token)
            setEnabled(true) // Auto-enable when generating
        } else {
            alert('Failed to generate link')
        }
        setLoading(false)
    }

    const handleToggle = async () => {
        setLoading(true)
        const newState = !enabled
        const res = await toggleSharing(projectId, newState)
        if (res.success) {
            setEnabled(newState)
        } else {
            alert('Failed to update settings')
        }
        setLoading(false)
    }

    const copyToClipboard = () => {
        navigator.clipboard.writeText(shareUrl)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    if (!isOpen) {
        return (
            <Button variant="outline" size="sm" onClick={() => setIsOpen(true)}>
                <Share2 className="w-4 h-4 mr-2" />
                Share
            </Button>
        )
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold font-serif text-slate-900">Share your Speech</h2>
                        <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
                    </div>

                    {!token ? (
                        <div className="text-center py-8">
                            <div className="bg-secondary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Share2 className="w-8 h-8 text-primary" />
                            </div>
                            <p className="text-muted-foreground mb-6">Create a magic link to share a read-only version of your speech with friends or family.</p>
                            <Button onClick={handleGenerate} disabled={loading} className="bg-primary hover:opacity-90 text-primary-foreground w-full py-6 text-lg">
                                {loading ? 'Generating...' : 'Generate Magic Link'}
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${enabled ? 'bg-green-100 text-green-600' : 'bg-slate-200 text-slate-500'}`}>
                                        {enabled ? <Globe className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-slate-900">{enabled ? 'Publicly Accessible' : 'Private'}</p>
                                        <p className="text-xs text-slate-500">{enabled ? 'Anyone with the link can view' : 'Link is disabled'}</p>
                                    </div>
                                </div>
                                <Button variant="outline" size="sm" onClick={handleToggle} disabled={loading}>
                                    {enabled ? 'Disable' : 'Enable'}
                                </Button>
                            </div>

                            {enabled && (
                                <div className="space-y-2">
                                    <Label>Magic Link</Label>
                                    <div className="flex gap-2">
                                        <Input value={shareUrl} readOnly className="bg-slate-50 font-mono text-sm" />
                                        <Button size="icon" variant="secondary" onClick={copyToClipboard}>
                                            {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
                <div className="bg-slate-50 p-4 text-center border-t border-slate-100">
                    <Button variant="ghost" className="text-slate-500" onClick={() => setIsOpen(false)}>Close</Button>
                </div>
            </div>
        </div>
    )
}
