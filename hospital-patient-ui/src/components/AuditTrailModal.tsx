import { Modal, Table, Tag, Button } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { useAuditTrail } from '../hooks/usePatientAuditLog'
import type { AuditEntry } from '../types/patient.types'

interface Props {
  open: boolean
  patientId: string
  onClose: () => void
}

const ACTION_COLORS: Record<string, string> = {
  CREATE:           'green',
  READ:             'default',
  UPDATE:           'blue',
  DEACTIVATE:       'orange',
  ACTIVATE:         'green',
  PHOTO_UPLOAD:     'purple',
  PHOTO_DELETE:     'red',
  LINK_FAMILY:      'cyan',
  UNLINK_FAMILY:    'volcano',
  INSURANCE_ADD:    'geekblue',
  INSURANCE_UPDATE: 'blue',
  INSURANCE_REMOVE: 'red',
  VITALS_RECORD:    'lime',
  CSV_EXPORT:       'gold',
}

export function AuditTrailModal({ open, patientId, onClose }: Props) {
  const { data: entries = [], isLoading } = useAuditTrail(patientId, open)

  const columns: ColumnsType<AuditEntry> = [
    {
      title: 'Date / Time',
      dataIndex: 'occurredAt',
      key: 'date',
      width: 180,
      render: (v: string) => new Date(v).toLocaleString(),
    },
    { title: 'User', dataIndex: 'username', key: 'user', width: 130 },
    { title: 'Role', dataIndex: 'userRole', key: 'role', width: 120 },
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      width: 150,
      render: (a: string) => <Tag color={ACTION_COLORS[a] ?? 'default'}>{a}</Tag>,
    },
    {
      title: 'IP Address',
      dataIndex: 'ipAddress',
      key: 'ip',
      render: (v?: string) => v ?? '—',
    },
  ]

  return (
    <Modal
      open={open}
      title={`Audit Trail — ${patientId}`}
      onCancel={onClose}
      footer={<Button onClick={onClose}>Close</Button>}
      width={900}
    >
      <Table
        dataSource={entries}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        pagination={{ pageSize: 20 }}
        size="small"
        locale={{ emptyText: 'No audit entries found' }}
      />
    </Modal>
  )
}
