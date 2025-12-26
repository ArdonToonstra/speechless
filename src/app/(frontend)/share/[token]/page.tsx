import React from 'react'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { notFound } from 'next/navigation'
import { Editor } from '@/components/editor/Editor'

export default async function SharedProjectPage({ params }: { params: any }) {
    const { token } = await params
    const payload = await getPayload({ config: configPromise })

    const projects = await payload.find({
        collection: 'projects',
        where: {
            and: [
                {
                    magicLinkToken: {
                        equals: token,
                    },
                },
                {
                    magicLinkEnabled: {
                        equals: true,
                    },
                },
            ],
        },
        limit: 1,
    })

    if (projects.docs.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-800">
                <div className="text-center p-8 bg-white rounded-xl shadow-lg max-w-md">
                    <h1 className="text-2xl font-bold mb-4 font-serif">Link Expired or Invalid</h1>
                    <p className="text-slate-500">
                        The speech you are looking for is not available. Please check the link or contact the author.
                    </p>
                </div>
            </div>
        )
    }

    const project = projects.docs[0]

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-12">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8 text-center">
                    <h1 className="text-4xl font-serif font-bold text-slate-900 mb-2">{project.title}</h1>
                    <p className="text-slate-500">Shared via Speechless</p>
                </div>

                <Editor
                    initialState={project.content}
                    readOnly={true}
                />
            </div>
        </div>
    )
}
