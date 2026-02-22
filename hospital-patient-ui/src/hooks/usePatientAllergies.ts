import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchAllergies, checkCriticalAllergy, addAllergy, updateAllergy, deleteAllergy,
} from '../api/patient-api'
import type { PatientAllergyRequest } from '../types/patient.types'

export function useAllergies(patientId: string) {
  return useQuery({
    queryKey: ['patients', patientId, 'allergies'],
    queryFn: () => fetchAllergies(patientId),
    enabled: !!patientId,
    staleTime: 30_000,
  })
}

export function useCriticalAllergyCheck(patientId: string) {
  return useQuery({
    queryKey: ['patients', patientId, 'allergies', 'critical'],
    queryFn: () => checkCriticalAllergy(patientId),
    enabled: !!patientId,
    staleTime: 30_000,
  })
}

export function useAddAllergy(patientId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (req: PatientAllergyRequest) => addAllergy(patientId, req),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients', patientId, 'allergies'] })
    },
  })
}

export function useUpdateAllergy(patientId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, req }: { id: number; req: PatientAllergyRequest }) =>
      updateAllergy(patientId, id, req),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients', patientId, 'allergies'] })
    },
  })
}

export function useDeleteAllergy(patientId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deleteAllergy(patientId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients', patientId, 'allergies'] })
    },
  })
}
