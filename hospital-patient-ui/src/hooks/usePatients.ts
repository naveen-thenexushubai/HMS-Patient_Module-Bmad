import { useQuery } from '@tanstack/react-query'
import { fetchPatients } from '../api/patient-api'
import type { PatientSearchParams } from '../types/patient.types'

export function usePatients(params: PatientSearchParams) {
  return useQuery({
    queryKey: ['patients', 'search', params],
    queryFn: () => fetchPatients(params),
    staleTime: 30_000,
  })
}
