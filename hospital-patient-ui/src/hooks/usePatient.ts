import { useQuery } from '@tanstack/react-query'
import { fetchPatient } from '../api/patient-api'

export function usePatient(patientId: string) {
  return useQuery({
    queryKey: ['patients', patientId],
    queryFn: () => fetchPatient(patientId),
    enabled: !!patientId,
  })
}
