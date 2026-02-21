import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchNotifications, fetchUnreadCount, markNotificationRead, markAllNotificationsRead,
} from '../api/patient-api'

export function useNotifications() {
  return useQuery({
    queryKey: ['portal', 'notifications'],
    queryFn: fetchNotifications,
    refetchInterval: 30_000,
    staleTime: 0,
  })
}

export function useUnreadCount() {
  return useQuery({
    queryKey: ['portal', 'notifications', 'unread'],
    queryFn: fetchUnreadCount,
    refetchInterval: 30_000,
    staleTime: 0,
  })
}

export function useMarkRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => markNotificationRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portal', 'notifications'] })
    },
  })
}

export function useMarkAllRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portal', 'notifications'] })
    },
  })
}
