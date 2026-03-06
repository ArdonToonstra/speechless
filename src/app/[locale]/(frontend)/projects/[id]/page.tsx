import { redirect } from 'next/navigation'
import { getLocale } from 'next-intl/server'

export default async function ProjectRootPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const locale = await getLocale()
    redirect(`/${locale}/projects/${id}/overview`)
}
