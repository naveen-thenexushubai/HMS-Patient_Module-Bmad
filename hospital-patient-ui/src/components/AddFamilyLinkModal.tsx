import { useState } from 'react'
import { Modal, Form, Input, Select, Button, notification, Alert } from 'antd'
import { useAddRelationship } from '../hooks/usePatientRelationships'
import { RELATIONSHIP_TYPES } from '../constants/config'
import { SUCCESS_NOTIFICATION_DURATION } from '../constants/config'
import type { RelationshipType } from '../types/patient.types'

interface FormValues {
  relatedPatientId: string
  relationshipType: RelationshipType
}

interface Props {
  open: boolean
  patientId: string
  onClose: () => void
}

export function AddFamilyLinkModal({ open, patientId, onClose }: Props) {
  const [form] = Form.useForm<FormValues>()
  const [apiError, setApiError] = useState<string | null>(null)
  const addMutation = useAddRelationship(patientId)

  function handleSubmit(values: FormValues) {
    setApiError(null)
    addMutation.mutate(values, {
      onSuccess: () => {
        notification.success({ message: 'Relationship added', duration: SUCCESS_NOTIFICATION_DURATION })
        form.resetFields()
        onClose()
      },
      onError: (err: any) => {
        setApiError(err?.detail ?? err?.message ?? 'Failed to add relationship')
      },
    })
  }

  function handleCancel() {
    form.resetFields()
    setApiError(null)
    onClose()
  }

  return (
    <Modal
      open={open}
      title="Add Family / Relationship Link"
      onCancel={handleCancel}
      footer={null}
      destroyOnClose
    >
      {apiError && <Alert type="error" message={apiError} style={{ marginBottom: 16 }} />}
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item
          name="relatedPatientId"
          label="Patient ID to Link"
          rules={[{ required: true, message: 'Enter the Patient ID of the person to link' }]}
        >
          <Input placeholder="e.g. P2026001" />
        </Form.Item>

        <Form.Item
          name="relationshipType"
          label="Relationship Type"
          rules={[{ required: true, message: 'Select relationship type' }]}
        >
          <Select placeholder="Select relationship">
            {RELATIONSHIP_TYPES.map(t => (
              <Select.Option key={t} value={t}>{t.charAt(0) + t.slice(1).toLowerCase()}</Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
          <Button onClick={handleCancel} style={{ marginRight: 8 }}>Cancel</Button>
          <Button type="primary" htmlType="submit" loading={addMutation.isPending}>
            Add Link
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  )
}
