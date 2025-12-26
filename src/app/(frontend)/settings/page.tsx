import React from 'react'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { ProfileForms } from '@/components/features/ProfileForms'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function SettingsPage() {
    const payload = await getPayload({ config: configPromise })
    const headersList = await headers()
    const authResult = await payload.auth({ headers: headersList })
    const user = authResult.user

    if (!user) {
        redirect('/login')
    }

    return (
        <div className="min-h-screen bg-background p-6 md:p-12">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <Button variant="ghost" className="pl-0 hover:bg-transparent -ml-2 mb-4 text-muted-foreground hover:text-foreground" asChild>
                        <Link href="/dashboard">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Dashboard
                        </Link>
                    </Button>
                    <h1 className="text-3xl font-serif font-bold text-foreground">Settings</h1>
                    <p className="text-muted-foreground mt-2">Manage your account preferences.</p>
                </div>

                <ProfileForms user={user} />
            </div>
        </div>
    )
}
