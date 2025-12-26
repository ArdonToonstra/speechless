'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { UserPlus, Mail, Calendar } from 'lucide-react'
import { Guest, Project } from '@/payload-types'
import Link from 'next/link'
import { format } from 'date-fns'

interface InviteAcceptanceProps {
    guest: Guest
    project: Project
    token: string
}

export function InviteAcceptance({ guest, project, token }: InviteAcceptanceProps) {
    return (
        <div className="min-h-screen bg-muted/5 flex items-center justify-center p-4">
            <div className="max-w-lg w-full space-y-8">
                {/* Header */}
                <div className="text-center space-y-3">
                    <h1 className="text-3xl font-bold">You're Invited</h1>
                    <p className="text-muted-foreground">
                        Join as a collaborator on this speech project
                    </p>
                </div>

                {/* Project Card */}
                <Card>
                    <CardHeader className="space-y-3">
                        <div>
                            <CardTitle className="text-2xl">{project.title}</CardTitle>
                            <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
                                {project.type && (
                                    <span className="capitalize">{project.type}</span>
                                )}
                                {project.date && (
                                    <>
                                        <span>•</span>
                                        <span className="flex items-center gap-1">
                                            <Calendar className="w-3.5 h-3.5" />
                                            {format(new Date(project.date), 'MMM d, yyyy')}
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Invited Email */}
                        <div className="space-y-3">
                            <p className="text-sm text-muted-foreground">
                                To access this project, sign in or create an account using:
                            </p>
                            <div className="flex items-center justify-center gap-2 text-base">
                                <Mail className="w-4 h-4 text-muted-foreground" />
                                <span className="font-medium">{guest.email}</span>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="grid grid-cols-2 gap-3 pt-2">
                            <Link href={`/login?invite=${token}`}>
                                <Button variant="outline" className="w-full">
                                    Sign In
                                </Button>
                            </Link>
                            <Link href={`/signup?invite=${token}`}>
                                <Button className="w-full">
                                    Create Account
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
