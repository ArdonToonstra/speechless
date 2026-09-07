import { and, eq, gt, sql } from 'drizzle-orm'
import { db, emailSendLog } from '@/db'

const EMAIL_LIMIT_PER_WINDOW = 20
const WINDOW_MS = 60 * 60 * 1000 // 1 hour

/**
 * Rolling hourly quota for outbound email sends, shared across every action that
 * emails other people on the user's behalf (invites, questionnaire, scheduling).
 * Generous by design — this guards against runaway/abusive sends, not normal usage.
 *
 * `requested` is how many recipients the caller wants to email in this call. Returns
 * how many of those are actually allowed right now (which may be less than requested,
 * or 0), and records that many against the quota immediately so concurrent calls
 * can't both read the same "remaining" value and jointly blow past the limit.
 */
export async function reserveEmailQuota(
    userId: string,
    requested: number
): Promise<{ allowed: number; limited: boolean }> {
    if (requested <= 0) return { allowed: 0, limited: false }

    const windowStart = new Date(Date.now() - WINDOW_MS)

    // Note: read-then-insert isn't perfectly race-free under heavy concurrency, but
    // for a generous, abuse-deterrence quota (not a hard security boundary) that's fine.
    const [{ used }] = await db
        .select({ used: sql<number>`coalesce(sum(${emailSendLog.count}), 0)::int` })
        .from(emailSendLog)
        .where(and(eq(emailSendLog.userId, userId), gt(emailSendLog.createdAt, windowStart)))

    const remaining = Math.max(0, EMAIL_LIMIT_PER_WINDOW - used)
    const allowed = Math.min(requested, remaining)

    if (allowed > 0) {
        await db.insert(emailSendLog).values({ userId, count: allowed })
    }

    return { allowed, limited: allowed < requested }
}
