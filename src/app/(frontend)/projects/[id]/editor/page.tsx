import React from 'react'
import { getPayload } from 'payload'
import config from '@payload-config'
import { notFound, redirect } from 'next/navigation'
import { PenTool } from 'lucide-react'
import { InteractiveEditor } from '@/components/features/InteractiveEditor'

export default async function EditorPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const projectId = parseInt(id)
    if (isNaN(projectId)) notFound()

    const payload = await getPayload({ config })

    // Auth check
    const { user } = await payload.auth({ headers: await (await import('next/headers')).headers() })
    if (!user) return redirect('/login')

    // Fetch Project
    const project = await payload.findByID({
        collection: 'projects',
        id: projectId,
        user,
    })

    if (!project) notFound()

    return (
        <div className="h-full flex flex-col">
            {/* 
                The Editor currently includes its own header/title logic. 
                We might want to simplify InteractiveEditor to fit better here or keep it full screen. 
                For now, I'll wrap it but perhaps hide the sidebar or make it collapsible if screen real estate is tight,
                but the request was "speech editor... connection to input...". 
                I will start by just rendering it within the shell's content area. 
                Wait, InteractiveEditor generates its own header with "Saved" status. 
                I'll keep that for now but maybe remove the redundant title/back button.
            */}
            <div className="flex items-center gap-3 pb-4 border-b mb-4 shrink-0">
                <div className="p-2 bg-primary/10 rounded-lg">
                    <PenTool className="w-6 h-6 text-primary" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold">Speech Editor</h1>
                    <p className="text-muted-foreground">Draft your masterpiece.</p>
                </div>
            </div>

            <div className="flex-1 min-h-0 border rounded-lg bg-background shadow-sm overflow-hidden">
                <InteractiveEditor project={project as any} />
            </div>
        </div>
    )
}
