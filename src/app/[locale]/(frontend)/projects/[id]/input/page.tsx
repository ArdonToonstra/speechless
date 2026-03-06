import { notFound } from 'next/navigation'
import { redirect } from 'next/navigation'

export default async function InputPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    if (isNaN(parseInt(id))) notFound()
    redirect(`/projects/${id}/questionnaire`)
}
