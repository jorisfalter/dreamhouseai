import { useEffect } from 'react';
import type { AppProps } from 'next/app';
import '../styles/globals.css';
import { DM_Sans } from 'next/font/google';

// Initialize PostHog
if (typeof window !== 'undefined') {
  const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST;
  
  console.log('Environment check:', {
    isDevelopment: process.env.NODE_ENV === 'development',
    envKeys: Object.keys(process.env).filter(key => key.startsWith('NEXT_PUBLIC_')),
    posthogKeyLength: posthogKey?.length,
    posthogHost
  });

  // if (!posthogKey) {
  //   console.error('PostHog key is not set. Available env vars:', {
  //     hasKey: !!process.env.NEXT_PUBLIC_POSTHOG_KEY,
  //     hasHost: !!process.env.NEXT_PUBLIC_POSTHOG_HOST
  //   });
  // } else {
  //   try {
  //     posthog.init(
  //       posthogKey,
  //       {
  //         api_host: posthogHost || 'https://eu.i.posthog.com',
  //         loaded: (posthog) => {
  //           if (process.env.NODE_ENV === 'development') posthog.debug();
  //         },
  //         capture_pageview: false
  //       }
  //     );
  //   } catch (error) {
  //     console.error('Failed to initialize PostHog:', error);
  //   }
  // }
}

const dmSans = DM_Sans({
  weight: ['400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
});

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    // Track page views


    return () => {
      // Cleanup
    };
  }, []);

  return (
    <div className={dmSans.className}>
      <Component {...pageProps} />
    </div>
  );
} 