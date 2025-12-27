import { CollectionConfig, Where } from 'payload'

export const Projects: CollectionConfig = {
    slug: 'projects',
    admin: {
        useAsTitle: 'title',
        defaultColumns: ['title', 'type', 'date', 'status'],
    },
    access: {
        create: ({ req: { user } }) => {
            return Boolean(user)
        },
        read: async ({ req: { user, payload } }) => {
            if (!user) return false

            // Find all projects where the user is a guest
            const guests = await payload.find({
                collection: 'guests',
                where: {
                    email: { equals: user.email },
                },
                depth: 0,
                limit: 1000, // Reasonable limit
            })

            const guestProjectIds = guests.docs.map((g) => (typeof g.project === 'object' ? g.project.id : g.project))

            if (guestProjectIds.length > 0) {
                return {
                    or: [
                        {
                            owner: {
                                equals: user.id,
                            },
                        },
                        {
                            id: {
                                in: guestProjectIds,
                            },
                        },
                    ] as Where[],
                }
            }

            return {
                owner: {
                    equals: user.id,
                },
            }
        },
        update: async ({ req: { user, payload } }) => {
            if (!user) return false

            // Find all projects where the user is a guest with role 'collaborator'
            // Contributors probably shouldn't edit the project settings, maybe just input?
            // For now, let's match the roadmap: collaborators can work on the project.

            const guests = await payload.find({
                collection: 'guests',
                where: {
                    email: { equals: user.email },
                    role: { equals: 'collaborator' }, // Only full collaborators can edit
                },
                depth: 0,
            })

            const guestProjectIds = guests.docs.map((g) => (typeof g.project === 'object' ? g.project.id : g.project))

            if (guestProjectIds.length > 0) {
                return {
                    or: [
                        {
                            owner: {
                                equals: user.id,
                            },
                        },
                        {
                            id: {
                                in: guestProjectIds,
                            },
                        },
                    ] as Where[],
                }
            }

            return {
                owner: {
                    equals: user.id,
                },
            }
        },
        delete: ({ req: { user } }) => {
            if (!user) return false
            return {
                owner: {
                    equals: user.id,
                },
            }
        },
    },
    fields: [
        {
            name: 'title',
            type: 'text',
            required: true,
            label: 'Speech Title',
        },
        {
            name: 'speechReceiverName',
            type: 'text',
            required: false,
            label: 'Speech Receiver Name',
            admin: {
                description: 'The person who will receive this speech (e.g., "Sarah", "John and Mary")',
            },
        },
        {
            name: 'type',
            type: 'select',
            options: [
                { label: 'Wedding', value: 'wedding' },
                { label: 'Birthday', value: 'birthday' },
                { label: 'Funeral', value: 'funeral' },
                { label: 'Other', value: 'other' },
            ],
            required: true,
        },
        {
            name: 'date',
            type: 'date',
            required: true,
            admin: {
                date: {
                    pickerAppearance: 'dayOnly',
                },
            },
        },
        {
            name: 'owner',
            type: 'relationship',
            relationTo: 'users',
            required: true,
            hasMany: false,
            defaultValue: ({ req: { user } }: { req: { user: { id: string } | null } }) => {
                if (!user) return undefined
                return user.id
            },
            admin: {
                position: 'sidebar',
            },
        },
        {
            name: 'content',
            type: 'richText',
            label: 'Speech Draft',
        },
        {
            name: 'status',
            type: 'select',
            defaultValue: 'draft',
            options: [
                { label: 'Draft', value: 'draft' },
                { label: 'Final', value: 'final' },
                { label: 'Archived', value: 'archived' },
            ],
            admin: {
                position: 'sidebar',
            },
        },
        {
            name: 'magicLinkToken',
            type: 'text',
            index: true,
            admin: {
                readOnly: true,
                position: 'sidebar',
            },
            hooks: {
                beforeChange: [
                    ({ value, operation }) => {
                        if (operation === 'create' && !value) {
                            // Generate a random token (32 characters)
                            const array = new Uint8Array(16)
                            crypto.getRandomValues(array)
                            return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('')
                        }
                        return value
                    },
                ],
            },
        },
        {
            name: 'magicLinkEnabled',
            type: 'checkbox',
            label: 'Enable Public Sharing',
            defaultValue: false,
            admin: {
                position: 'sidebar',
            },
        },
        {
            name: 'questions',
            type: 'array',
            label: 'Questionnaire',
            fields: [
                {
                    name: 'text',
                    type: 'text',
                    required: true,
                    label: 'Question',
                },
            ],
            defaultValue: [
                { text: 'What is your favorite memory with {speechReceiverName}?' },
                { text: 'Share your best anecdotes about {speechReceiverName}' },
                { text: 'What advice would you give to {speechReceiverName}?' },
            ],
        },
        {
            name: 'questionnaireDescription',
            type: 'textarea',
            label: 'Questionnaire Intro',
            defaultValue: 'We would love to get your input to help us write a great speech!',
        },
        {
            name: 'emailTemplates',
            type: 'group',
            label: 'Invite Email Templates',
            fields: [
                {
                    name: 'attendeeMessage',
                    type: 'textarea',
                    label: 'Attendee Message Template',
                    admin: {
                        description: 'Message for guests attending the event. Use {name}, {date}, {venue}, {time}, {address} as placeholders.',
                    },
                    defaultValue: `Hi {name},

You're invited to {projectTitle} on {date}!

Location: {venue}
Time: {time}
Address: {address}

We're looking forward to celebrating with you!`,
                },
                {
                    name: 'receiverMessage',
                    type: 'textarea',
                    label: 'Receiver Message Template',
                    admin: {
                        description: 'Message for the speech recipient. Use {name}, {date} as placeholders.',
                    },
                    defaultValue: `Dear {name},

We're planning a special speech for you on {date}!

This is going to be a wonderful surprise, and we can't wait to share it with you.

See you there!`,
                },
            ],
        },
        {
            name: 'location',
            type: 'group',
            label: 'Location & Practicalities',
            fields: [
                {
                    name: 'venue',
                    type: 'text',
                    label: 'Venue Name',
                },
                {
                    name: 'address',
                    type: 'text',
                    label: 'Address',
                },
                {
                    name: 'time',
                    type: 'text',
                    label: 'Time',
                    admin: {
                        description: 'e.g. 14:00 or 2:00 PM',
                    },
                },
                {
                    name: 'notes',
                    type: 'textarea',
                    label: 'Notes / Logistics',
                },
            ],
        },
    ],
}
