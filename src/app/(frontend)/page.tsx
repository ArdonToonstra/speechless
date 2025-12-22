import React from 'react'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

export default async function Page() {
    const payload = await getPayload({ config: configPromise })
    // Example data fetch to ensure connection works
    // const users = await payload.find({ collection: 'users' })

    return (
        <div className="p-10">
            <h1 className="text-4xl font-bold mb-4">Welcome to Speechless</h1>
            <p>Project initialized successfully.</p>
        </div>
    )
}
