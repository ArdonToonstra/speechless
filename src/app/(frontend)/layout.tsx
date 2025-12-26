import { Inter, Newsreader } from 'next/font/google'
import './globals.css'
import { cn } from '@/lib/utils'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })
const newsreader = Newsreader({ subsets: ['latin'], variable: '--font-serif', style: ['normal', 'italic'] })

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={cn(inter.variable, newsreader.variable, "font-sans antialiased bg-background text-foreground")}>
                {children}
            </body>
        </html>
    )
}
