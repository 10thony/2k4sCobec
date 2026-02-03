import {
  HeadContent,
  Link,
  Outlet,
  Scripts,
  createRootRouteWithContext,
  useRouteContext,
  useLocation,
  useNavigate,
} from '@tanstack/react-router'
import * as React from 'react'
import { useEffect } from 'react'
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
import { useQuery, Authenticated, AuthLoading, Unauthenticated } from 'convex/react'
import { api } from '../../convex/_generated/api'
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

function AuthenticatedHeader() {
  const navigate = useNavigate()
  return (
    <header className="border-b border-border px-4 py-2 flex flex-wrap items-center justify-between gap-4 min-w-0">
      <nav className="flex flex-wrap items-center gap-3 min-w-0">
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
        <button
          type="button"
          onClick={() => navigate({ to: '/admin' })}
          className="text-muted-foreground hover:text-foreground transition-colors bg-transparent border-none cursor-pointer p-0 font-inherit text-inherit"
        >
          Admin
        </button>
      </nav>
      <UserButton afterSignOutUrl="/" />
    </header>
  )
}

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
            <AuthenticatedHeader />
            <Outlet />
          </Authenticated>
          <Unauthenticated>
            <UnauthenticatedContent />
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

function UnauthenticatedContent() {
  const authState = useQuery(api.componentAuth.getAuthState)
  const location = useLocation()
  const navigate = useNavigate()
  const pathname = location.pathname

  const defaultPublicRoute = authState?.defaultPublicRoute ?? null
  const publicRoutePaths = authState?.publicRoutePaths ?? []

  useEffect(() => {
    if (authState === undefined) return
    if (!defaultPublicRoute) return
    if (pathname === '/') {
      navigate({ to: defaultPublicRoute })
    } else if (!publicRoutePaths.includes(pathname)) {
      navigate({ to: defaultPublicRoute })
    }
  }, [authState, defaultPublicRoute, pathname, publicRoutePaths, navigate])

  if (authState === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading…</p>
      </div>
    )
  }

  if (defaultPublicRoute && publicRoutePaths.includes(pathname)) {
    return (
      <>
        <header className="border-b border-border px-4 py-2 flex flex-wrap items-center justify-between gap-4 min-w-0">
          <nav className="flex flex-wrap items-center gap-3 min-w-0">
            <Link
              to="/"
              className="font-medium text-foreground hover:text-primary transition-colors"
            >
              2k4sCobec
            </Link>
            <Link
              to={defaultPublicRoute}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Demo
            </Link>
          </nav>
          <SignInButton mode="modal">
            <button
              type="button"
              className="bg-primary text-primary-foreground text-sm px-4 py-2 rounded-md border border-border hover:opacity-90 transition-opacity"
            >
              Sign in
            </button>
          </SignInButton>
        </header>
        <Outlet />
      </>
    )
  }

  if (pathname === '/' && defaultPublicRoute) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Redirecting…</p>
      </div>
    )
  }

  return (
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
  )
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <HeadContent />
      </head>
      <body className="antialiased min-h-screen overflow-x-hidden">
        {children}
        <Scripts />
      </body>
    </html>
  )
}
