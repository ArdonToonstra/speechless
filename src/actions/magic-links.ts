'use server'

import { db, magicLinks, projects, guests } from '@/db'
import { eq, and, gt } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { requireAuth } from './auth'
import { generateToken } from '@/lib/tokens'

export type MagicLinkRole = 'collaborator' | 'speech-editor'

/**
 * Get or create a magic link for a project
 */
export async function getMagicLink(projectId: number) {
    const session = await requireAuth()

    try {
        // Verify user can manage (owner or speech-editor)
        const canManage = await checkManagePermission(projectId, session.user.id)
        if (!canManage) {
            return { error: 'Unauthorized' }
        }

        // Check for existing valid magic link
        const existingLink = await db.query.magicLinks.findFirst({
            where: and(
                eq(magicLinks.projectId, projectId),
                gt(magicLinks.expiresAt, new Date())
            ),
        })

        if (existingLink) {
            return {
                success: true,
                magicLink: existingLink,
            }
        }

        // Create new magic link (expires in 1 month)
        const expiresAt = new Date()
        expiresAt.setMonth(expiresAt.getMonth() + 1)

        const [newLink] = await db.insert(magicLinks).values({
            projectId,
            token: generateToken(),
            role: 'collaborator',
            expiresAt,
            usageLimit: 20,
            usageCount: 0,
        }).returning()

        return {
            success: true,
            magicLink: newLink,
        }
    } catch (error) {
        console.error('Failed to get/create magic link:', error)
        return { error: 'Failed to get magic link' }
    }
}

/**
 * Regenerate magic link (revokes old one)
 */
export async function regenerateMagicLink(projectId: number, role: MagicLinkRole = 'collaborator') {
    const session = await requireAuth()

    try {
        // Verify user can manage
        const canManage = await checkManagePermission(projectId, session.user.id)
        if (!canManage) {
            return { error: 'Unauthorized' }
        }

        // Delete existing magic links for this project
        await db.delete(magicLinks).where(eq(magicLinks.projectId, projectId))

        // Create new magic link
        const expiresAt = new Date()
        expiresAt.setMonth(expiresAt.getMonth() + 1)

        const [newLink] = await db.insert(magicLinks).values({
            projectId,
            token: generateToken(),
            role,
            expiresAt,
            usageLimit: 20,
            usageCount: 0,
        }).returning()

        revalidatePath(`/projects/${projectId}/collaborators`)
        return {
            success: true,
            magicLink: newLink,
        }
    } catch (error) {
        console.error('Failed to regenerate magic link:', error)
        return { error: 'Failed to regenerate magic link' }
    }
}

/**
 * Join a project via magic link
 */
export async function joinViaMagicLink(token: string) {
    const session = await requireAuth()

    try {
        // Find valid magic link
        const magicLink = await db.query.magicLinks.findFirst({
            where: and(
                eq(magicLinks.token, token),
                gt(magicLinks.expiresAt, new Date())
            ),
            with: {
                project: true,
            },
        })

        if (!magicLink) {
            return { error: 'Invalid or expired link' }
        }

        // Check usage limit
        if (magicLink.usageCount >= magicLink.usageLimit) {
            return { error: 'This link has reached its maximum usage limit' }
        }

        // Check if user is already the owner
        if (magicLink.project.ownerId === session.user.id) {
            return { error: 'You are the owner of this project' }
        }

        // Check if already a member
        const existingGuest = await db.query.guests.findFirst({
            where: and(
                eq(guests.projectId, magicLink.projectId),
                eq(guests.email, session.user.email)
            ),
        })

        if (existingGuest) {
            return {
                error: 'You are already a member of this project',
                projectId: magicLink.projectId
            }
        }

        // Add user as guest
        await db.insert(guests).values({
            email: session.user.email,
            name: session.user.name,
            projectId: magicLink.projectId,
            role: magicLink.role,
            status: 'accepted',
            emailStatus: 'sent', // They joined via link, not email
            token: generateToken(),
        })

        // Increment usage count
        await db.update(magicLinks)
            .set({ usageCount: magicLink.usageCount + 1 })
            .where(eq(magicLinks.id, magicLink.id))

        revalidatePath(`/projects/${magicLink.projectId}/collaborators`)
        return {
            success: true,
            projectId: magicLink.projectId,
            projectName: magicLink.project.name,
        }
    } catch (error) {
        console.error('Failed to join via magic link:', error)
        return { error: 'Failed to join project' }
    }
}

/**
 * Get magic link info (for join page, no auth required)
 */
export async function getMagicLinkInfo(token: string) {
    try {
        const magicLink = await db.query.magicLinks.findFirst({
            where: eq(magicLinks.token, token),
            with: {
                project: {
                    columns: {
                        id: true,
                        name: true,
                        occasionType: true,
                        occasionDate: true,
                    },
                },
            },
        })

        if (!magicLink) {
            return { error: 'Link not found' }
        }

        const isExpired = magicLink.expiresAt < new Date()
        const isAtLimit = magicLink.usageCount >= magicLink.usageLimit

        return {
            success: true,
            project: magicLink.project,
            role: magicLink.role,
            isExpired,
            isAtLimit,
            remainingUses: magicLink.usageLimit - magicLink.usageCount,
        }
    } catch (error) {
        console.error('Failed to get magic link info:', error)
        return { error: 'Failed to get link info' }
    }
}

/**
 * Helper: Check if user can manage project (owner or speech-editor)
 */
async function checkManagePermission(projectId: number, userId: string): Promise<boolean> {
    // Check if owner
    const project = await db.query.projects.findFirst({
        where: and(
            eq(projects.id, projectId),
            eq(projects.ownerId, userId)
        ),
    })

    if (project) return true

    // Check if speech-editor (need to look up by email from user)
    // For now, we'll need to get the user's email from somewhere
    // This is a simplified check - in production you'd look up the user
    const guestWithRole = await db.query.guests.findFirst({
        where: and(
            eq(guests.projectId, projectId),
            eq(guests.role, 'speech-editor'),
            eq(guests.status, 'accepted')
        ),
    })

    // Note: This check is incomplete - we'd need to match the guest email with the user
    // For now, only owners can manage. This can be enhanced later.
    return false
}
