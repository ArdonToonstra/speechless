import React from 'react'
import { StandardPageShell } from '@/components/layout/StandardPageShell'
import { LocationCatalog } from '@/components/features/locations/LocationCatalog'

export default function LocationsPage() {
    return (
        <StandardPageShell>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="text-center mb-16 space-y-4">
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900">
                        Find the Perfect <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-amber-400">Venue</span>
                    </h1>
                    <p className="text-xl text-slate-500 max-w-2xl mx-auto">
                        Discover curated spaces designed to make your speech or event unforgettable.
                        From historic halls to modern studios.
                    </p>
                </div>

                <LocationCatalog />
            </div>
        </StandardPageShell>
    )
}
