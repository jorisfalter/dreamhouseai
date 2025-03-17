import { useEffect } from 'react';
import type { AppProps } from 'next/app';
import '../styles/globals.css';
import posthog from 'posthog-js';

// Initialize PostHog
if (typeof window !== 'undefined') {
  posthog.init(
    process.env.NEXT_PUBLIC_POSTHOG_KEY!, // Make sure to add this to your .env
    {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
      loaded: (posthog) => {
        if (process.env.NODE_ENV === 'development') posthog.debug();
      },
      capture_pageview: false // Handle pageviews manually
    }
  );
}

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    // Track page views
    const handleRouteChange = () => {
      posthog.capture('$pageview');
    };

    handleRouteChange(); // Track initial pageview

    return () => {
      // Cleanup
    };
  }, []);

  return <Component {...pageProps} />;
} 