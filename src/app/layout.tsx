import { useEffect } from 'react'
import posthog from 'posthog-js'
import { ReactNode } from 'react'

console.log('PostHog Config:', {
  key: process.env.NEXT_PUBLIC_POSTHOG_KEY?.slice(0, 5) + '...',
  host: process.env.NEXT_PUBLIC_POSTHOG_HOST
})

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  useEffect(() => {
    if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
      posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
        api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
        loaded: (posthog) => {
          if (process.env.NODE_ENV === 'development') posthog.debug()
        },
        capture_pageview: true
      })
    }
  }, [])

  return <>{children}</>
} 