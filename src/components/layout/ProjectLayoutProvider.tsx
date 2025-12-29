'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

interface ProjectLayoutContextType {
    isHeaderCollapsed: boolean
    setHeaderCollapsed: (value: boolean) => void
}

const ProjectLayoutContext = createContext<ProjectLayoutContextType | undefined>(undefined)

export function ProjectLayoutProvider({ children }: { children: React.ReactNode }) {
    const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(false)

    useEffect(() => {
        const stored = localStorage.getItem('header-collapsed')
        if (stored) setHeaderCollapsed(stored === 'true')
    }, [])

    const setHeaderCollapsed = (value: boolean) => {
        setIsHeaderCollapsed(value)
        localStorage.setItem('header-collapsed', String(value))
    }

    return (
        <ProjectLayoutContext.Provider value={{ isHeaderCollapsed, setHeaderCollapsed }}>
            {children}
        </ProjectLayoutContext.Provider>
    )
}

export function useProjectLayout() {
    const context = useContext(ProjectLayoutContext)
    if (context === undefined) {
        throw new Error('useProjectLayout must be used within a ProjectLayoutProvider')
    }
    return context
}
