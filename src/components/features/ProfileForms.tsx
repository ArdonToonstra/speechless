'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { updateProfile, changePassword } from '@/actions/profile'

interface User {
    id: string
    name: string
    email: string
    image?: string | null
}

export function ProfileForms({ user }: { user: User }) {
    const [profileLoading, setProfileLoading] = useState(false)
    const [passwordLoading, setPasswordLoading] = useState(false)
    const [profileMessage, setProfileMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
    const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

    const handleUpdateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setProfileLoading(true)
        setProfileMessage(null)

        const formData = new FormData(e.currentTarget)
        const res = await updateProfile(formData)

        if (res?.error) {
            setProfileMessage({ type: 'error', text: res.error })
        } else if (res?.success) {
            setProfileMessage({ type: 'success', text: res.success as string })
        }
        setProfileLoading(false)
    }

    const handleChangePassword = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setPasswordLoading(true)
        setPasswordMessage(null)

        const formData = new FormData(e.currentTarget)
        const res = await changePassword(formData)

        if (res?.error) {
            setPasswordMessage({ type: 'error', text: res.error })
        } else if (res?.success) {
            setPasswordMessage({ type: 'success', text: res.success as string })
            // Optional: reset form
            e.currentTarget.reset()
        }
        setPasswordLoading(false)
    }

    return (
        <div className="grid gap-8 md:grid-cols-2">
            {/* Profile Details */}
            <div className="bg-card rounded-2xl shadow-sm border border-border p-6 md:p-8">
                <h2 className="text-xl font-serif font-bold text-foreground mb-6">Profile Details</h2>
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Display Name</Label>
                        <Input
                            id="name"
                            name="name"
                            defaultValue={(user as any).name || ''}
                            placeholder="Your Name"
                            className="bg-background"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            name="email"
                            defaultValue={user.email}
                            required
                            type="email"
                            className="bg-background"
                        />
                    </div>

                    {profileMessage && (
                        <div className={`p-3 text-sm rounded-md ${profileMessage.type === 'error' ? 'text-red-600 bg-red-50' : 'text-green-600 bg-green-50'}`}>
                            {profileMessage.text}
                        </div>
                    )}

                    <Button type="submit" disabled={profileLoading} className="w-full rounded-full">
                        {profileLoading ? 'Saving...' : 'Save Changes'}
                    </Button>
                </form>
            </div>

            {/* Security */}
            <div className="bg-card rounded-2xl shadow-sm border border-border p-6 md:p-8">
                <h2 className="text-xl font-serif font-bold text-foreground mb-6">Security</h2>
                <form onSubmit={handleChangePassword} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="password">New Password</Label>
                        <Input
                            id="password"
                            name="password"
                            type="password"
                            required
                            placeholder="Min. 6 characters"
                            className="bg-background"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm New Password</Label>
                        <Input
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            required
                            className="bg-background"
                        />
                    </div>

                    {passwordMessage && (
                        <div className={`p-3 text-sm rounded-md ${passwordMessage.type === 'error' ? 'text-red-600 bg-red-50' : 'text-green-600 bg-green-50'}`}>
                            {passwordMessage.text}
                        </div>
                    )}

                    <Button type="submit" variant="outline" disabled={passwordLoading} className="w-full rounded-full border-border">
                        {passwordLoading ? 'Updating...' : 'Update Password'}
                    </Button>
                </form>
            </div>
        </div>
    )
}
