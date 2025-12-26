import { CollectionConfig } from 'payload'

export const Guests: CollectionConfig = {
    slug: 'guests',
    admin: {
        useAsTitle: 'email',
    },
    access: {
        create: ({ req: { user } }) => Boolean(user),
        read: ({ req: { user } }) => {
            if (user) return true // Users can read guests they invited (needs filtering in real app)
            return true // Allow internal read for validation based on token lookup (custom access needed later)
        },
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
            name: 'token',
            type: 'text',
            index: true,
            admin: {
                readOnly: true,
            },
            hooks: {
                beforeChange: [
                    ({ value, operation }) => {
                        if (operation === 'create' && !value) {
                            // Generate a random token
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
            name: 'role',
            type: 'select',
            options: [
                { label: 'Contributor', value: 'contributor' }, // Can only answer questions
                { label: 'Collaborator', value: 'collaborator' }, // Can edit speech (future)
            ],
            defaultValue: 'contributor',
            required: true,
        },
        {
            name: 'status',
            type: 'select',
            options: [
                { label: 'Invited', value: 'invited' },
                { label: 'Active', value: 'active' },
            ],
            defaultValue: 'invited',
        },
    ],
}
