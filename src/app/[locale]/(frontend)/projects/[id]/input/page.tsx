import { notFound, redirect } from 'next/navigation'
import { getLocale } from 'next-intl/server'

export default async function InputPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    if (isNaN(parseInt(id))) notFound()
    const locale = await getLocale()
    redirect(`/${locale}/projects/${id}/questionnaire`)
}
