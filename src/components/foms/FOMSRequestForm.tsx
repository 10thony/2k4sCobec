import { Link, useNavigate } from '@tanstack/react-router'
import { useMutation } from 'convex/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { api } from '../../../convex/_generated/api'
import type { Id } from '../../../convex/_generated/dataModel'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '~/components/ui/card'
import { cn } from '~/lib/utils'

const createFormSchema = z.object({
  requestorName: z.string().min(1, 'Requestor name is required'),
  requestorOrg: z.string().min(1, 'Requestor organization is required'),
  requestorPhone: z.string().min(1, 'Requestor phone is required'),
  facility: z.string().min(1, 'Facility is required'),
  description: z.string().min(1, 'Description is required'),
  requestedDatetime: z.string().min(1, 'Requested date and time is required'),
  contact: z.string().min(1, 'Contact is required'),
  pocPhone: z.string().min(1, 'POC phone is required'),
  dflCode: z.string().optional(),
  restoration: z.string().optional(),
  scheduled: z.string().optional(),
})

type CreateFormValues = z.infer<typeof createFormSchema>

const inputBase =
  'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm'

function Field({
  id,
  label,
  error,
  children,
  className,
}: {
  id: string
  label: string
  error?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('flex min-h-0 flex-col gap-1.5', className)}>
      <Label htmlFor={id} className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
        {label}
      </Label>
      {children}
      {error && (
        <p className="text-destructive text-xs" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

export function FOMSRequestForm() {
  const navigate = useNavigate()
  const createFomsRequest = useMutation(api.fomsRequests.createFomsRequest)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<CreateFormValues>({
    resolver: zodResolver(createFormSchema),
    defaultValues: {
      requestorName: '',
      requestorOrg: '',
      requestorPhone: '',
      facility: '',
      description: '',
      requestedDatetime: '',
      contact: '',
      pocPhone: '',
      dflCode: '',
      restoration: '',
      scheduled: '',
    },
  })

  async function onSubmit(values: CreateFormValues) {
    const requestedDatetimeMs = new Date(values.requestedDatetime).getTime()
    if (Number.isNaN(requestedDatetimeMs)) {
      setError('requestedDatetime', {
        message: 'Please enter a valid date and time',
      })
      return
    }
    try {
      const id: Id<'fomsRequests'> = await createFomsRequest({
        requestorName: values.requestorName,
        requestorOrg: values.requestorOrg,
        requestorPhone: values.requestorPhone,
        facility: values.facility,
        description: values.description,
        requestedDatetime: requestedDatetimeMs,
        contact: values.contact,
        pocPhone: values.pocPhone,
        ...(values.dflCode?.trim() && { dflCode: values.dflCode.trim() }),
        ...(values.restoration?.trim() && { restoration: values.restoration.trim() }),
        ...(values.scheduled?.trim() && { scheduled: values.scheduled.trim() }),
      })
      navigate({ to: '/foms/$requestId', params: { requestId: id } })
    } catch (err) {
      setError('root', {
        message: err instanceof Error ? err.message : 'Failed to create request',
      })
    }
  }

  return (
    <main className="flex min-h-[calc(100vh-2rem)] flex-col gap-6 p-6 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-semibold text-2xl tracking-tight">New FOMS Request</h1>
        <nav className="flex gap-4 text-sm">
          <Link to="/foms" className="text-muted-foreground underline hover:no-underline hover:text-foreground">
            FOMS list
          </Link>
          <Link to="/" className="text-muted-foreground underline hover:no-underline hover:text-foreground">
            Home
          </Link>
        </nav>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex min-h-0 flex-1 flex-col">
        <Card className="flex min-h-0 flex-1 flex-col border-border/80 bg-card/95 shadow-md">
          <CardHeader className="border-b border-border/60 pb-4">
            <CardTitle className="text-lg">Request details</CardTitle>
            <CardDescription>
              Required fields are marked. New requests get status Requested.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex min-h-0 flex-1 flex-col gap-0 overflow-auto py-6">
            {errors.root && (
              <p className="text-destructive mb-4 text-sm" role="alert">
                {errors.root.message}
              </p>
            )}

            {/* Grid: 3 cols lg, 2 cols md, 1 col default — aligned rows, dense spacing */}
            <div className="grid auto-rows-min gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-8 xl:gap-y-6">
              {/* Row 1: Requestor */}
              <Field id="requestorName" label="Requestor name *" error={errors.requestorName?.message}>
                <Input
                  id="requestorName"
                  {...register('requestorName')}
                  aria-invalid={!!errors.requestorName}
                  className="h-9"
                />
              </Field>
              <Field id="requestorOrg" label="Requestor organization *" error={errors.requestorOrg?.message}>
                <Input
                  id="requestorOrg"
                  {...register('requestorOrg')}
                  aria-invalid={!!errors.requestorOrg}
                  className="h-9"
                />
              </Field>
              <Field id="requestorPhone" label="Requestor phone *" error={errors.requestorPhone?.message}>
                <Input
                  id="requestorPhone"
                  type="tel"
                  {...register('requestorPhone')}
                  aria-invalid={!!errors.requestorPhone}
                  className="h-9"
                />
              </Field>

              {/* Row 2: Facility, Contact, POC */}
              <Field id="facility" label="Facility *" error={errors.facility?.message}>
                <Input
                  id="facility"
                  {...register('facility')}
                  aria-invalid={!!errors.facility}
                  className="h-9"
                />
              </Field>
              <Field id="contact" label="Contact name *" error={errors.contact?.message}>
                <Input
                  id="contact"
                  {...register('contact')}
                  aria-invalid={!!errors.contact}
                  className="h-9"
                />
              </Field>
              <Field id="pocPhone" label="POC phone *" error={errors.pocPhone?.message}>
                <Input
                  id="pocPhone"
                  type="tel"
                  {...register('pocPhone')}
                  aria-invalid={!!errors.pocPhone}
                  className="h-9"
                />
              </Field>

              {/* Row 3: Requested date/time + Optional row (same row on wide screens) */}
              <Field id="requestedDatetime" label="Requested date and time *" error={errors.requestedDatetime?.message}>
                <Input
                  id="requestedDatetime"
                  type="datetime-local"
                  {...register('requestedDatetime')}
                  aria-invalid={!!errors.requestedDatetime}
                  className="h-9"
                />
              </Field>
              <Field id="dflCode" label="DFL code (optional)">
                <Input id="dflCode" {...register('dflCode')} className="h-9" />
              </Field>
              <Field id="restoration" label="Restoration (optional)">
                <Input id="restoration" {...register('restoration')} className="h-9" />
              </Field>
              <Field id="scheduled" label="Scheduled (optional)" className="sm:col-span-2 lg:col-span-1">
                <Input id="scheduled" {...register('scheduled')} className="h-9" />
              </Field>

              {/* Row 4: Description — full width */}
              <Field
                id="description"
                label="Description *"
                error={errors.description?.message}
                className="sm:col-span-2 lg:col-span-3"
              >
                <textarea
                  id="description"
                  className={cn(
                    inputBase,
                    'min-h-[120px] resize-y',
                    errors.description && 'border-destructive'
                  )}
                  {...register('description')}
                  aria-invalid={!!errors.description}
                />
              </Field>
            </div>
          </CardContent>
          <CardFooter className="flex flex-wrap items-center gap-3 border-t border-border/60 pt-4">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating…' : 'Create request'}
            </Button>
            <Button type="button" variant="outline" asChild>
              <Link to="/foms">Cancel</Link>
            </Button>
          </CardFooter>
        </Card>
      </form>
    </main>
  )
}
