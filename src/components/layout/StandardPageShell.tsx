import React from 'react'

export function StandardPageShell({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-50">
            {children}
        </div>
    )
}
