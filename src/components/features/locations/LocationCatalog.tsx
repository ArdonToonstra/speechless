'use client'

import React, { useState, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { locations, Location } from '@/data/mock-locations'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, MapPin, Building2, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

import { useSearchParams } from 'next/navigation'

export function LocationCatalog() {
    const searchParams = useSearchParams()
    const projectId = searchParams.get('projectId')

    const [search, setSearch] = useState('')
    const [cityFilter, setCityFilter] = useState<string | null>(null)
    const [typeFilter, setTypeFilter] = useState<string | null>(null)

    const filteredLocations = useMemo(() => {
        return locations.filter((loc) => {
            const matchesSearch = loc.name.toLowerCase().includes(search.toLowerCase()) ||
                loc.city.toLowerCase().includes(search.toLowerCase())
            const matchesCity = cityFilter ? loc.city === cityFilter : true
            const matchesType = typeFilter ? loc.type === typeFilter : true

            return matchesSearch && matchesCity && matchesType
        })
    }, [search, cityFilter, typeFilter])

    const uniqueCities = Array.from(new Set(locations.map((l) => l.city)))
    const uniqueTypes = Array.from(new Set(locations.map((l) => l.type)))

    return (
        <div className="space-y-12">
            {/* Filter Section */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Search venues..."
                        className="pl-10 border-none bg-slate-50 focus-visible:ring-0 focus-visible:ring-offset-0"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="flex flex-wrap gap-2 w-full md:w-auto">
                    <FilterButton
                        label="All Cities"
                        isActive={cityFilter === null}
                        onClick={() => setCityFilter(null)}
                    />
                    {uniqueCities.map(city => (
                        <FilterButton
                            key={city}
                            label={city}
                            isActive={cityFilter === city}
                            onClick={() => setCityFilter(city)}
                        />
                    ))}
                    <div className="h-6 w-px bg-slate-200 mx-2 hidden md:block"></div>
                    <FilterButton
                        label="All Types"
                        isActive={typeFilter === null}
                        onClick={() => setTypeFilter(null)}
                    />
                    {uniqueTypes.map(type => (
                        <FilterButton
                            key={type}
                            label={type}
                            isActive={typeFilter === type}
                            onClick={() => setTypeFilter(type)}
                        />
                    ))}
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredLocations.map(location => (
                    <LocationCard key={location.id} location={location} />
                ))}
            </div>

            {filteredLocations.length === 0 && (
                <div className="text-center py-20">
                    <p className="text-muted-foreground text-lg">No locations found matching your criteria.</p>
                    <Button
                        variant="link"
                        onClick={() => {
                            setCityFilter(null)
                            setTypeFilter(null)
                            setSearch('')
                        }}
                        className="mt-2 text-indigo-600"
                    >
                        Clear all filters
                    </Button>
                </div>
            )}
        </div>
    )
}

function FilterButton({ label, isActive, onClick }: { label: string, isActive: boolean, onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
                isActive
                    ? "bg-slate-900 text-white shadow-md"
                    : "bg-slate-50 text-slate-600 hover:bg-slate-100"
            )}
        >
            {label}
        </button>
    )
}

function LocationCard({ location }: { location: Location }) {
    return (
        <Link href={`/locations/${location.slug}`} className="group block h-full">
            <div className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 transform group-hover:-translate-y-1 h-full flex flex-col">
                <div className="relative h-64 overflow-hidden">
                    <Image
                        src={location.image}
                        alt={location.name}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute top-4 left-4 flex gap-2">
                        <Badge variant="secondary" className="bg-white/90 backdrop-blur-sm text-slate-900 shadow-sm border-none">
                            <MapPin className="w-3 h-3 mr-1 text-indigo-500" />
                            {location.city}
                        </Badge>
                    </div>
                </div>
                <div className="p-6 flex flex-col flex-grow">
                    <div className="flex gap-2 mb-3">
                        <Badge variant="outline" className="border-slate-200 text-slate-500 font-normal">
                            <Building2 className="w-3 h-3 mr-1" />
                            {location.type}
                        </Badge>
                        <Badge variant="outline" className="border-slate-200 text-slate-500 font-normal">
                            {location.capacity} Guests
                        </Badge>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">
                        {location.name}
                    </h3>
                    <p className="text-slate-500 text-sm line-clamp-2 mb-6 flex-grow">
                        {location.description}
                    </p>
                    <div className="flex items-center text-indigo-600 font-semibold text-sm mt-auto">
                        View Details <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
                    </div>
                </div>
            </div>
        </Link>
    )
}
