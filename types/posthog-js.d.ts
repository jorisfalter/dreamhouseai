import posthog from "posthog-js";

declare global {
  interface Window {
    posthog?: typeof posthog;
  }
}
