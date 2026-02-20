import dayjs from 'dayjs'

export function calculateAge(dateOfBirth: string): number {
  if (!dateOfBirth) return 0
  return dayjs().diff(dayjs(dateOfBirth), 'year')
}

export function formatDate(isoString: string | undefined | null): string {
  if (!isoString) return '—'
  return dayjs(isoString).format('MMM D, YYYY')
}

export function formatDateTime(isoString: string | undefined | null): string {
  if (!isoString) return '—'
  return dayjs(isoString).format('MMM D, YYYY HH:mm UTC')
}
