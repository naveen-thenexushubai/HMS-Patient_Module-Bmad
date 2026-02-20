import { useMutation, useQueryClient } from '@tanstack/react-query'
import { uploadPatientPhoto, deletePatientPhoto } from '../api/patient-api'

export function useUploadPhoto(patientId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (file: File) => uploadPatientPhoto(patientId, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients', patientId] })
    },
  })
}

export function useDeletePhoto(patientId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => deletePatientPhoto(patientId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients', patientId] })
    },
  })
}
