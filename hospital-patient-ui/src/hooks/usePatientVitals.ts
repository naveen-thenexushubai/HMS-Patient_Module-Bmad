import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchVitals, recordVitals } from '../api/patient-api'
import type { PatientVitalsRequest } from '../types/patient.types'

export function useVitals(patientId: string) {
  return useQuery({
    queryKey: ['patients', patientId, 'vitals'],
    queryFn: () => fetchVitals(patientId),
    enabled: !!patientId,
    staleTime: 30_000,
  })
}

export function useRecordVitals(patientId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (req: PatientVitalsRequest) => recordVitals(patientId, req),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients', patientId, 'vitals'] })
    },
  })
}
