import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchPortalMe, fetchPortalAppointments, fetchPortalAllergies, updatePortalContact,
} from '../api/patient-api'
import type { PortalContactUpdateRequest } from '../types/patient.types'

export function usePortalMe() {
  return useQuery({
    queryKey: ['portal', 'me'],
    queryFn: fetchPortalMe,
    staleTime: 60_000,
  })
}

export function usePortalAppointments() {
  return useQuery({
    queryKey: ['portal', 'appointments'],
    queryFn: fetchPortalAppointments,
    staleTime: 30_000,
  })
}

export function usePortalAllergies() {
  return useQuery({
    queryKey: ['portal', 'allergies'],
    queryFn: fetchPortalAllergies,
    staleTime: 30_000,
  })
}

export function useUpdatePortalContact() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (req: PortalContactUpdateRequest) => updatePortalContact(req),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portal', 'me'] })
    },
  })
}
