import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

import { locations } from '@/data/mock-locations'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Building2, Ticket, MapPin } from 'lucide-react'

interface LocationManagerProps {
    projectId: number
    location: {
        slug?: string | null
        venue?: string | null
        address?: string | null
        time?: string | null
        notes?: string | null
    }
}

export function LocationManager({ projectId, location }: LocationManagerProps) {
    // Find the selected mock location if a slug exists
    const selectedMockLocation = location?.slug ? locations.find(l => l.slug === location?.slug) : null

    return (
        <div className="space-y-6">
            {/* Venue Selection Card */}
            <Card className="overflow-hidden border-border shadow-sm transition-all hover:shadow-md">
                <CardHeader className="bg-muted/30 pb-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-xl flex items-center gap-2">
                                <Building2 className="w-5 h-5 text-primary" />
                                Venue Selection
                            </CardTitle>
                            <CardDescription>Choose a venue from our curated collection.</CardDescription>
                        </div>
                        {selectedMockLocation && (
                            <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                                <Ticket className="w-3 h-3 mr-1" /> Premium Venue
                            </Badge>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="pt-6">
                    {selectedMockLocation ? (
                        <div className="flex flex-col md:flex-row gap-6 items-start">
                            <div className="relative w-full md:w-48 h-32 rounded-xl overflow-hidden shadow-sm flex-shrink-0">
                                <Image
                                    src={selectedMockLocation.image}
                                    alt={selectedMockLocation.name}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <div className="flex-1 space-y-2">
                                <h3 className="text-lg font-bold text-foreground">{selectedMockLocation.name}</h3>
                                <div className="flex gap-3 text-sm text-muted-foreground">
                                    <div className="flex items-center">
                                        <MapPin className="w-3 h-3 mr-1" />
                                        {selectedMockLocation.city}
                                    </div>
                                    <div className="flex items-center">
                                        <Building2 className="w-3 h-3 mr-1" />
                                        {selectedMockLocation.type}
                                    </div>
                                </div>
                                <p className="text-sm text-muted-foreground line-clamp-2">{selectedMockLocation.description}</p>
                            </div>
                            <div className="flex flex-col gap-2 w-full md:w-auto">
                                <Button asChild className="w-full">
                                    <Link href={`/locations/${selectedMockLocation.slug}?projectId=${projectId}`}>
                                        View Details
                                    </Link>
                                </Button>
                                <Button asChild variant="outline" className="w-full">
                                    <Link href={`/locations?projectId=${projectId}`}>
                                        Change Venue
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-8 bg-muted/10 rounded-xl border border-dashed border-border">
                            <Building2 className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
                            <h3 className="text-lg font-semibold text-foreground">No Venue Selected</h3>
                            <p className="text-muted-foreground mb-6 max-w-sm mx-auto">Browse our catalogue of premium venues to find the perfect spot for your speech.</p>
                            <Button asChild className="shadow-lg shadow-primary/20">
                                <Link href={`/locations?projectId=${projectId}`}>
                                    Browse Venues <ArrowRight className="w-4 h-4 ml-2" />
                                </Link>
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
