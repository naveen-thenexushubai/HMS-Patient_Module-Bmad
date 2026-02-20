import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchRelationships, addRelationship, removeRelationship } from '../api/patient-api'
import type { AddRelationshipRequest } from '../types/patient.types'

export function useRelationships(patientId: string) {
  return useQuery({
    queryKey: ['patients', patientId, 'relationships'],
    queryFn: () => fetchRelationships(patientId),
    enabled: !!patientId,
    staleTime: 30_000,
  })
}

export function useAddRelationship(patientId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (req: AddRelationshipRequest) => addRelationship(patientId, req),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients', patientId, 'relationships'] })
    },
  })
}

export function useRemoveRelationship(patientId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (relatedPatientId: string) => removeRelationship(patientId, relatedPatientId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients', patientId, 'relationships'] })
    },
  })
}
