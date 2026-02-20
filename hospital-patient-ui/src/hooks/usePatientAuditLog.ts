import { useQuery } from '@tanstack/react-query'
import { fetchAuditTrail } from '../api/patient-api'

export function useAuditTrail(patientId: string, enabled: boolean) {
  return useQuery({
    queryKey: ['patients', patientId, 'audit-trail'],
    queryFn: () => fetchAuditTrail(patientId),
    enabled: enabled && !!patientId,
    staleTime: 0,
  })
}
