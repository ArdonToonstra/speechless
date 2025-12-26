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
