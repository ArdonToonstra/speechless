import React from 'react'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { User } from '@/payload-types'

export default async function Page() {
    const payload = await getPayload({ config: configPromise })
    const { headers } = await import('next/headers')
    const headersList = await headers()
    const authResult = await payload.auth({ headers: headersList })
    const user = authResult.user

    // Strict check to ensure valid user before redirecting
    if (user && user.id && String(user.id) !== 'NaN' && !Number.isNaN(Number(user.id))) {
        const { redirect } = await import('next/navigation')
        redirect('/dashboard')
    }

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center text-foreground p-6 text-center">
            <h1 className="text-5xl md:text-7xl font-serif font-bold mb-6 text-primary">Speechless.</h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mb-12">
                Draft, refine, and deliver your speech with confidence.
                Focus on the words, we'll handle the rest.
            </p>
            <div className="flex gap-4">
                <a
                    href="/signup"
                    className="px-8 py-4 bg-primary hover:opacity-90 text-primary-foreground font-bold rounded-full text-lg transition-all transform hover:scale-105"
                >
                    Get Started
                </a>
                <a
                    href="/login"
                    className="px-8 py-4 bg-secondary/20 hover:bg-secondary/30 text-foreground font-semibold rounded-full text-lg backdrop-blur-sm transition-all"
                >
                    Log In
                </a>
            </div>

            <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl text-left">
                <div className="p-6 bg-card rounded-2xl border border-border/50">
                    <h3 className="text-xl font-bold mb-3 text-accent">Smart Templates</h3>
                    <p className="text-muted-foreground">Not sure where to start? Our wizard guides you through structure and flow.</p>
                </div>
                <div className="p-6 bg-card rounded-2xl border border-border/50">
                    <h3 className="text-xl font-bold mb-3 text-accent">Focus Mode</h3>
                    <p className="text-muted-foreground">A distraction-free editor designed purely for the spoken word.</p>
                </div>
                <div className="p-6 bg-card rounded-2xl border border-border/50">
                    <h3 className="text-xl font-bold mb-3 text-accent">Easy Sharing</h3>
                    <p className="text-muted-foreground">Share drafts with friends via a simple magic link for feedback.</p>
                </div>
            </div>
        </div>
    )
}
