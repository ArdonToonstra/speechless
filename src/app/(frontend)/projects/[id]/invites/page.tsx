import React from 'react'
import { getPayload } from 'payload'
import config from '@payload-config'
import { notFound, redirect } from 'next/navigation'
import { Send, Users, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default async function InvitesPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const projectId = parseInt(id)
    if (isNaN(projectId)) notFound()

    const payload = await getPayload({ config })

    // Auth check
    const { user } = await payload.auth({ headers: await (await import('next/headers')).headers() })
    if (!user) return redirect('/login')

    // Fetch Project
    const project = await payload.findByID({
        collection: 'projects',
        id: projectId,
        user,
    })

    if (!project) notFound()

    // Fetch Guests
    const { docs: guests } = await payload.find({
        collection: 'guests',
        where: {
            project: {
                equals: projectId,
            },
        },
        depth: 0,
        user,
    })

    const inviteLink = `${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/invite/`

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex items-center gap-3 pb-6 border-b">
                <div className="p-2 bg-primary/10 rounded-lg">
                    <Send className="w-6 h-6 text-primary" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold">Send Invites</h1>
                    <p className="text-muted-foreground">Ready to go? Notify your guests.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Review Guest List</CardTitle>
                        <CardDescription>
                            You have {guests.length} guest{guests.length !== 1 && 's'} on your list.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {guests.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                <Users className="w-8 h-8 mx-auto mb-2 opacity-20" />
                                <p>No guests yet. Go to the "Collaborators" tab to add some.</p>
                            </div>
                        ) : (
                            <ul className="space-y-2">
                                {guests.map((g: any) => (
                                    <li key={g.id} className="flex items-center justify-between p-2 rounded bg-muted/20">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-green-500" />
                                            <span className="font-medium">{g.name || g.email}</span>
                                        </div>
                                        <span className="text-xs text-muted-foreground capitalize">{g.role}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </CardContent>
                </Card>

                <Card className="bg-primary/5 border-primary/20">
                    <CardHeader>
                        <CardTitle>Launch!</CardTitle>
                        <CardDescription>Send magic links to everyone on the list.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="p-4 bg-background border rounded-lg text-sm text-muted-foreground">
                            <p className="mb-2"><strong>Preview of email:</strong></p>
                            <p><em>"Hi [Name], {user.name} has invited you to contribute to a speech for {project.title}..."</em></p>
                        </div>
                        <Button className="w-full" size="lg" disabled={guests.length === 0}>
                            <Send className="w-4 h-4 mr-2" />
                            Send {guests.length} Invite{guests.length !== 1 && 's'}
                        </Button>
                        <p className="text-xs text-center text-muted-foreground">
                            Each guest will receive a unique link to access the platform.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
