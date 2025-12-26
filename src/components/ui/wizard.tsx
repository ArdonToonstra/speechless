'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface WizardProps {
    steps: {
        title: string
        description?: string
        content: React.ReactNode
        isValid: boolean
    }[]
    onComplete: () => void
    isSubmitting?: boolean
}

export function Wizard({ steps, onComplete, isSubmitting = false }: WizardProps) {
    const [currentStep, setCurrentStep] = useState(0)
    const totalSteps = steps.length

    const handleNext = () => {
        if (currentStep < totalSteps - 1) {
            setCurrentStep((prev) => prev + 1)
        } else {
            onComplete()
        }
    }

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep((prev) => prev - 1)
        }
    }

    return (
        <div className="w-full max-w-2xl mx-auto p-6 md:p-8 rounded-3xl bg-white shadow-xl min-h-[500px] flex flex-col relative overflow-hidden">
            {/* Progress Bar */}
            <div className="absolute top-0 left-0 w-full h-1 bg-secondary">
                <motion.div
                    className="h-full bg-primary"
                    initial={{ width: 0 }}
                    animate={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
                    transition={{ duration: 0.3 }}
                />
            </div>

            {/* Header */}
            <div className="mb-8 mt-4 text-center">
                <motion.h2
                    key={steps[currentStep].title}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-2xl font-serif text-slate-900 mb-2"
                >
                    {steps[currentStep].title}
                </motion.h2>
                {steps[currentStep].description && (
                    <p className="text-slate-500 text-sm">{steps[currentStep].description}</p>
                )}
            </div>

            {/* Content Area */}
            <div className="flex-1 relative">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentStep}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                        className="h-full"
                    >
                        {steps[currentStep].content}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Footer / Navigation */}
            <div className="mt-8 flex justify-between items-center">
                <Button
                    variant="ghost"
                    onClick={handleBack}
                    disabled={currentStep === 0 || isSubmitting}
                    className="text-slate-400 hover:text-slate-600"
                >
                    Back
                </Button>
                <Button
                    onClick={handleNext}
                    disabled={!steps[currentStep].isValid || isSubmitting}
                    className={cn(
                        "min-w-[120px] rounded-full transition-all duration-300",
                        currentStep === totalSteps - 1 ? "bg-celebration hover:opacity-90 text-celebration-foreground font-semibold" : "bg-primary text-primary-foreground hover:opacity-90"
                    )}
                >
                    {isSubmitting ? (
                        <span className="animate-pulse">Loading...</span>
                    ) : currentStep === totalSteps - 1 ? (
                        'Create Project'
                    ) : (
                        'Continue'
                    )}
                </Button>
            </div>
        </div>
    )
}
