'use server'

import { requireAuth } from './auth'
import { db, userFeedback } from '@/db'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

export async function submitFeedback(answers: Record<string, string>) {
    const session = await requireAuth()
    await db.insert(userFeedback)
        .values({ userId: session.user.id, answers })
        .onConflictDoUpdate({ target: userFeedback.userId, set: { answers } })
    revalidatePath('/dashboard')
}

export async function hasSubmittedFeedback(): Promise<boolean> {
    const session = await requireAuth()
    const row = await db.query.userFeedback.findFirst({
        where: eq(userFeedback.userId, session.user.id),
    })
    return !!row
}
