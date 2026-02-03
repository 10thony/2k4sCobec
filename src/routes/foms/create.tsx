import { createFileRoute } from '@tanstack/react-router'
import { FOMSRequestForm } from '~/components/foms/FOMSRequestForm'

export const Route = createFileRoute('/foms/create')({
  component: FOMSRequestForm,
})
