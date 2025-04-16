This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

test locally:

npm run dev

## Deployed

On fly
vercel didn't work with the 10s api limit

Fly does not read from github, deployed straight from cursor with fly deploy

## Troubleshooting

## Scripts

npm run add-tags
npm run download-db

### PostHog Integration

If PostHog is not working in production, check the browser console for error logs. Common issues:

- CORS configuration
- API key misconfiguration
- Network connectivity issues
- Content Security Policy (CSP) blocking PostHog scripts

To enable detailed PostHog debugging, add `posthog.debug(true)` after initialization.

################################################
