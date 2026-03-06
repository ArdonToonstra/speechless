import { NextRequest, NextResponse } from 'next/server'
import { and, eq, isNull, isNotNull, lt, or } from 'drizzle-orm'
import { db } from '@/db'
import { user } from '@/db/schema'
import { sendDeletionWarningEmail } from '@/lib/email'

const FIVE_MONTHS_MS = 5 * 30 * 24 * 60 * 60 * 1000
const SIX_MONTHS_MS = 6 * 30 * 24 * 60 * 60 * 1000

// Inactive = lastLoginAt older than threshold, or (never logged in) createdAt older than threshold
function inactiveSince(threshold: Date) {
    return or(
        and(isNotNull(user.lastLoginAt), lt(user.lastLoginAt, threshold)),
        and(isNull(user.lastLoginAt), lt(user.createdAt, threshold)),
    )
}

export async function GET(request: NextRequest) {
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const now = new Date()
    const fiveMonthsAgo = new Date(now.getTime() - FIVE_MONTHS_MS)
    const sixMonthsAgo = new Date(now.getTime() - SIX_MONTHS_MS)

    // Phase 1: warn users inactive 5+ months who haven't been warned yet
    const toWarn = await db.query.user.findMany({
        where: and(inactiveSince(fiveMonthsAgo), isNull(user.deletionWarningAt)),
        columns: { id: true, email: true, name: true },
    })

    const warned: string[] = []
    for (const u of toWarn) {
        try {
            await sendDeletionWarningEmail({ to: u.email, name: u.name })
            await db.update(user).set({ deletionWarningAt: now }).where(eq(user.id, u.id))
            warned.push(u.email)
        } catch (err) {
            console.error(`[CRON] Failed to warn ${u.email}:`, err)
        }
    }

    // Phase 2: delete users inactive 6+ months who were already warned
    const toDelete = await db.query.user.findMany({
        where: and(inactiveSince(sixMonthsAgo), isNotNull(user.deletionWarningAt)),
        columns: { id: true, email: true },
    })

    const deleted: string[] = []
    for (const u of toDelete) {
        try {
            // Deleting the user cascades to all their projects and data (FK onDelete: cascade)
            await db.delete(user).where(eq(user.id, u.id))
            deleted.push(u.email)
        } catch (err) {
            console.error(`[CRON] Failed to delete ${u.email}:`, err)
        }
    }

    console.log(`[CRON] Cleanup complete. Warned: ${warned.length}, Deleted: ${deleted.length}`)
    return NextResponse.json({ warned, deleted })
}
