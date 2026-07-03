export const metadata = {
    title: 'Toast',
    description: 'Speech writing collaboration app',
    icons: {
        icon: '/images/branding/base-logo.png',
        // iOS home-screen icon (iOS scales the 192px PWA icon fine)
        apple: '/icons/icon-192.png',
    },
}

export default function Layout({ children }: { children: React.ReactNode }) {
    return <>{children}</>
}
