import { Alert } from 'antd'
import { useCriticalAllergyCheck, useAllergies } from '../hooks/usePatientAllergies'

interface Props {
  patientId: string
}

export function CriticalAllergyAlert({ patientId }: Props) {
  const { data: hasCritical } = useCriticalAllergyCheck(patientId)
  const { data: allergies } = useAllergies(patientId)

  if (!hasCritical) return null

  const criticalNames = allergies
    ?.filter(a => a.severity === 'SEVERE' || a.severity === 'LIFE_THREATENING')
    .map(a => a.allergyName)
    .join(', ') ?? ''

  return (
    <Alert
      type="error"
      showIcon
      message="CRITICAL ALLERGY ALERT"
      description={`⚠️ ${criticalNames} — Exercise extreme caution before administering any medication or treatment.`}
      style={{ marginBottom: 16, fontWeight: 500 }}
      banner
    />
  )
}
