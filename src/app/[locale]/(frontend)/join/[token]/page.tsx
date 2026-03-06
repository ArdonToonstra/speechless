import React from 'react'
import { redirect } from 'next/navigation'
import { Link } from '@/i18n/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { UserPlus, Calendar, AlertCircle, Check } from 'lucide-react'
import { format } from 'date-fns'
import { getSession } from '@/actions/auth'
import { getMagicLinkInfo, joinViaMagicLink } from '@/actions/magic-links'
import { getTranslations } from 'next-intl/server'

interface JoinPageProps {
    params: Promise<{ token: string; locale: string }>
}

export default async function JoinPage({ params }: JoinPageProps) {
    const { token, locale } = await params
    const session = await getSession()
    const t = await getTranslations('tokens.join')

    const linkInfo = await getMagicLinkInfo(token)

    if (linkInfo.error || !linkInfo.success) {
        return (
            <div className="min-h-screen bg-muted/5 flex items-center justify-center p-4">
                <Card className="max-w-md w-full">
                    <CardHeader className="text-center">
                        <div className="mx-auto mb-4 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                            <AlertCircle className="w-6 h-6 text-red-600" />
                        </div>
                        <CardTitle>{t('invalidLinkTitle')}</CardTitle>
                        <CardDescription>{t('invalidLinkDescription')}</CardDescription>
                    </CardHeader>
                    <CardContent className="text-center">
                        <Link href="/dashboard">
                            <Button>{t('goToDashboard')}</Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (linkInfo.isExpired || linkInfo.isAtLimit) {
        return (
            <div className="min-h-screen bg-muted/5 flex items-center justify-center p-4">
                <Card className="max-w-md w-full">
                    <CardHeader className="text-center">
                        <div className="mx-auto mb-4 w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                            <AlertCircle className="w-6 h-6 text-amber-600" />
                        </div>
                        <CardTitle>{t('linkExpiredTitle')}</CardTitle>
                        <CardDescription>
                            {linkInfo.isExpired ? t('linkExpiredExpired') : t('linkExpiredLimit')}
                            {' '}{t('linkExpiredAsk')}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="text-center">
                        <Link href="/dashboard">
                            <Button>{t('goToDashboard')}</Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        )
    }

    const project = linkInfo.project
    const roleLabel = linkInfo.role === 'speech-editor' ? t('speechEditor') : t('collaborator')

    if (!session?.user) {
        return (
            <div className="min-h-screen bg-muted/5 flex items-center justify-center p-4">
                <div className="max-w-lg w-full space-y-8">
                    <div className="text-center space-y-3">
                        <h1 className="text-3xl font-bold">{t('youreInvited')}</h1>
                        <p className="text-muted-foreground">
                            {t('joinAs', { role: roleLabel.toLowerCase() })}
                        </p>
                    </div>

                    <Card>
                        <CardHeader className="space-y-3">
                            <div>
                                <CardTitle className="text-2xl">{project?.name}</CardTitle>
                                <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
                                    {project?.occasionType && (
                                        <span className="capitalize">{project.occasionType}</span>
                                    )}
                                    {project?.occasionDate && (
                                        <>
                                            <span>•</span>
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-3.5 h-3.5" />
                                                {format(project.occasionDate, 'MMM d, yyyy')}
                                            </span>
                                        </>
                                    )}
                                </div>
                            </div>
                            <Badge variant="outline" className="w-fit">
                                {t('joiningAs', { role: roleLabel })}
                            </Badge>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <p className="text-sm text-muted-foreground">
                                {t('signInToJoin')}
                            </p>

                            <div className="grid grid-cols-2 gap-3">
                                <Link href={`/login?redirect=/join/${token}`}>
                                    <Button variant="outline" className="w-full">
                                        {t('signIn')}
                                    </Button>
                                </Link>
                                <Link href={`/signup?redirect=/join/${token}`}>
                                    <Button className="w-full">
                                        {t('createAccount')}
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        )
    }

    const joinResult = await joinViaMagicLink(token)

    if (joinResult.error) {
        if (joinResult.projectId) {
            redirect(`/${locale}/projects/${joinResult.projectId}`)
        }

        return (
            <div className="min-h-screen bg-muted/5 flex items-center justify-center p-4">
                <Card className="max-w-md w-full">
                    <CardHeader className="text-center">
                        <div className="mx-auto mb-4 w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                            <AlertCircle className="w-6 h-6 text-amber-600" />
                        </div>
                        <CardTitle>{t('unableToJoinTitle')}</CardTitle>
                        <CardDescription>{joinResult.error}</CardDescription>
                    </CardHeader>
                    <CardContent className="text-center">
                        <Link href="/dashboard">
                            <Button>{t('goToDashboard')}</Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-muted/5 flex items-center justify-center p-4">
            <Card className="max-w-md w-full">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                        <Check className="w-6 h-6 text-emerald-600" />
                    </div>
                    <CardTitle>{t('welcomeToTeam')}</CardTitle>
                    <CardDescription>
                        {t('youveJoined', { project: joinResult.projectName ?? '', role: roleLabel.toLowerCase() })}
                    </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                    <Link href={`/projects/${joinResult.projectId}`}>
                        <Button className="gap-2">
                            <UserPlus className="w-4 h-4" />
                            {t('viewProject')}
                        </Button>
                    </Link>
                </CardContent>
            </Card>
        </div>
    )
}
