'use client'

import * as React from 'react'
import { Check, ChevronsUpDown, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from '@/components/ui/command' // Requires Shadcn Command component installation
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface ProjectSwitcherProps {
    currentProjectId: number
    currentUser: any // Using specific type would be better if generated
}

export function ProjectSwitcher({ currentProjectId, currentUser }: ProjectSwitcherProps) {
    const [open, setOpen] = React.useState(false)
    const router = useRouter()
    // In a real app, we'd fetch projects here or pass them in. 
    // Since this is a client component inside a server layout, we can pass a list of projects from parent
    // OR fetch via server action/useEffect.
    // For MVP, assume we fetch simple list. 
    // I'll create a simple dummy list or fetch real data if I add a `fetchProjects` action.
    const [projects, setProjects] = React.useState<{ id: number, title: string }[]>([])

    // Simplification: We'll just show current project + "Go to Dashboard" for now 
    // unless I implement a fetcher. Let's do a quick fetcher hook or similar? 
    // No, cleaner to just link to dashboard or use a Server Action.

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between"
                >
                    <span className="truncate">Switch Project...</span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
                <div className="p-2">
                    <Link href="/dashboard" className="w-full">
                        <Button variant="ghost" className="w-full justify-start text-sm">
                            <LayoutDashboard className="mr-2 h-4 w-4" />
                            Back to Dashboard
                        </Button>
                    </Link>
                </div>
                {/* Full switcher implementation requires fetching logic using client-side data fetching */}
            </PopoverContent>
        </Popover>
    )
}

import { LayoutDashboard } from 'lucide-react'
