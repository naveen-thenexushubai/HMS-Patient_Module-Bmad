/**
 * Decodes the JWT from localStorage and returns current user context.
 * Role is used throughout the app for permission-gated UI elements.
 */
export interface CurrentUser {
  userId: string
  username: string
  role: 'RECEPTIONIST' | 'DOCTOR' | 'NURSE' | 'ADMIN'
}

function decodeJwtPayload(token: string): Record<string, unknown> {
  try {
    const payload = token.split('.')[1]
    return JSON.parse(atob(payload))
  } catch {
    return {}
  }
}

export function useCurrentUser(): CurrentUser | null {
  const token = localStorage.getItem('token')
  if (!token) return null

  const payload = decodeJwtPayload(token)
  const userId   = payload['sub']      as string | undefined
  const username = payload['username'] as string | undefined
  const role     = payload['role']     as CurrentUser['role'] | undefined

  if (!userId || !username || !role) return null
  return { userId, username, role }
}

export function canEditPatient(user: CurrentUser | null): boolean {
  return user?.role === 'RECEPTIONIST' || user?.role === 'ADMIN'
}

export function canManageStatus(user: CurrentUser | null): boolean {
  return user?.role === 'ADMIN'
}

export function canRecordVitals(user: CurrentUser | null): boolean {
  return user?.role === 'DOCTOR' || user?.role === 'NURSE' || user?.role === 'ADMIN'
}

export function canViewAuditTrail(user: CurrentUser | null): boolean {
  return user?.role === 'ADMIN'
}
