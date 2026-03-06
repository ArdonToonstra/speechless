'use client'

import { useLocale, useTranslations } from 'next-intl'
import { useRouter, usePathname } from '@/i18n/navigation'
import { routing } from '@/i18n/routing'

export function LanguageSwitcher() {
    const locale = useLocale()
    const router = useRouter()
    const pathname = usePathname()
    const t = useTranslations('languageSwitcher')

    const switchLocale = (newLocale: string) => {
        router.replace(pathname, { locale: newLocale })
    }

    return (
        <div className="flex items-center gap-1 text-sm">
            {routing.locales.map((l, index) => (
                <span key={l} className="flex items-center gap-1">
                    {index > 0 && <span className="text-muted-foreground/40">|</span>}
                    <button
                        onClick={() => switchLocale(l)}
                        className={locale === l
                            ? 'font-semibold text-foreground'
                            : 'text-muted-foreground hover:text-foreground transition-colors'
                        }
                        aria-label={`Switch to ${l.toUpperCase()}`}
                    >
                        {l.toUpperCase()}
                    </button>
                </span>
            ))}
        </div>
    )
}
