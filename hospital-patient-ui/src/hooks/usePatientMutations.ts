import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createPatient, updatePatient, updatePatientStatus } from '../api/patient-api'
import type { PatientFormData, PatientStatus } from '../types/patient.types'

export function useCreatePatient() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: PatientFormData) => createPatient(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] })
    },
  })
}

export function useUpdatePatient(patientId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: PatientFormData) => updatePatient(patientId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] })
      queryClient.invalidateQueries({ queryKey: ['patients', patientId] })
    },
  })
}

export function useUpdatePatientStatus(patientId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (status: PatientStatus) => updatePatientStatus(patientId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] })
      queryClient.invalidateQueries({ queryKey: ['patients', patientId] })
    },
  })
}
