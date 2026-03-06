import { redirect } from 'next/navigation'

// Fallback: middleware normally handles this redirect, but if it doesn't run, redirect to default locale
export default function RootPage() {
    redirect('/en')
}
