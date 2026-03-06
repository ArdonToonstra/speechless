import { notFound } from 'next/navigation'
import { redirect } from 'next/navigation'

export default async function InputPage({ params }: { params: Promise<{ id: string; locale: string }> }) {
    const { id, locale } = await params
    if (isNaN(parseInt(id))) notFound()
    redirect(`/${locale}/projects/${id}/questionnaire`)
}
