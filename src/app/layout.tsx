import type { ReactNode } from 'react'

// Required by Next.js App Router — actual html/body are in [locale]/layout.tsx
export default function RootLayout({ children }: { children: ReactNode }) {
    return children
}
