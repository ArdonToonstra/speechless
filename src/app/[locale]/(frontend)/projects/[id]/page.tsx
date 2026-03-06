import { redirect } from 'next/navigation'

export default async function ProjectRootPage({ params }: { params: Promise<{ id: string; locale: string }> }) {
    const { id, locale } = await params
    redirect(`/${locale}/projects/${id}/overview`)
}
