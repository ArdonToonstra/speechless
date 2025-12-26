import { CollectionConfig } from 'payload'

export const Submissions: CollectionConfig = {
    slug: 'submissions',
    admin: {
        useAsTitle: 'id',
    },
    access: {
        create: () => true, // Creating allowed via public API (with validation)
        read: ({ req: { user } }) => Boolean(user), // Only logged in users (project owners) can read
        update: ({ req: { user } }) => Boolean(user),
        delete: ({ req: { user } }) => Boolean(user),
    },
    fields: [
        {
            name: 'project',
            type: 'relationship',
            relationTo: 'projects',
            required: true,
        },
        {
            name: 'guest',
            type: 'relationship',
            relationTo: 'guests',
            required: true,
        },
        {
            name: 'submitterName',
            type: 'text',
            required: true,
            label: 'Submitter Name',
            admin: {
                description: 'Name of the person who submitted this response',
            },
        },
        {
            name: 'answers',
            type: 'array',
            fields: [
                {
                    name: 'question',
                    type: 'text',
                    required: true,
                },
                {
                    name: 'answer',
                    type: 'textarea',
                    required: true,
                },
            ],
        },
    ],
}
