import { CollectionConfig } from 'payload'

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
        read: ({ req: { user } }) => {
            if (!user) return false
            return {
                owner: {
                    equals: user.id,
                },
            }
        },
        update: ({ req: { user } }) => {
            if (!user) return false
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
                { text: 'What is your favorite memory with the couple?' },
                { text: 'Do you have any advice for them?' },
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
