import { useState } from 'react'
import { Card, Table, Tag, Button, Space, Popconfirm, notification } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import type { PatientAllergy, AllergySeverity } from '../types/patient.types'
import { useAllergies, useDeleteAllergy } from '../hooks/usePatientAllergies'
import { AddAllergyModal } from './AddAllergyModal'
import { SUCCESS_NOTIFICATION_DURATION } from '../constants/config'

interface Props {
  patientId: string
  canManage: boolean
}

const SEVERITY_COLOR: Record<AllergySeverity, string> = {
  MILD: 'green',
  MODERATE: 'orange',
  SEVERE: 'red',
  LIFE_THREATENING: 'red',
}

const SEVERITY_LABEL: Record<AllergySeverity, string> = {
  MILD: 'Mild',
  MODERATE: 'Moderate',
  SEVERE: 'Severe',
  LIFE_THREATENING: '⚠️ Life Threatening',
}

export function AllergyCard({ patientId, canManage }: Props) {
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<PatientAllergy | null>(null)

  const { data: allergies, isLoading } = useAllergies(patientId)
  const deleteMutation = useDeleteAllergy(patientId)

  function handleDelete(id: number) {
    deleteMutation.mutate(id, {
      onSuccess: () => notification.success({ message: 'Allergy removed', duration: SUCCESS_NOTIFICATION_DURATION }),
      onError: (err: any) => notification.error({ message: err?.title ?? 'Error', description: err?.detail }),
    })
  }

  function openEdit(allergy: PatientAllergy) {
    setEditing(allergy)
    setModalOpen(true)
  }

  function handleClose() {
    setEditing(null)
    setModalOpen(false)
  }

  const columns: ColumnsType<PatientAllergy> = [
    {
      title: 'Allergy Name',
      dataIndex: 'allergyName',
      render: (name, r) => (
        <span style={{ fontWeight: r.severity === 'LIFE_THREATENING' ? 700 : 400 }}>{name}</span>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'allergyType',
      render: (t: string) => t.charAt(0) + t.slice(1).toLowerCase().replace('_', ' '),
    },
    {
      title: 'Severity',
      dataIndex: 'severity',
      render: (s: AllergySeverity) => (
        <Tag color={SEVERITY_COLOR[s]} style={{ fontWeight: s === 'LIFE_THREATENING' ? 700 : 400 }}>
          {SEVERITY_LABEL[s]}
        </Tag>
      ),
    },
    {
      title: 'Reaction',
      dataIndex: 'reaction',
      render: (v?: string) => v ?? '—',
      ellipsis: true,
    },
    {
      title: 'Onset Date',
      dataIndex: 'onsetDate',
      render: (v?: string) => v ?? '—',
    },
    ...(canManage ? [{
      title: 'Actions',
      key: 'actions',
      render: (_: any, r: PatientAllergy) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(r)} />
          <Popconfirm
            title="Remove this allergy?"
            onConfirm={() => handleDelete(r.id)}
            okText="Remove"
            okButtonProps={{ danger: true }}
          >
            <Button size="small" icon={<DeleteOutlined />} danger />
          </Popconfirm>
        </Space>
      ),
    }] : []),
  ]

  return (
    <>
      <Card
        title="Allergies"
        size="small"
        extra={canManage && (
          <Button size="small" type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>
            Add Allergy
          </Button>
        )}
      >
        <Table
          dataSource={allergies ?? []}
          columns={columns}
          rowKey="id"
          loading={isLoading}
          pagination={false}
          size="small"
          locale={{ emptyText: 'No allergies on record' }}
        />
      </Card>

      <AddAllergyModal
        open={modalOpen}
        patientId={patientId}
        editing={editing}
        onClose={handleClose}
      />
    </>
  )
}
