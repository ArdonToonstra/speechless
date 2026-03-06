import React from 'react'
import { getSession } from '@/actions/auth'
import { redirect } from 'next/navigation'
import { getLocale, getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { LanguageSwitcher } from '@/components/features/LanguageSwitcher'

export const dynamic = 'force-dynamic'

export default async function Page() {
    const session = await getSession()
    const locale = await getLocale()

    // Redirect authenticated users to dashboard
    if (session) {
        redirect(`/${locale}/dashboard`)
    }

    const t = await getTranslations('home')
    const tCommon = await getTranslations('common')

    return (
        <div className="min-h-screen bg-background flex flex-col text-foreground overflow-x-hidden">
            <div className="flex-1 flex flex-col items-center p-6 w-full">
                {/* Hero Section */}
                <div className="max-w-4xl w-full text-center mt-20 mb-16 relative z-10">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src="/images/branding/base-logo.webp"
                        alt="Toast"
                        className="h-32 md:h-40 w-auto object-contain mx-auto mb-6"
                    />
                    <h1 className="text-5xl md:text-7xl font-serif font-bold mb-6 text-primary tracking-tight">{t('heroTitle')}</h1>
                    <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-10">
                        {t('heroTagline1')} <br className="hidden md:block" />
                        {t('heroTagline2')} <br className="hidden md:block" />
                        {t('heroTagline3')}
                    </p>

                    <div className="flex gap-4 justify-center mb-4">
                        <Link href="/signup" className="px-8 py-4 bg-primary hover:opacity-90 text-primary-foreground font-bold rounded-full text-lg transition-all transform hover:scale-105 shadow-lg shadow-primary/20">
                            {t('heroCta')}
                        </Link>
                        <Link href="/login" className="px-8 py-4 bg-secondary/20 hover:bg-secondary/30 text-foreground font-semibold rounded-full text-lg backdrop-blur-sm transition-all border border-border/50">
                            {t('heroLogin')}
                        </Link>
                    </div>

                    <div className="flex justify-center mb-12">
                        <LanguageSwitcher />
                    </div>

                    {/* Hero Product Peek: Project Hub */}
                    <div className="relative mx-auto w-full max-w-3xl perspective-1000 group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-primary to-accent rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                        <div className="relative bg-card rounded-xl border border-border/50 shadow-2xl overflow-hidden transform transition-all hover:scale-[1.01] hover:-rotate-1 flex flex-col md:flex-row">
                            {/* Project Overview Side */}
                            <div className="flex-1 p-6 md:p-8 text-left space-y-6">
                                <div>
                                    <div className="text-xs font-bold text-primary uppercase tracking-widest mb-2">{t('previewActiveProject')}</div>
                                    <h3 className="text-2xl font-serif font-bold text-foreground">Sarah&apos;s Wedding Toast</h3>
                                    <p className="text-sm text-muted-foreground mt-1">{t('previewLastEdited')}</p>
                                </div>

                                <div className="space-y-3">
                                    <div className="text-xs font-semibold text-muted-foreground uppercase">{t('previewCollaborators')}</div>
                                    <div className="flex -space-x-3">
                                        <div className="w-10 h-10 rounded-full border-2 border-card bg-amber-200 flex items-center justify-center text-amber-800 text-xs font-bold">ME</div>
                                        <div className="w-10 h-10 rounded-full border-2 border-card bg-emerald-200 flex items-center justify-center text-emerald-800 text-xs font-bold">JD</div>
                                        <div className="w-10 h-10 rounded-full border-2 border-card bg-blue-200 flex items-center justify-center text-blue-800 text-xs font-bold">AS</div>
                                        <div className="w-10 h-10 rounded-full border-2 border-card bg-muted flex items-center justify-center text-muted-foreground text-xs">+2</div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="text-xs font-semibold text-muted-foreground uppercase">{t('previewLinkedVenue')}</div>
                                    <div className="flex items-center gap-3 bg-muted/30 p-2 rounded-lg border border-border/50">
                                        <div className="w-10 h-10 rounded bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary">📍</div>
                                        <div>
                                            <div className="text-sm font-semibold text-foreground">The Grand Hotel</div>
                                            <div className="text-xs text-muted-foreground">Ballroom B • 150 Guests</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Recent Activity / Status Side */}
                            <div className="w-full md:w-64 bg-muted/10 border-t md:border-t-0 md:border-l border-border/50 p-6 text-left space-y-4">
                                <div className="text-xs font-semibold text-muted-foreground uppercase mb-2">{t('previewStatus')}</div>
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                    {t('previewDraftingPhase')}
                                </div>

                                <div className="pt-4 border-t border-border/30">
                                    <div className="text-xs font-semibold text-muted-foreground uppercase mb-3">{t('previewRecentActivity')}</div>
                                    <div className="space-y-3">
                                        <div className="flex gap-2 text-xs">
                                            <span className="font-bold text-foreground">JD</span>
                                            <span className="text-muted-foreground">{t('previewAddedComment')}</span>
                                        </div>
                                        <div className="flex gap-2 text-xs">
                                            <span className="font-bold text-foreground">AS</span>
                                            <span className="text-muted-foreground">{t('previewSuggestedVenue')}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Visual Timeline */}
                <div className="w-full max-w-5xl px-4 py-24 relative">
                    {/* Connecting Line */}
                    <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-transparent via-border to-transparent"></div>

                    {/* Step 1: Gather & Invite */}
                    <div className="relative flex flex-col md:flex-row items-center gap-8 md:gap-16 mb-32 group">
                        <div className="md:w-1/2 text-left md:text-right md:pr-12 relative z-10 order-2 md:order-1">
                            <div className="inline-block px-3 py-1 bg-primary/10 dark:bg-primary/20 text-primary rounded-full text-xs font-bold mb-3 tracking-wider uppercase">{t('step1Badge')}</div>
                            <h3 className="text-3xl font-serif font-bold mb-4 text-foreground">{t('step1Title')}</h3>
                            <p className="text-muted-foreground text-lg leading-relaxed">
                                {t('step1Description')}
                            </p>
                        </div>

                        {/* Center Node */}
                        <div className="absolute left-4 md:left-1/2 -ml-[9px] w-5 h-5 rounded-full border-4 border-background bg-primary z-20"></div>

                        {/* Step 1 Visual: Invite Card */}
                        <div className="md:w-1/2 w-full pl-12 md:pl-0 order-1 md:order-2">
                            <div className="bg-card border border-border/50 rounded-xl shadow-xl overflow-hidden max-w-sm mx-auto md:mx-0 p-6 space-y-4">
                                <div className="text-sm font-semibold text-foreground">{t('previewInviteCollaborators')}</div>
                                <div className="flex gap-2">
                                    <div className="h-10 flex-1 bg-muted/30 border border-border rounded-lg px-3 flex items-center text-sm text-muted-foreground">mom@example.com</div>
                                    <div className="h-10 px-4 bg-primary text-primary-foreground rounded-lg flex items-center justify-center font-semibold text-sm">{t('previewSend')}</div>
                                </div>
                                <div className="pt-2">
                                    <div className="text-xs text-muted-foreground mb-2">{t('previewAnyoneCanEdit')}</div>
                                    <div className="flex items-center gap-2 text-primary font-semibold text-sm cursor-default">
                                        <span>🔗</span> {t('previewCopyInviteLink')}
                                    </div>
                                </div>
                                <div className="flex -space-x-2 pt-2">
                                    <div className="w-8 h-8 rounded-full bg-blue-100 border-2 border-card flex items-center justify-center text-[10px]">A</div>
                                    <div className="w-8 h-8 rounded-full bg-green-100 border-2 border-card flex items-center justify-center text-[10px]">B</div>
                                    <div className="w-8 h-8 rounded-full bg-muted border-2 border-card flex items-center justify-center text-[10px] text-muted-foreground">+</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Step 2: Co-Create */}
                    <div className="relative flex flex-col md:flex-row items-center gap-8 md:gap-16 mb-32 group">
                        {/* Step 2 Visual: Feedback */}
                        <div className="md:w-1/2 w-full pl-12 md:pl-0 order-1">
                            <div className="bg-card border border-border/50 rounded-xl shadow-xl overflow-hidden aspect-[4/3] md:aspect-auto md:h-64 relative p-6 md:p-8 flex flex-col">
                                <div className="space-y-3 opacity-50 blur-[1px]">
                                    <div className="h-2 w-full bg-foreground/10 rounded"></div>
                                    <div className="h-2 w-5/6 bg-foreground/10 rounded"></div>
                                </div>

                                <div className="my-4 p-3 bg-amber-50 dark:bg-amber-900/10 border-l-4 border-amber-400 rounded-r-lg relative">
                                    <p className="text-sm text-foreground font-serif italic mb-2">{t('step2Quote')}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <div className="w-5 h-5 rounded-full bg-primary/20"></div>
                                        <span className="text-xs font-bold text-muted-foreground">{t('step2Reviewer')}</span>
                                    </div>
                                </div>

                                <div className="space-y-3 opacity-50 blur-[1px]">
                                    <div className="h-2 w-full bg-foreground/10 rounded"></div>
                                    <div className="h-2 w-4/5 bg-foreground/10 rounded"></div>
                                </div>
                            </div>
                        </div>

                        {/* Center Node */}
                        <div className="absolute left-4 md:left-1/2 -ml-[9px] w-5 h-5 rounded-full border-4 border-background bg-amber-500 z-20"></div>

                        <div className="md:w-1/2 text-left md:pl-12 relative z-10 order-2">
                            <div className="inline-block px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-full text-xs font-bold mb-3 tracking-wider uppercase">{t('step2Badge')}</div>
                            <h3 className="text-3xl font-serif font-bold mb-4 text-foreground">{t('step2Title')}</h3>
                            <p className="text-muted-foreground text-lg leading-relaxed">
                                {t('step2Description')}
                            </p>
                        </div>
                    </div>

                    {/* Step 3: Location */}
                    <div className="relative flex flex-col md:flex-row items-center gap-8 md:gap-16 mb-32 group">
                        <div className="md:w-1/2 text-left md:text-right md:pr-12 relative z-10 order-2 md:order-1">
                            <div className="inline-block px-3 py-1 bg-primary/10 dark:bg-primary/20 text-primary rounded-full text-xs font-bold mb-3 tracking-wider uppercase">{t('step3Badge')}</div>
                            <h3 className="text-3xl font-serif font-bold mb-4 text-foreground">{t('step3Title')}</h3>
                            <p className="text-muted-foreground text-lg leading-relaxed">
                                {t('step3Description')}
                            </p>
                        </div>

                        {/* Center Node */}
                        <div className="absolute left-4 md:left-1/2 -ml-[9px] w-5 h-5 rounded-full border-4 border-background bg-primary z-20"></div>

                        {/* Step 3 Visual: Location Card */}
                        <div className="md:w-1/2 w-full pl-12 md:pl-0 order-1 md:order-2">
                            <div className="bg-card border border-border/50 rounded-xl shadow-xl overflow-hidden max-w-sm mx-auto md:mx-0">
                                {/* Image Placeholder */}
                                <div className="h-40 bg-muted relative">
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                                    <div className="absolute bottom-3 left-3 text-white font-bold text-lg">The Grand Library</div>
                                    <div className="absolute top-3 right-3 bg-white/90 text-black text-xs font-bold px-2 py-1 rounded">{t('previewAvailable')}</div>
                                </div>
                                <div className="p-5 space-y-4">
                                    <div className="flex justify-between items-center text-sm">
                                        <div className="flex items-center gap-1 text-muted-foreground">
                                            <span>👥</span> {t('previewGuests')}
                                        </div>
                                        <div className="flex items-center gap-1 text-muted-foreground">
                                            <span>📍</span> {t('previewDowntown')}
                                        </div>
                                    </div>
                                    <div className="flex gap-2 text-xs">
                                        <span className="px-2 py-1 rounded bg-muted">Microphone</span>
                                        <span className="px-2 py-1 rounded bg-muted">Stage</span>
                                        <span className="px-2 py-1 rounded bg-muted">Lighting</span>
                                    </div>
                                    <button className="w-full py-2 bg-primary/10 text-primary font-bold rounded-lg hover:bg-primary/20 transition-colors text-sm">
                                        {t('previewViewDetails')}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Step 4: Tickets */}
                    <div className="relative flex flex-col md:flex-row items-center gap-8 md:gap-16 group">
                        {/* Step 4 Visual: Tickets */}
                        <div className="md:w-1/2 w-full pl-12 md:pl-0 order-1">
                            <div className="relative max-w-sm mx-auto md:ml-auto md:mr-0 space-y-4 pr-4">
                                {/* Golden Ticket */}
                                <div className="relative bg-gradient-to-r from-amber-200 via-amber-300 to-amber-200 text-amber-900 rounded-lg shadow-lg p-5 border border-amber-400/50 transform rotate-2 hover:rotate-0 transition-all duration-300 z-10 mx-4">
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-background rounded-r-full"></div>
                                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-background rounded-l-full"></div>
                                    <div className="border-2 border-dashed border-amber-900/30 rounded p-4 text-center">
                                        <div className="text-xs font-bold uppercase tracking-widest mb-1">{t('previewGoldenTicket')}</div>
                                        <div className="text-xl font-serif font-bold">{t('previewTheReceiver')}</div>
                                        <div className="text-xs mt-2 font-semibold opacity-75">{t('previewSurpriseGuest')}</div>
                                    </div>
                                </div>

                                {/* Silver Ticket */}
                                <div className="relative bg-gradient-to-r from-slate-100 via-slate-200 to-slate-100 text-slate-700 rounded-lg shadow-md p-5 border border-slate-300 transform -rotate-2 hover:rotate-0 transition-all duration-300 -mt-2">
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-background rounded-r-full"></div>
                                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-background rounded-l-full"></div>
                                    <div className="border-2 border-dashed border-slate-400/30 rounded p-4 flex justify-between items-center px-6">
                                        <div className="text-left">
                                            <div className="text-xs font-bold uppercase tracking-widest mb-1">{t('previewSilverTicket')}</div>
                                            <div className="text-lg font-serif font-bold">{t('previewAttendees')}</div>
                                        </div>
                                        <div className="text-2xl opacity-50">🎟️</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Center Node */}
                        <div className="absolute left-4 md:left-1/2 -ml-[9px] w-5 h-5 rounded-full border-4 border-background bg-amber-400 z-20"></div>

                        <div className="md:w-1/2 text-left md:pl-12 relative z-10 order-2">
                            <div className="inline-block px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-full text-xs font-bold mb-3 tracking-wider uppercase">{t('step4Badge')}</div>
                            <h3 className="text-3xl font-serif font-bold mb-4 text-foreground">{t('step4Title')}</h3>
                            <p className="text-muted-foreground text-lg leading-relaxed">
                                {t('step4Description')}
                            </p>
                        </div>
                    </div>
                </div>

            </div>

            {/* CTA Section */}
            <div className="w-full py-24 bg-card mt-0 border-t border-border/50 text-center px-4">
                <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6 text-foreground">{t('ctaTitle')}</h2>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
                    {t('ctaDescription')}
                </p>
                <div className="flex gap-4 justify-center">
                    <Link href="/signup" className="px-10 py-5 bg-primary hover:opacity-90 text-primary-foreground font-bold rounded-full text-xl shadow-xl transition-all transform hover:scale-105">
                        {t('ctaCta')}
                    </Link>
                </div>

                <div className="mt-12 flex gap-6 justify-center text-sm text-muted-foreground/60">
                    <Link href="/privacy" className="hover:text-muted-foreground transition-colors">{tCommon('privacy')}</Link>
                    <Link href="/terms" className="hover:text-muted-foreground transition-colors">{tCommon('terms')}</Link>
                </div>

            </div>
        </div>
    )
}
