import { Badge } from 'antd'
import type { PatientStatus } from '../types/patient.types'

interface Props {
  status: PatientStatus
}

/**
 * WCAG 2.1 compliant — uses both color AND text label, never color alone.
 */
export function StatusBadge({ status }: Props) {
  return status === 'ACTIVE'
    ? <Badge status="success" text="Active" />
    : <Badge status="error"   text="Inactive" />
}
