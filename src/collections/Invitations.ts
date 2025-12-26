import { CollectionConfig } from 'payload'

export const Invitations: CollectionConfig = {
    slug: 'invitations',
    admin: {
        useAsTitle: 'email',
        defaultColumns: ['email', 'type', 'status', 'createdAt'],
    },
    access: {
        create: ({ req: { user } }) => Boolean(user),
        read: ({ req: { user } }) => Boolean(user),
        update: ({ req: { user } }) => Boolean(user),
        delete: ({ req: { user } }) => Boolean(user),
    },
    fields: [
        {
            name: 'email',
            type: 'email',
            required: true,
        },
        {
            name: 'name',
            type: 'text',
        },
        {
            name: 'project',
            type: 'relationship',
            relationTo: 'projects',
            required: true,
        },
        {
            name: 'type',
            type: 'select',
            options: [
                { label: 'Attendee', value: 'attendee' },
                { label: 'Speech Receiver', value: 'receiver' },
            ],
            required: true,
            defaultValue: 'attendee',
        },
        {
            name: 'customMessage',
            type: 'textarea',
            label: 'Custom Message',
        },
        {
            name: 'sendViaPostcard',
            type: 'checkbox',
            label: 'Send via Postcard (Coming Soon)',
            defaultValue: false,
            admin: {
                description: 'Paid feature - requires 5 days before event',
            },
        },
        {
            name: 'postcardStatus',
            type: 'select',
            options: [
                { label: 'Pending', value: 'pending' },
                { label: 'Ordered', value: 'ordered' },
                { label: 'Sent', value: 'sent' },
                { label: 'Delivered', value: 'delivered' },
            ],
            admin: {
                condition: (data) => data.sendViaPostcard === true,
            },
        },
        {
            name: 'emailSentAt',
            type: 'date',
            admin: {
                date: {
                    pickerAppearance: 'dayAndTime',
                },
                readOnly: true,
            },
        },
        {
            name: 'postcardOrderedAt',
            type: 'date',
            admin: {
                date: {
                    pickerAppearance: 'dayAndTime',
                },
                readOnly: true,
                condition: (data) => data.sendViaPostcard === true,
            },
        },
        {
            name: 'status',
            type: 'select',
            options: [
                { label: 'Pending', value: 'pending' },
                { label: 'Prepared', value: 'prepared' },
                { label: 'Sent', value: 'sent' },
                { label: 'Bounced', value: 'bounced' },
            ],
            defaultValue: 'pending',
            required: true,
        },
    ],
}
