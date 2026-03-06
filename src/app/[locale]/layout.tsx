import { Inter, Newsreader } from 'next/font/google'
import Script from 'next/script'
import { NextIntlClientProvider, hasLocale } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { routing } from '@/i18n/routing'
import { cn } from '@/lib/utils'
import './(frontend)/globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })
const newsreader = Newsreader({ subsets: ['latin'], variable: '--font-serif', style: ['normal', 'italic'] })

export async function generateStaticParams() {
    return routing.locales.map((locale) => ({ locale }))
}

export default async function LocaleLayout({
    children,
    params,
}: {
    children: React.ReactNode
    params: Promise<{ locale: string }>
}) {
    const { locale } = await params
    if (!hasLocale(routing.locales, locale)) notFound()

    const messages = await getMessages()

    return (
        <html lang={locale} suppressHydrationWarning>
            <body className={cn(inter.variable, newsreader.variable, 'font-sans antialiased bg-background text-foreground')}>
                <NextIntlClientProvider messages={messages}>
                    {children}
                </NextIntlClientProvider>
                <Script defer src="https://umami.donit.be/script.js" data-website-id="306004f2-2da6-473a-97a4-0c7a19b70289" />
            </body>
        </html>
    )
}
