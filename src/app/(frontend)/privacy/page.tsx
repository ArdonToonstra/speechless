import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function PrivacyPage() {
    return (
        <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
            <header className="w-full p-4 md:p-6 flex items-center justify-between max-w-3xl mx-auto w-full">
                <Link href="/" className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                    <span className="font-medium">Back</span>
                </Link>
            </header>

            <main className="flex-1 p-4 md:p-8 max-w-3xl mx-auto w-full">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-8">
                    Privacy Policy
                </h1>

                <div className="prose dark:prose-invert max-w-none">
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        Last updated: March 2026
                    </p>

                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
                        Cookies
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        We only use technically necessary cookies required for the application to function properly,
                        such as session cookies to keep you logged in. We do not use advertising cookies.
                    </p>

                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
                        Analytics
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        We use <a href="https://umami.is" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">Umami</a> to
                        collect anonymous usage statistics, such as which pages are visited and how often. Umami does not
                        use cookies, does not collect personal information, and does not track you across websites. No data
                        is shared with third parties or used for advertising purposes.
                    </p>

                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
                        Your Data, Your Control
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        Your speeches and personal data are stored securely and are only visible to you and the
                        collaborators you invite. You can delete your account and all associated data at any time
                        from your account settings.
                    </p>

                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
                        Inactive Accounts
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        To keep our service clean, accounts that have been inactive for 5 months will receive a warning
                        email. If the account owner does not log in within 1 month of that warning, the account and all
                        associated data will be permanently deleted. You can always log in to reset the inactivity clock.
                    </p>

                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
                        Data Storage
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        Your data is stored securely in our database. We take reasonable measures to protect your
                        information, but as stated in our Terms of Service, use of this application is at your own risk.
                    </p>
                </div>

                <div className="mt-12 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <Link href="/terms" className="text-primary hover:underline">
                        View Terms of Service →
                    </Link>
                </div>
            </main>
        </div>
    )
}
