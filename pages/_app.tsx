import { useEffect } from 'react';
import type { AppProps } from 'next/app';
import '../styles/globals.css';
import posthog from 'posthog-js';

// Initialize PostHog
if (typeof window !== 'undefined') {
  const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST;
  
  if (!posthogKey) {
    console.error('PostHog key is not set');
  } else {
    posthog.init(
      posthogKey,
      {
        api_host: posthogHost || 'https://eu.i.posthog.com',
        loaded: (posthog) => {
          if (process.env.NODE_ENV === 'development') posthog.debug();
        },
        capture_pageview: false
      }
    );
  }
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