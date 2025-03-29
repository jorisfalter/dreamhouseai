import posthog from "posthog-js";

export function initPostHog() {
  try {
    // Enable debug mode in production
    if (process.env.NODE_ENV === "production") {
      posthog.debug(true);
    }

    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY || "", {
      api_host:
        process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://app.posthog.com",
      loaded: (posthog) => {
        console.log("PostHog loaded successfully");
      },
      capture_pageview: false, // We'll handle this manually
      autocapture: true,
      persistence: "localStorage",
      bootstrap: {
        distinctID: "debug-session-" + Date.now(),
      },
    });

    // Test capture to verify connection
    posthog.capture("posthog_initialization_test", {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
    });
  } catch (error) {
    console.error("PostHog initialization failed:", error);
    console.error("PostHog environment variables:", {
      apiKey: process.env.NEXT_PUBLIC_POSTHOG_KEY ? "Set" : "Not set",
      apiHost: process.env.NEXT_PUBLIC_POSTHOG_HOST || "Not set",
    });
  }
}

export function captureEvent(
  eventName: string,
  properties?: Record<string, any>
) {
  try {
    posthog.capture(eventName, {
      ...properties,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
    });
  } catch (error) {
    console.error(`Failed to capture event ${eventName}:`, error);
  }
}
