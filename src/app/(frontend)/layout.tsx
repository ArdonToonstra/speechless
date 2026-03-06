import { Inter, Newsreader } from 'next/font/google'
import Script from 'next/script'
import './globals.css'
import { cn } from '@/lib/utils'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })
const newsreader = Newsreader({ subsets: ['latin'], variable: '--font-serif', style: ['normal', 'italic'] })

export const metadata = {
    title: 'Toast',
    description: 'Speech writing collaboration app',
    icons: {
        icon: '/images/branding/base-logo.png',
    },
}

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={cn(inter.variable, newsreader.variable, "font-sans antialiased bg-background text-foreground")}>
                {children}
                <Script defer src="https://umami.donit.be/script.js" data-website-id="306004f2-2da6-473a-97a4-0c7a19b70289" />
            </body>
        </html>
    )
}
