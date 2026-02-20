import { useState } from 'react'
import { Alert, Button } from 'antd'
import { WarningOutlined } from '@ant-design/icons'
import { usePotentialDuplicates } from '../hooks/usePotentialDuplicates'
import { DuplicatesModal } from './DuplicatesModal'

interface Props {
  patientId: string
}

export function DuplicatesAlert({ patientId }: Props) {
  const [modalOpen, setModalOpen] = useState(false)
  const { data: duplicates } = usePotentialDuplicates(patientId)

  if (!duplicates || duplicates.length === 0) return null

  return (
    <>
      <Alert
        type="warning"
        icon={<WarningOutlined />}
        message={`${duplicates.length} possible duplicate patient${duplicates.length > 1 ? 's' : ''} detected`}
        description="Another patient record shares the same phone number or name and date of birth. Please review to avoid duplicate records."
        showIcon
        action={
          <Button size="small" onClick={() => setModalOpen(true)}>
            View Duplicates
          </Button>
        }
        style={{ marginBottom: 16 }}
      />
      <DuplicatesModal
        open={modalOpen}
        currentPatientId={patientId}
        duplicates={duplicates}
        onClose={() => setModalOpen(false)}
      />
    </>
  )
}
