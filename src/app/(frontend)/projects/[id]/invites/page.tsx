import React from 'react'
import { getPayload } from 'payload'
import config from '@payload-config'
import { notFound, redirect } from 'next/navigation'
import { Send, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { StandardPageShell } from '@/components/layout/StandardPageShell'

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

    // Fetch Guests to show count
    const guests = await payload.find({
        collection: 'guests',
        where: { project: { equals: projectId } },
    })

    return (
        <StandardPageShell>
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="flex items-center gap-3 pb-6 border-b">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <Send className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">Send Invites</h1>
                        <p className="text-muted-foreground">Launch your project and notify guests.</p>
                    </div>
                </div>

                <div className="grid gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Ready to Launch?</CardTitle>
                            <CardDescription>
                                You have <strong>{guests.totalDocs}</strong> guests on your list.
                                Sending invites will email them their unique magic link.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="bg-muted p-4 rounded-lg text-sm">
                                <p className="font-semibold mb-2">Each guest will receive:</p>
                                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                                    <li>A welcome message from you</li>
                                    <li>A link to the questionnaire</li>
                                    <li>Access to contribute text/media</li>
                                </ul>
                            </div>
                            <Button className="w-full sm:w-auto">
                                <Mail className="w-4 h-4 mr-2" />
                                Send {guests.totalDocs} Invites
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </StandardPageShell>
    )
}
