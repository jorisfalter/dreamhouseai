import PostHogProvider from '../components/PostHogProvider'
import PostHogTest from '../components/PostHogTest'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <PostHogProvider>
          <PostHogTest />
          {children}
        </PostHogProvider>
      </body>
    </html>
  )
}