import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchInsurance, addInsurance, updateInsurance, deleteInsurance } from '../api/patient-api'
import type { PatientInsuranceRequest } from '../types/patient.types'

export function useInsurance(patientId: string) {
  return useQuery({
    queryKey: ['patients', patientId, 'insurance'],
    queryFn: () => fetchInsurance(patientId),
    enabled: !!patientId,
    staleTime: 30_000,
  })
}

export function useAddInsurance(patientId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (req: PatientInsuranceRequest) => addInsurance(patientId, req),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients', patientId, 'insurance'] })
    },
  })
}

export function useUpdateInsurance(patientId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, req }: { id: number; req: PatientInsuranceRequest }) =>
      updateInsurance(patientId, id, req),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients', patientId, 'insurance'] })
    },
  })
}

export function useDeleteInsurance(patientId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deleteInsurance(patientId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients', patientId, 'insurance'] })
    },
  })
}
