'use client'

import { useEffect } from 'react'

export default function PostHogTest() {
  useEffect(() => {
    const testPostHog = () => {
      try {
        if (typeof window.posthog !== 'undefined') {
          console.log('Testing PostHog capture...')
          window.posthog.capture('test_event', { source: 'PostHogTest component' })
          console.log('PostHog capture called successfully')
        } else {
          console.error('PostHog not available on window object')
        }
      } catch (error) {
        console.error('Error testing PostHog:', error)
      }
    }

    // Wait a bit to ensure PostHog is initialized
    setTimeout(testPostHog, 1000)
  }, [])

  return null
} 