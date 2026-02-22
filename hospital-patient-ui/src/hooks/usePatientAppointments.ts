import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchAppointments, fetchUpcomingAppointments, fetchVisitHistory,
  bookAppointment, updateAppointment, cancelAppointment, fetchAllAppointments,
} from '../api/patient-api'
import type { AppointmentRequest, AppointmentUpdateRequest } from '../types/patient.types'
import type { GlobalAppointmentParams } from '../api/patient-api'

export function useAppointments(patientId: string) {
  return useQuery({
    queryKey: ['patients', patientId, 'appointments'],
    queryFn: () => fetchAppointments(patientId),
    enabled: !!patientId,
    staleTime: 30_000,
  })
}

export function useUpcomingAppointments(patientId: string) {
  return useQuery({
    queryKey: ['patients', patientId, 'appointments', 'upcoming'],
    queryFn: () => fetchUpcomingAppointments(patientId),
    enabled: !!patientId,
    staleTime: 30_000,
  })
}

export function useVisitHistory(patientId: string) {
  return useQuery({
    queryKey: ['patients', patientId, 'appointments', 'history'],
    queryFn: () => fetchVisitHistory(patientId),
    enabled: !!patientId,
    staleTime: 60_000,
  })
}

export function useAllAppointments(params: GlobalAppointmentParams) {
  return useQuery({
    queryKey: ['appointments', params],
    queryFn: () => fetchAllAppointments(params),
    staleTime: 30_000,
  })
}

export function useBookAppointment(patientId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (req: AppointmentRequest) => bookAppointment(patientId, req),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients', patientId, 'appointments'] })
      queryClient.invalidateQueries({ queryKey: ['appointments'] })
    },
  })
}

export function useUpdateAppointment(patientId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, req }: { id: number; req: AppointmentUpdateRequest }) =>
      updateAppointment(patientId, id, req),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients', patientId, 'appointments'] })
      queryClient.invalidateQueries({ queryKey: ['appointments'] })
    },
  })
}

export function useCancelAppointment(patientId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => cancelAppointment(patientId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients', patientId, 'appointments'] })
      queryClient.invalidateQueries({ queryKey: ['appointments'] })
    },
  })
}
