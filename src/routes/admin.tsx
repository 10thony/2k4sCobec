import { Link, createFileRoute } from '@tanstack/react-router'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { MANAGABLE_ROUTES } from '~/lib/manageableRoutes'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Switch } from '~/components/ui/switch'
import { Label } from '~/components/ui/label'
import { cn } from '~/lib/utils'

export const Route = createFileRoute('/admin')({
  component: AdminPage,
})

function AdminPage() {
  const settings = useQuery(api.componentAuth.listSettings)
  const setRequireAuth = useMutation(api.componentAuth.setRequireAuth)
  const authState = useQuery(api.componentAuth.getAuthState)

  const settingsByPath = new Map(
    (settings ?? []).map((s) => [s.routePath, s.requireAuth])
  )

  const requireAuth = (path: string) => settingsByPath.get(path) ?? true

  const handleToggle = (path: string, checked: boolean) => {
    void setRequireAuth({ routePath: path, requireAuth: !checked })
  }

  const defaultPublicRoute = authState?.defaultPublicRoute ?? null

  return (
    <main className="min-h-screen p-6 md:p-8">
      <div className="mx-auto max-w-2xl space-y-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
            Auth settings
          </h1>
          <p className="text-sm text-muted-foreground">
            Toggle auth requirement per component for demo days. When exactly one
            component is public, it becomes the default home for unauthenticated
            users.
          </p>
        </div>

        {defaultPublicRoute && (
          <Card className="border-primary/30 bg-primary/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Demo mode</CardTitle>
              <CardDescription>
                Default public route: <code className="rounded bg-muted px-1.5 py-0.5 text-foreground">{defaultPublicRoute}</code>.
                Unauthenticated users will land here.
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Components</CardTitle>
            <CardDescription>
              Require auth = on: users must sign in. Off: component is public.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {MANAGABLE_ROUTES.map(({ path, label }) => {
              const needsAuth = requireAuth(path)
              return (
                <div
                  key={path}
                  className={cn(
                    'flex flex-wrap items-center justify-between gap-4 rounded-lg border p-4',
                    'border-border bg-card transition-colors',
                    !needsAuth && 'border-primary/40 bg-primary/5'
                  )}
                >
                  <div className="space-y-0.5">
                    <Label htmlFor={`switch-${path}`} className="text-base font-medium">
                      {label}
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      <code>{path}</code>
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        'text-xs font-medium',
                        needsAuth ? 'text-muted-foreground' : 'text-primary'
                      )}
                    >
                      {needsAuth ? 'Auth required' : 'Public'}
                    </span>
                    <Switch
                      id={`switch-${path}`}
                      checked={!needsAuth}
                      onCheckedChange={(checked) => handleToggle(path, checked)}
                      aria-label={`${label}: ${needsAuth ? 'require auth' : 'public'}`}
                    />
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>

        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link to="/">Back to home</Link>
          </Button>
          <Button variant="secondary" asChild>
            <Link to="/foms">FOMS</Link>
          </Button>
        </div>
      </div>
    </main>
  )
}
