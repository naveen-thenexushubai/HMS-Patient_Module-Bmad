import { useState } from 'react'
import { Card, Table, Button, Tag, Popconfirm, notification, Empty } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import type { ColumnsType } from 'antd/es/table'
import { useRelationships, useRemoveRelationship } from '../hooks/usePatientRelationships'
import type { PatientRelationship } from '../types/patient.types'
import { buildPatientDetailPath } from '../constants/routes'
import { SUCCESS_NOTIFICATION_DURATION } from '../constants/config'
import { AddFamilyLinkModal } from './AddFamilyLinkModal'

const RELATIONSHIP_COLORS: Record<string, string> = {
  SPOUSE: 'red',
  PARENT: 'blue',
  CHILD: 'cyan',
  SIBLING: 'green',
  GUARDIAN: 'purple',
  WARD: 'gold',
  OTHER: 'default',
}

interface Props {
  patientId: string
  canEdit: boolean
}

export function FamilyRelationshipsCard({ patientId, canEdit }: Props) {
  const navigate = useNavigate()
  const [addOpen, setAddOpen] = useState(false)
  const { data: relationships = [], isLoading } = useRelationships(patientId)
  const removeMutation = useRemoveRelationship(patientId)

  function handleRemove(relatedId: string) {
    removeMutation.mutate(relatedId, {
      onSuccess: () => notification.success({ message: 'Relationship removed', duration: SUCCESS_NOTIFICATION_DURATION }),
      onError: () => notification.error({ message: 'Failed to remove relationship' }),
    })
  }

  const columns: ColumnsType<PatientRelationship> = [
    { title: 'Name', dataIndex: 'relatedPatientName', key: 'name' },
    { title: 'Patient ID', dataIndex: 'relatedPatientId', key: 'id' },
    {
      title: 'Relationship',
      dataIndex: 'relationshipType',
      render: (type: string) => (
        <Tag color={RELATIONSHIP_COLORS[type] ?? 'default'}>{type}</Tag>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, r) => (
        <Button.Group size="small">
          <Button type="link" onClick={() => navigate(buildPatientDetailPath(r.relatedPatientId))}>
            View
          </Button>
          {canEdit && (
            <Popconfirm
              title="Remove this relationship?"
              onConfirm={() => handleRemove(r.relatedPatientId)}
              okText="Remove"
              okButtonProps={{ danger: true }}
            >
              <Button danger loading={removeMutation.isPending}>Remove</Button>
            </Popconfirm>
          )}
        </Button.Group>
      ),
    },
  ]

  return (
    <>
      <Card
        title="Family & Relationships"
        size="small"
        extra={
          canEdit && (
            <Button size="small" icon={<PlusOutlined />} onClick={() => setAddOpen(true)}>
              Add Link
            </Button>
          )
        }
      >
        {relationships.length === 0 && !isLoading
          ? <Empty description="No relationships linked" image={Empty.PRESENTED_IMAGE_SIMPLE} />
          : (
            <Table
              dataSource={relationships}
              columns={columns}
              rowKey="relatedPatientId"
              pagination={false}
              loading={isLoading}
              size="small"
            />
          )
        }
      </Card>

      <AddFamilyLinkModal
        open={addOpen}
        patientId={patientId}
        onClose={() => setAddOpen(false)}
      />
    </>
  )
}
