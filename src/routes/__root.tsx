import {
  HeadContent,
  Link,
  Outlet,
  Scripts,
  createRootRouteWithContext,
  useRouteContext,
} from '@tanstack/react-router'
import * as React from 'react'
import type { QueryClient } from '@tanstack/react-query'
import type { ConvexReactClient } from 'convex/react'
import type { ConvexQueryClient } from '@convex-dev/react-query'
import {
  ClerkProvider,
  SignInButton,
  UserButton,
  useAuth,
} from '@clerk/tanstack-start'
import { ConvexProviderWithClerk } from 'convex/react-clerk'
import { Authenticated, AuthLoading, Unauthenticated } from 'convex/react'
import appCss from '~/styles/app.css?url'

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient
  convexClient: ConvexReactClient
  convexQueryClient: ConvexQueryClient
}>()({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'TanStack Start Starter',
      },
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      {
        rel: 'preconnect',
        href: 'https://fonts.googleapis.com',
      },
      {
        rel: 'preconnect',
        href: 'https://fonts.gstatic.com',
        crossOrigin: 'anonymous',
      },
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&display=swap',
      },
      {
        rel: 'apple-touch-icon',
        sizes: '180x180',
        href: '/apple-touch-icon.png',
      },
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '32x32',
        href: '/favicon-32x32.png',
      },
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '16x16',
        href: '/favicon-16x16.png',
      },
      { rel: 'manifest', href: '/site.webmanifest', color: '#fffff' },
      { rel: 'icon', href: '/favicon.ico' },
    ],
  }),
  notFoundComponent: () => <div>Route not found</div>,
  component: RootComponent,
})

function RootComponent() {
  const context = useRouteContext({ from: Route.id })
  const publishableKey = (import.meta as any).env.VITE_CLERK_PUBLISHABLE_KEY
  const frontendApi = (import.meta as any).env.VITE_CLERK_FRONTEND_API_URL

  if (!publishableKey) {
    return (
      <RootDocument>
        <div className="p-8 text-destructive">
          Missing VITE_CLERK_PUBLISHABLE_KEY. Add it to .env.local and restart.
        </div>
      </RootDocument>
    )
  }

  return (
    <ClerkProvider
      publishableKey={publishableKey}
      {...(frontendApi ? { frontendApi } : {})}
    >
      <ConvexProviderWithClerk
        client={context.convexClient}
        useAuth={useAuth}
      >
        <RootDocument>
          <Authenticated>
            <header className="border-b border-border px-4 py-2 flex items-center justify-between gap-4">
              <nav className="flex items-center gap-4">
                <Link
                  to="/"
                  className="font-medium text-foreground hover:text-primary transition-colors"
                >
                  2k4sCobec
                </Link>
                <Link
                  to="/foms"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  FOMS
                </Link>
                <Link
                  to="/foms/create"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  New request
                </Link>
              </nav>
              <UserButton afterSignOutUrl="/" />
            </header>
            <Outlet />
          </Authenticated>
          <Unauthenticated>
            <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-8">
              <h1 className="text-2xl font-semibold">Sign in to continue</h1>
              <SignInButton mode="modal">
                <button
                  type="button"
                  className="bg-primary text-primary-foreground px-4 py-2 rounded-md border border-border hover:opacity-90 transition-opacity"
                >
                  Sign in
                </button>
              </SignInButton>
            </div>
          </Unauthenticated>
          <AuthLoading>
            <div className="min-h-screen flex items-center justify-center">
              <p className="text-muted-foreground">Loading…</p>
            </div>
          </AuthLoading>
        </RootDocument>
      </ConvexProviderWithClerk>
    </ClerkProvider>
  )
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <HeadContent />
      </head>
      <body className="antialiased min-h-screen">
        {children}
        <Scripts />
      </body>
    </html>
  )
}
