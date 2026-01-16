'use client'

/**
 * Provider component for authentication context
 * Better Auth handles session management automatically via cookies
 * 
 * Usage:
 * ```tsx
 * <AuthProvider>
 *   <YourAuthenticatedContent />
 * </AuthProvider>
 * ```
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Better Auth handles session refresh automatically
  return <>{children}</>
}
