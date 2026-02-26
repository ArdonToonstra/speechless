'use server'

import { eq, and } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { db, dateOptions, dateResponses, guests, projects } from '@/db'
import { getSession } from './auth'

// Type for date option with responses
export type DateOptionWithResponses = {
    id: number
    proposedDate: Date
    proposedTime: string | null
    note: string | null
    responses: {
        id: number
        response: string
        note: string | null
        guest: {
            id: number
            name: string | null
            email: string
        }
    }[]
}

// Get all date options for a project with responses
export async function getDateOptions(projectId: number): Promise<DateOptionWithResponses[]> {
    const options = await db.query.dateOptions.findMany({
        where: eq(dateOptions.projectId, projectId),
        with: {
            responses: {
                with: {
                    guest: true
                }
            }
        },
        orderBy: (dateOptions, { asc }) => [asc(dateOptions.proposedDate)]
    })

    return options.map(opt => ({
        id: opt.id,
        proposedDate: opt.proposedDate,
        proposedTime: opt.proposedTime,
        note: opt.note,
        responses: opt.responses.map(r => ({
            id: r.id,
            response: r.response,
            note: r.note,
            guest: {
                id: r.guest.id,
                name: r.guest.name,
                email: r.guest.email
            }
        }))
    }))
}

// Check if a project has any date options
export async function hasDateOptions(projectId: number): Promise<boolean> {
    const options = await db.query.dateOptions.findFirst({
        where: eq(dateOptions.projectId, projectId)
    })
    return !!options
}

// Add a new date option
export async function addDateOption(
    projectId: number,
    proposedDate: Date,
    proposedTime?: string,
    note?: string
): Promise<{ success: boolean; error?: string; option?: typeof dateOptions.$inferSelect }> {
    const session = await getSession()
    if (!session?.user) {
        return { success: false, error: 'Unauthorized' }
    }

    const project = await db.query.projects.findFirst({
        where: and(eq(projects.id, projectId), eq(projects.ownerId, session.user.id))
    })
    if (!project) {
        return { success: false, error: 'Forbidden' }
    }

    try {
        const [newOption] = await db.insert(dateOptions).values({
            projectId,
            proposedDate,
            proposedTime: proposedTime || null,
            note: note || null,
        }).returning()

        revalidatePath(`/projects/${projectId}/scheduling`)
        return { success: true, option: newOption }
    } catch (error) {
        console.error('Error adding date option:', error)
        return { success: false, error: 'Failed to add date option' }
    }
}

// Delete a date option
export async function deleteDateOption(
    optionId: number,
    projectId: number
): Promise<{ success: boolean; error?: string }> {
    const session = await getSession()
    if (!session?.user) {
        return { success: false, error: 'Unauthorized' }
    }

    const project = await db.query.projects.findFirst({
        where: and(eq(projects.id, projectId), eq(projects.ownerId, session.user.id))
    })
    if (!project) {
        return { success: false, error: 'Forbidden' }
    }

    try {
        await db.delete(dateOptions).where(eq(dateOptions.id, optionId))

        revalidatePath(`/projects/${projectId}/scheduling`)
        return { success: true }
    } catch (error) {
        console.error('Error deleting date option:', error)
        return { success: false, error: 'Failed to delete date option' }
    }
}

// Submit or update a date response from a collaborator
export async function submitDateResponse(
    dateOptionId: number,
    projectId: number,
    response: 'yes' | 'no' | 'maybe',
    note?: string
): Promise<{ success: boolean; error?: string }> {
    const session = await getSession()
    if (!session?.user) {
        return { success: false, error: 'Unauthorized - must be logged in to respond' }
    }

    try {
        // Find the guest record for this user in this project
        const guest = await db.query.guests.findFirst({
            where: and(
                eq(guests.projectId, projectId),
                eq(guests.email, session.user.email)
            )
        })

        if (!guest) {
            return { success: false, error: 'You are not a collaborator on this project' }
        }

        await db.insert(dateResponses)
            .values({
                dateOptionId,
                guestId: guest.id,
                response,
                note: note || null,
            })
            .onConflictDoUpdate({
                target: [dateResponses.dateOptionId, dateResponses.guestId],
                set: {
                    response,
                    note: note || null,
                    updatedAt: new Date(),
                },
            })

        revalidatePath(`/projects/${projectId}/scheduling`)
        return { success: true }
    } catch (error) {
        console.error('Error submitting date response:', error)
        return { success: false, error: 'Failed to submit response' }
    }
}

// Get collaborator's responses for a project
export async function getMyDateResponses(projectId: number): Promise<Record<number, { response: string; note: string | null }>> {
    const session = await getSession()
    if (!session?.user) {
        return {}
    }

    const guest = await db.query.guests.findFirst({
        where: and(
            eq(guests.projectId, projectId),
            eq(guests.email, session.user.email)
        ),
        with: {
            dateResponses: true
        }
    })

    if (!guest) {
        return {}
    }

    const responses: Record<number, { response: string; note: string | null }> = {}
    for (const r of guest.dateResponses) {
        responses[r.dateOptionId] = { response: r.response, note: r.note }
    }

    return responses
}
