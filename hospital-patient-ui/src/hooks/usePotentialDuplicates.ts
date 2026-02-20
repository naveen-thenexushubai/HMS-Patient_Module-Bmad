import { useQuery } from '@tanstack/react-query'
import { fetchPotentialDuplicates } from '../api/patient-api'

export function usePotentialDuplicates(patientId: string) {
  return useQuery({
    queryKey: ['patients', patientId, 'potential-duplicates'],
    queryFn: () => fetchPotentialDuplicates(patientId),
    enabled: !!patientId,
    staleTime: 60_000,
  })
}
