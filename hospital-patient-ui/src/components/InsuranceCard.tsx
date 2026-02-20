import { useState } from 'react'
import { Card, Table, Button, Tag, Popconfirm, Empty, notification, Space } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { useInsurance, useDeleteInsurance } from '../hooks/usePatientInsurance'
import type { PatientInsurance } from '../types/patient.types'
import { AddInsuranceModal } from './AddInsuranceModal'
import { SUCCESS_NOTIFICATION_DURATION } from '../constants/config'

interface Props {
  patientId: string
  canEdit: boolean
}

export function InsuranceCard({ patientId, canEdit }: Props) {
  const [addOpen, setAddOpen] = useState(false)
  const [editRecord, setEditRecord] = useState<PatientInsurance | null>(null)
  const { data: records = [], isLoading } = useInsurance(patientId)
  const deleteMutation = useDeleteInsurance(patientId)

  function handleDelete(id: number) {
    deleteMutation.mutate(id, {
      onSuccess: () => notification.success({ message: 'Insurance record removed', duration: SUCCESS_NOTIFICATION_DURATION }),
      onError: () => notification.error({ message: 'Delete failed' }),
    })
  }

  const columns: ColumnsType<PatientInsurance> = [
    {
      title: 'Provider',
      dataIndex: 'providerName',
      key: 'provider',
    },
    {
      title: 'Coverage',
      dataIndex: 'coverageType',
      key: 'coverage',
      render: (v?: string) => v ?? '—',
    },
    {
      title: 'Policy #',
      dataIndex: 'policyNumber',
      key: 'policy',
      render: (v?: string) => v ?? '—',
    },
    {
      title: 'Group #',
      dataIndex: 'groupNumber',
      key: 'group',
      render: (v?: string) => v ?? '—',
    },
    {
      title: 'Valid Through',
      dataIndex: 'validTo',
      key: 'validTo',
      render: (v?: string) => v ?? '—',
    },
    {
      title: 'Primary',
      dataIndex: 'isPrimary',
      key: 'primary',
      render: (v: boolean) => v ? <Tag color="green">Primary</Tag> : <Tag>Secondary</Tag>,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => canEdit ? (
        <Space size="small">
          <Button size="small" type="link" onClick={() => { setEditRecord(record); setAddOpen(true) }}>
            Edit
          </Button>
          <Popconfirm
            title="Remove this insurance record?"
            onConfirm={() => handleDelete(record.id)}
            okText="Remove"
            okButtonProps={{ danger: true }}
          >
            <Button size="small" danger loading={deleteMutation.isPending}>Remove</Button>
          </Popconfirm>
        </Space>
      ) : null,
    },
  ]

  return (
    <>
      <Card
        title="Insurance Information"
        size="small"
        extra={
          canEdit && (
            <Button size="small" icon={<PlusOutlined />} onClick={() => { setEditRecord(null); setAddOpen(true) }}>
              Add Insurance
            </Button>
          )
        }
      >
        {records.length === 0 && !isLoading
          ? <Empty description="No insurance records" image={Empty.PRESENTED_IMAGE_SIMPLE} />
          : (
            <Table
              dataSource={records}
              columns={columns}
              rowKey="id"
              pagination={false}
              size="small"
              loading={isLoading}
            />
          )
        }
      </Card>

      <AddInsuranceModal
        open={addOpen}
        patientId={patientId}
        editRecord={editRecord}
        onClose={() => { setAddOpen(false); setEditRecord(null) }}
      />
    </>
  )
}
