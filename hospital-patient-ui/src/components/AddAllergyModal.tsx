import { useEffect } from 'react'
import { Modal, Form, Input, Select, DatePicker, notification } from 'antd'
import dayjs from 'dayjs'
import type { PatientAllergy, PatientAllergyRequest, AllergyType, AllergySeverity } from '../types/patient.types'
import { useAddAllergy, useUpdateAllergy } from '../hooks/usePatientAllergies'
import { SUCCESS_NOTIFICATION_DURATION } from '../constants/config'

interface Props {
  open: boolean
  patientId: string
  editing?: PatientAllergy | null
  onClose: () => void
}

const ALLERGY_TYPES: { label: string; value: AllergyType }[] = [
  { label: 'Drug', value: 'DRUG' },
  { label: 'Food', value: 'FOOD' },
  { label: 'Environmental', value: 'ENVIRONMENTAL' },
  { label: 'Other', value: 'OTHER' },
]

const SEVERITY_OPTIONS: { label: string; value: AllergySeverity; color: string }[] = [
  { label: 'Mild', value: 'MILD', color: 'green' },
  { label: 'Moderate', value: 'MODERATE', color: 'orange' },
  { label: 'Severe', value: 'SEVERE', color: 'red' },
  { label: 'Life Threatening', value: 'LIFE_THREATENING', color: 'red' },
]

export function AddAllergyModal({ open, patientId, editing, onClose }: Props) {
  const [form] = Form.useForm<PatientAllergyRequest & { onsetDate?: any }>()
  const addMutation    = useAddAllergy(patientId)
  const updateMutation = useUpdateAllergy(patientId)

  useEffect(() => {
    if (open) {
      if (editing) {
        form.setFieldsValue({
          ...editing,
          onsetDate: editing.onsetDate ? dayjs(editing.onsetDate) : undefined,
        })
      } else {
        form.resetFields()
      }
    }
  }, [open, editing, form])

  function handleSubmit(values: any) {
    const req: PatientAllergyRequest = {
      allergyName:  values.allergyName,
      allergyType:  values.allergyType,
      severity:     values.severity,
      reaction:     values.reaction,
      onsetDate:    values.onsetDate ? values.onsetDate.format('YYYY-MM-DD') : undefined,
      notes:        values.notes,
    }

    if (editing) {
      updateMutation.mutate({ id: editing.id, req }, {
        onSuccess: () => {
          notification.success({ message: 'Allergy updated', duration: SUCCESS_NOTIFICATION_DURATION })
          onClose()
        },
        onError: (err: any) => notification.error({ message: err?.title ?? 'Error', description: err?.detail }),
      })
    } else {
      addMutation.mutate(req, {
        onSuccess: () => {
          notification.success({ message: 'Allergy added', duration: SUCCESS_NOTIFICATION_DURATION })
          onClose()
        },
        onError: (err: any) => notification.error({ message: err?.title ?? 'Error', description: err?.detail }),
      })
    }
  }

  const isPending = addMutation.isPending || updateMutation.isPending

  return (
    <Modal
      open={open}
      title={editing ? 'Edit Allergy' : 'Add Allergy'}
      okText={editing ? 'Update' : 'Add'}
      onOk={() => form.submit()}
      onCancel={onClose}
      confirmLoading={isPending}
      destroyOnClose
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item name="allergyName" label="Allergy Name" rules={[{ required: true, message: 'Required' }]}>
          <Input placeholder="e.g. Penicillin, Peanuts" />
        </Form.Item>

        <Form.Item name="allergyType" label="Allergy Type" rules={[{ required: true, message: 'Required' }]}>
          <Select placeholder="Select type" options={ALLERGY_TYPES} />
        </Form.Item>

        <Form.Item name="severity" label="Severity" rules={[{ required: true, message: 'Required' }]}>
          <Select placeholder="Select severity">
            {SEVERITY_OPTIONS.map(o => (
              <Select.Option key={o.value} value={o.value}>
                <span style={{ color: o.color, fontWeight: o.value === 'LIFE_THREATENING' ? 700 : 400 }}>
                  {o.value === 'LIFE_THREATENING' ? '⚠️ ' : ''}{o.label}
                </span>
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item name="reaction" label="Reaction">
          <Input.TextArea rows={2} placeholder="Describe the reaction" maxLength={500} showCount />
        </Form.Item>

        <Form.Item name="onsetDate" label="Onset Date">
          <DatePicker style={{ width: '100%' }} disabledDate={d => d.isAfter(dayjs())} />
        </Form.Item>

        <Form.Item name="notes" label="Notes">
          <Input.TextArea rows={2} maxLength={1000} showCount />
        </Form.Item>
      </Form>
    </Modal>
  )
}
