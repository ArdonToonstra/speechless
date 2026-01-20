import React from 'react'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { UserPlus, Calendar, AlertCircle, Check } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { getSession } from '@/actions/auth'
import { getMagicLinkInfo, joinViaMagicLink } from '@/actions/magic-links'

interface JoinPageProps {
    params: Promise<{ token: string }>
}

export default async function JoinPage({ params }: JoinPageProps) {
    const { token } = await params
    const session = await getSession()

    // Get magic link info
    const linkInfo = await getMagicLinkInfo(token)

    if (linkInfo.error || !linkInfo.success) {
        return (
            <div className="min-h-screen bg-muted/5 flex items-center justify-center p-4">
                <Card className="max-w-md w-full">
                    <CardHeader className="text-center">
                        <div className="mx-auto mb-4 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                            <AlertCircle className="w-6 h-6 text-red-600" />
                        </div>
                        <CardTitle>Invalid Link</CardTitle>
                        <CardDescription>
                            This invite link is not valid or has been revoked.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="text-center">
                        <Link href="/dashboard">
                            <Button>Go to Dashboard</Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        )
    }

    // Check if link is expired or at limit
    if (linkInfo.isExpired || linkInfo.isAtLimit) {
        return (
            <div className="min-h-screen bg-muted/5 flex items-center justify-center p-4">
                <Card className="max-w-md w-full">
                    <CardHeader className="text-center">
                        <div className="mx-auto mb-4 w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                            <AlertCircle className="w-6 h-6 text-amber-600" />
                        </div>
                        <CardTitle>Link Expired</CardTitle>
                        <CardDescription>
                            {linkInfo.isExpired
                                ? 'This invite link has expired.'
                                : 'This invite link has reached its usage limit.'}
                            {' '}Please ask the project owner for a new invite.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="text-center">
                        <Link href="/dashboard">
                            <Button>Go to Dashboard</Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        )
    }

    const project = linkInfo.project
    const roleLabel = linkInfo.role === 'speech-editor' ? 'Speech-Editor' : 'Collaborator'

    // If not logged in, show login/signup options
    if (!session?.user) {
        return (
            <div className="min-h-screen bg-muted/5 flex items-center justify-center p-4">
                <div className="max-w-lg w-full space-y-8">
                    {/* Header */}
                    <div className="text-center space-y-3">
                        <h1 className="text-3xl font-bold">You&apos;re Invited</h1>
                        <p className="text-muted-foreground">
                            Join as a {roleLabel.toLowerCase()} on this speech project
                        </p>
                    </div>

                    {/* Project Card */}
                    <Card>
                        <CardHeader className="space-y-3">
                            <div>
                                <CardTitle className="text-2xl">{project?.name}</CardTitle>
                                <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
                                    {project?.occasionType && (
                                        <span className="capitalize">{project.occasionType}</span>
                                    )}
                                    {project?.occasionDate && (
                                        <>
                                            <span>•</span>
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-3.5 h-3.5" />
                                                {format(new Date(project.occasionDate), 'MMM d, yyyy')}
                                            </span>
                                        </>
                                    )}
                                </div>
                            </div>
                            <Badge variant="outline" className="w-fit">
                                Joining as {roleLabel}
                            </Badge>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <p className="text-sm text-muted-foreground">
                                Sign in or create an account to join this project.
                            </p>

                            {/* Action Buttons */}
                            <div className="grid grid-cols-2 gap-3">
                                <Link href={`/login?redirect=/join/${token}`}>
                                    <Button variant="outline" className="w-full">
                                        Sign In
                                    </Button>
                                </Link>
                                <Link href={`/signup?redirect=/join/${token}`}>
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

    // User is logged in, attempt to join
    const joinResult = await joinViaMagicLink(token)

    if (joinResult.error) {
        // Handle "already a member" as success-ish
        if (joinResult.projectId) {
            redirect(`/projects/${joinResult.projectId}`)
        }

        return (
            <div className="min-h-screen bg-muted/5 flex items-center justify-center p-4">
                <Card className="max-w-md w-full">
                    <CardHeader className="text-center">
                        <div className="mx-auto mb-4 w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                            <AlertCircle className="w-6 h-6 text-amber-600" />
                        </div>
                        <CardTitle>Unable to Join</CardTitle>
                        <CardDescription>
                            {joinResult.error}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="text-center">
                        <Link href="/dashboard">
                            <Button>Go to Dashboard</Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        )
    }

    // Success! Show confirmation and redirect
    return (
        <div className="min-h-screen bg-muted/5 flex items-center justify-center p-4">
            <Card className="max-w-md w-full">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                        <Check className="w-6 h-6 text-emerald-600" />
                    </div>
                    <CardTitle>Welcome to the Team!</CardTitle>
                    <CardDescription>
                        You&apos;ve joined &quot;{joinResult.projectName}&quot; as a {roleLabel.toLowerCase()}.
                    </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                    <Link href={`/projects/${joinResult.projectId}`}>
                        <Button className="gap-2">
                            <UserPlus className="w-4 h-4" />
                            View Project
                        </Button>
                    </Link>
                </CardContent>
            </Card>
        </div>
    )
}
