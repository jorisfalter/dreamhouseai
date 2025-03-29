'use client'

import { useEffect } from 'react'
import posthog from 'posthog-js'
import { ReactNode } from 'react'

interface PostHogProviderProps {
  children: ReactNode
}

export default function PostHogProvider({ children }: PostHogProviderProps) {
  useEffect(() => {
    try {
      console.log('PostHog initialization starting...', {
        windowExists: typeof window !== 'undefined',
        hasPostHogKey: !!process.env.NEXT_PUBLIC_POSTHOG_KEY,
        postHogHost: process.env.NEXT_PUBLIC_POSTHOG_HOST,
        isDevelopment: process.env.NODE_ENV === 'development'
      })

      if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
        posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
          api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
          loaded: (posthog) => {
            console.log('PostHog loaded successfully')
            if (process.env.NODE_ENV === 'development') {
              posthog.debug()
              console.log('PostHog debug mode enabled')
            }
          },
          capture_pageview: true
        })

        // Test if PostHog is available globally
        console.log('PostHog global object available:', {
          isDefined: typeof window.posthog !== 'undefined',
          hasCapture: typeof window.posthog?.capture === 'function'
        })
      }
    } catch (error) {
      console.error('Error initializing PostHog:', error)
    }
  }, [])

  return <>{children}</>
}