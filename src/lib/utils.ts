import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Validate a redirect URL is safe (relative path only, no open redirect). */
export function isSafeRedirect(url: string | null | undefined): url is string {
  if (!url) return false
  // Must start with / but not // (protocol-relative) and not contain ://
  return url.startsWith('/') && !url.startsWith('//') && !url.includes('://')
}
