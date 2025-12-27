import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { locations } from '@/data/mock-locations'
import { StandardPageShell } from '@/components/layout/StandardPageShell'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowLeft, MapPin, Users, Building2, CheckCircle2, Calendar } from 'lucide-react'

export async function generateStaticParams() {
    return locations.map((location) => ({
        slug: location.slug,
    }))
}

export default async function LocationDetailPage({ params, searchParams }: { params: Promise<{ slug: string }>, searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
    const { slug } = await params
    const { projectId } = (await searchParams) as { projectId?: string }
    const location = locations.find((l) => l.slug === slug)

    if (!location) {
        notFound()
    }

    return (
        <StandardPageShell>
            <div className="min-h-screen bg-slate-50 pb-20">
                {/* Hero Section */}
                <div className="relative h-[60vh] w-full">
                    <Image
                        src={location.image}
                        alt={location.name}
                        fill
                        className="object-cover"
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 w-full p-6 md:p-12">
                        <div className="max-w-7xl mx-auto">
                            <Link
                                href="/locations"
                                className="inline-flex items-center text-white/80 hover:text-white mb-6 transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back to Locations
                            </Link>
                            <div className="flex flex-wrap gap-3 mb-4">
                                <Badge className="bg-indigo-600 text-white border-none text-base px-3 py-1">
                                    <MapPin className="w-4 h-4 mr-1" /> {location.city}
                                </Badge>
                                <Badge variant="outline" className="text-white border-white/30 text-base px-3 py-1">
                                    {location.type}
                                </Badge>
                            </div>
                            <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-2">{location.name}</h1>
                            <p className="text-xl text-white/90 max-w-2xl font-light">{location.description}</p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Info */}
                        <div className="lg:col-span-2 space-y-8">
                            <Card className="border-none shadow-xl">
                                <CardContent className="p-8">
                                    <h2 className="text-2xl font-bold mb-6 text-slate-800">About this Venue</h2>
                                    <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed">
                                        <p>{location.description}</p>
                                        <p>
                                            Located in the heart of {location.city}, {location.name} offers a unique atmosphere for your events.
                                            Whether you are planning a keynote speech, a team workshop, or a large conference, this venue provides the
                                            perfect backdrop.
                                        </p>
                                    </div>

                                    <div className="mt-8">
                                        <h3 className="text-lg font-semibold mb-4 text-slate-800">Amenities</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {location.details.amenities.map((amenity) => (
                                                <div key={amenity} className="flex items-center text-slate-600 bg-slate-50 p-3 rounded-lg">
                                                    <CheckCircle2 className="w-5 h-5 text-indigo-600 mr-3" />
                                                    {amenity}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            <Card className="border-none shadow-xl bg-white">
                                <CardContent className="p-6 space-y-6">
                                    <div>
                                        <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-3">Key Details</h3>
                                        <div className="space-y-4">
                                            <div className="flex items-start">
                                                <div className="p-2 bg-indigo-50 rounded-lg mr-3">
                                                    <Users className="w-5 h-5 text-indigo-600" />
                                                </div>
                                                <div>
                                                    <p className="text-sm text-slate-500">Capacity</p>
                                                    <p className="font-semibold text-slate-900">{location.capacity} Guests</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start">
                                                <div className="p-2 bg-indigo-50 rounded-lg mr-3">
                                                    <Building2 className="w-5 h-5 text-indigo-600" />
                                                </div>
                                                <div>
                                                    <p className="text-sm text-slate-500">Venue Type</p>
                                                    <p className="font-semibold text-slate-900">{location.type}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start">
                                                <div className="p-2 bg-indigo-50 rounded-lg mr-3">
                                                    <MapPin className="w-5 h-5 text-indigo-600" />
                                                </div>
                                                <div>
                                                    <p className="text-sm text-slate-500">Address</p>
                                                    <p className="font-semibold text-slate-900">{location.details.address}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-6 border-t border-slate-100">
                                        {projectId ? (
                                            <form action={async () => {
                                                'use server'
                                                // We need to import the server action dynamically to avoid client/server conflicts if this was client component
                                                // but this is a server component, so we can import it.
                                                // However, we need to pass IDs. 
                                                // We can use a hidden form or bind arguments.
                                                const { selectProjectLocation } = await import('@/actions/location')
                                                const { redirect } = await import('next/navigation')

                                                await selectProjectLocation(parseInt(projectId), slug)
                                                redirect(`/projects/${projectId}/location`)
                                            }}>
                                                <Button
                                                    type="submit"
                                                    className="w-full h-12 text-lg bg-amber-400 hover:bg-amber-500 text-slate-900 font-bold shadow-lg shadow-amber-400/20"
                                                >
                                                    <CheckCircle2 className="w-5 h-5 mr-2" />
                                                    Select This Venue
                                                </Button>
                                                <p className="text-xs text-center text-slate-400 mt-3">
                                                    This will update your project settings
                                                </p>
                                            </form>
                                        ) : (
                                            <>
                                                <Button className="w-full h-12 text-lg bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-600/20">
                                                    <Calendar className="w-4 h-4 mr-2" />
                                                    Check Availability
                                                </Button>
                                                <p className="text-xs text-center text-slate-400 mt-3">
                                                    Contact us to book a viewing
                                                </p>
                                            </>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </StandardPageShell>
    )
}
