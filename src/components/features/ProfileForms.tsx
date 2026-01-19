'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { updateProfile, changePassword, deleteAccount } from '@/actions/profile'
import { useRouter } from 'next/navigation'
import { AlertTriangle, Check, X } from 'lucide-react'

interface User {
    id: string
    name: string
    email: string
    image?: string | null
    initials?: string | null
}

function validatePasswordStrength(password: string) {
    return {
        minLength: password.length >= 8,
        hasUppercase: /[A-Z]/.test(password),
        hasNumber: /[0-9]/.test(password),
    }
}

function PasswordRequirements({ password }: { password: string }) {
    const validation = validatePasswordStrength(password)
    
    const requirements = [
        { label: 'At least 8 characters', met: validation.minLength },
        { label: 'One uppercase letter', met: validation.hasUppercase },
        { label: 'One number', met: validation.hasNumber },
    ]
    
    return (
        <div className="text-xs space-y-1 mt-2">
            {requirements.map((req, i) => (
                <div key={i} className={`flex items-center gap-1.5 ${req.met ? 'text-green-600' : 'text-muted-foreground'}`}>
                    {req.met ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                    {req.label}
                </div>
            ))}
        </div>
    )
}

export function ProfileForms({ user }: { user: User }) {
    const router = useRouter()
    const [profileLoading, setProfileLoading] = useState(false)
    const [passwordLoading, setPasswordLoading] = useState(false)
    const [deleteLoading, setDeleteLoading] = useState(false)
    const [profileMessage, setProfileMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
    const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
    const [deleteMessage, setDeleteMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
    const [newPassword, setNewPassword] = useState('')
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

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
        const password = formData.get('password') as string
        
        const validation = validatePasswordStrength(password)
        if (!validation.minLength || !validation.hasUppercase || !validation.hasNumber) {
            setPasswordMessage({ type: 'error', text: 'Password does not meet requirements' })
            setPasswordLoading(false)
            return
        }

        const res = await changePassword(formData)

        if (res?.error) {
            setPasswordMessage({ type: 'error', text: res.error })
        } else if (res?.success) {
            setPasswordMessage({ type: 'success', text: res.success as string })
            setNewPassword('')
            e.currentTarget.reset()
        }
        setPasswordLoading(false)
    }

    const handleDeleteAccount = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setDeleteLoading(true)
        setDeleteMessage(null)

        const formData = new FormData(e.currentTarget)
        const res = await deleteAccount(formData)

        if (res?.error) {
            setDeleteMessage({ type: 'error', text: res.error })
            setDeleteLoading(false)
        } else if (res?.success) {
            router.push('/')
        }
    }

    return (
        <div className="space-y-8">
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
                                defaultValue={user.name || ''}
                                placeholder="Your Name"
                                className="bg-background"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="initials">Initials</Label>
                            <Input
                                id="initials"
                                name="initials"
                                defaultValue={user.initials || ''}
                                placeholder="e.g., JD"
                                maxLength={4}
                                className="bg-background w-24"
                            />
                            <p className="text-xs text-muted-foreground">1-4 letters, used for avatars</p>
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

                {/* Change Password */}
                <div className="bg-card rounded-2xl shadow-sm border border-border p-6 md:p-8">
                    <h2 className="text-xl font-serif font-bold text-foreground mb-6">Change Password</h2>
                    <form onSubmit={handleChangePassword} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="currentPassword">Current Password</Label>
                            <Input
                                id="currentPassword"
                                name="currentPassword"
                                type="password"
                                required
                                placeholder="Enter current password"
                                className="bg-background"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">New Password</Label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                required
                                placeholder="Enter new password"
                                className="bg-background"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                            />
                            <PasswordRequirements password={newPassword} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirm New Password</Label>
                            <Input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                required
                                placeholder="Confirm new password"
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

            {/* Danger Zone */}
            <div className="bg-card rounded-2xl shadow-sm border border-red-200 p-6 md:p-8">
                <h2 className="text-xl font-serif font-bold text-red-600 mb-2 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    Danger Zone
                </h2>
                <p className="text-muted-foreground text-sm mb-6">
                    Permanently delete your account and all associated data. This action cannot be undone.
                </p>
                
                {!showDeleteConfirm ? (
                    <Button 
                        variant="outline" 
                        className="border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700"
                        onClick={() => setShowDeleteConfirm(true)}
                    >
                        Delete Account
                    </Button>
                ) : (
                    <form onSubmit={handleDeleteAccount} className="space-y-4 max-w-md">
                        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
                            <p className="font-medium mb-2">This will permanently delete:</p>
                            <ul className="list-disc list-inside space-y-1">
                                <li>Your account and profile data</li>
                                <li>All projects you own</li>
                                <li>All guests and submissions for your projects</li>
                            </ul>
                        </div>
                        
                        <div className="space-y-2">
                            <Label htmlFor="deletePassword">Enter your password to confirm</Label>
                            <Input
                                id="deletePassword"
                                name="password"
                                type="password"
                                required
                                placeholder="Your password"
                                className="bg-background"
                            />
                        </div>
                        
                        <div className="space-y-2">
                            <Label htmlFor="confirmText">Type DELETE to confirm</Label>
                            <Input
                                id="confirmText"
                                name="confirmText"
                                required
                                placeholder="DELETE"
                                className="bg-background"
                            />
                        </div>

                        {deleteMessage && (
                            <div className={`p-3 text-sm rounded-md ${deleteMessage.type === 'error' ? 'text-red-600 bg-red-50' : 'text-green-600 bg-green-50'}`}>
                                {deleteMessage.text}
                            </div>
                        )}

                        <div className="flex gap-3">
                            <Button 
                                type="button" 
                                variant="outline"
                                onClick={() => {
                                    setShowDeleteConfirm(false)
                                    setDeleteMessage(null)
                                }}
                            >
                                Cancel
                            </Button>
                            <Button 
                                type="submit" 
                                variant="destructive"
                                disabled={deleteLoading}
                            >
                                {deleteLoading ? 'Deleting...' : 'Delete My Account'}
                            </Button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    )
}
