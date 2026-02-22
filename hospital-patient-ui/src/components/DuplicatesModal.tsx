import { Modal, Table, Button, Tag } from 'antd'
import { useNavigate } from 'react-router-dom'
import type { PatientSummary } from '../types/patient.types'
import { StatusBadge } from './StatusBadge'
import { buildPatientDetailPath } from '../constants/routes'
import type { ColumnsType } from 'antd/es/table'

interface Props {
  open: boolean
  currentPatientId: string
  duplicates: PatientSummary[]
  onClose: () => void
}

const CONFIDENCE_COLOR: Record<string, string> = {
  HIGH:   'red',
  MEDIUM: 'orange',
  LOW:    'gold',
}

export function DuplicatesModal({ open, currentPatientId, duplicates, onClose }: Props) {
  const navigate = useNavigate()

  const columns: ColumnsType<PatientSummary> = [
    {
      title: 'Patient ID',
      dataIndex: 'patientId',
      render: (id: string) => (
        <span>
          {id}
          {id === currentPatientId && <Tag color="blue" style={{ marginLeft: 4 }}>Current</Tag>}
        </span>
      ),
    },
    { title: 'MRN', dataIndex: 'mrn', render: (v?: string) => v ?? '—' },
    { title: 'Name', key: 'name', render: (_, r) => `${r.firstName} ${r.lastName}` },
    { title: 'Age', dataIndex: 'age' },
    { title: 'Phone', dataIndex: 'phoneNumber' },
    { title: 'Status', dataIndex: 'status', render: (s) => <StatusBadge status={s} /> },
    {
      title: 'Match',
      key: 'match',
      render: (_, r) => r.matchConfidence ? (
        <div>
          <Tag color={CONFIDENCE_COLOR[r.matchConfidence]}>{r.matchConfidence}</Tag>
          {r.matchReason && <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>{r.matchReason}</div>}
        </div>
      ) : null,
    },
    {
      title: 'Action',
      render: (_, r) => (
        <Button
          size="small"
          type="link"
          onClick={() => { onClose(); navigate(buildPatientDetailPath(r.patientId)) }}
        >
          View Profile
        </Button>
      ),
    },
  ]

  return (
    <Modal
      open={open}
      title="Potential Duplicate Patients"
      onCancel={onClose}
      footer={<Button onClick={onClose}>Close</Button>}
      width={1000}
    >
      <p style={{ color: '#595959', marginBottom: 16 }}>
        The following patients may be duplicates. Confidence levels: <Tag color="red">HIGH</Tag> phone match,{' '}
        <Tag color="orange">MEDIUM</Tag> phonetic name + birth year, <Tag color="gold">LOW</Tag> exact name + birth year.
      </p>
      <Table
        dataSource={duplicates}
        columns={columns}
        rowKey="patientId"
        pagination={false}
        size="small"
      />
    </Modal>
  )
}
