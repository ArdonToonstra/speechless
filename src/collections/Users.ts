import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
  },
  auth: true,
  access: {
    // Anyone can create an account (signup)
    create: () => true,
    // Users can read their own profile, admins can read all
    read: ({ req: { user } }) => {
      if (!user) return false
      // Allow users to read their own document
      return {
        id: {
          equals: user.id,
        },
      }
    },
    // Users can update their own profile
    update: ({ req: { user } }) => {
      if (!user) return false
      return {
        id: {
          equals: user.id,
        },
      }
    },
    // Only admins can delete users (default behavior)
    delete: () => false,
  },
  fields: [
    // Email added by default
    {
      name: 'name',
      type: 'text',
    },
  ],
}
