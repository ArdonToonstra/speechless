import React from 'react'
import { redirect } from 'next/navigation'
import { ProfileForms } from '@/components/features/ProfileForms'
import { ArrowLeft } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import { Button } from '@/components/ui/button'
import { getSession } from '@/actions/auth'
import { getLocale, getTranslations } from 'next-intl/server'

export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
    const session = await getSession()
    const locale = await getLocale()

    if (!session) {
        redirect(`/${locale}/login`)
    }

    const t = await getTranslations('settings')
    const tCommon = await getTranslations('common')

    return (
        <div className="min-h-screen bg-background p-6 md:p-12">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <Button variant="ghost" className="pl-0 hover:bg-transparent -ml-2 mb-4 text-muted-foreground hover:text-foreground" asChild>
                        <Link href="/dashboard">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            {tCommon('backToDashboard')}
                        </Link>
                    </Button>
                    <h1 className="text-3xl font-serif font-bold text-foreground">{t('title')}</h1>
                    <p className="text-muted-foreground mt-2">{t('subtitle')}</p>
                </div>

                <ProfileForms user={session.user} />
            </div>
        </div>
    )
}
