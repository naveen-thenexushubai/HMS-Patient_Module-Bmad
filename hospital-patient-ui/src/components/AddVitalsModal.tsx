import { Form, InputNumber, Row, Col, Modal, Input, Typography, notification } from 'antd'
import { useRecordVitals } from '../hooks/usePatientVitals'
import type { PatientVitalsRequest } from '../types/patient.types'
import { SUCCESS_NOTIFICATION_DURATION } from '../constants/config'

interface Props {
  open: boolean
  patientId: string
  onClose: () => void
}

export function AddVitalsModal({ open, patientId, onClose }: Props) {
  const [form] = Form.useForm()
  const mutation = useRecordVitals(patientId)

  const weight = Form.useWatch('weightKg', form)
  const height = Form.useWatch('heightCm', form)
  const bmi = (weight && height && height > 0)
    ? (weight / ((height / 100) ** 2)).toFixed(1)
    : null

  function handleOk() {
    form.validateFields().then(values => {
      const req: PatientVitalsRequest = {
        temperatureCelsius:      values.temperatureCelsius,
        pulseRate:               values.pulseRate,
        bloodPressureSystolic:   values.bloodPressureSystolic,
        bloodPressureDiastolic:  values.bloodPressureDiastolic,
        respiratoryRate:         values.respiratoryRate,
        oxygenSaturation:        values.oxygenSaturation,
        weightKg:                values.weightKg,
        heightCm:                values.heightCm,
        notes:                   values.notes,
      }
      mutation.mutate(req, {
        onSuccess: () => {
          notification.success({ message: 'Vitals recorded', duration: SUCCESS_NOTIFICATION_DURATION })
          form.resetFields()
          onClose()
        },
        onError: () => notification.error({ message: 'Failed to record vitals' }),
      })
    })
  }

  return (
    <Modal
      open={open}
      title="Record Vitals"
      onOk={handleOk}
      onCancel={() => { form.resetFields(); onClose() }}
      okText="Save"
      confirmLoading={mutation.isPending}
      width={560}
    >
      <Form form={form} layout="vertical">
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="temperatureCelsius" label="Temperature (°C)">
              <InputNumber min={30} max={45} step={0.1} style={{ width: '100%' }} placeholder="e.g. 37.0" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="pulseRate" label="Pulse Rate (BPM)">
              <InputNumber min={30} max={250} style={{ width: '100%' }} placeholder="e.g. 72" />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="bloodPressureSystolic" label="BP Systolic (mmHg)">
              <InputNumber min={50} max={300} style={{ width: '100%' }} placeholder="e.g. 120" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="bloodPressureDiastolic" label="BP Diastolic (mmHg)">
              <InputNumber min={30} max={200} style={{ width: '100%' }} placeholder="e.g. 80" />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="respiratoryRate" label="Respiratory Rate (breaths/min)">
              <InputNumber min={4} max={60} style={{ width: '100%' }} placeholder="e.g. 16" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="oxygenSaturation" label="O₂ Saturation (%)">
              <InputNumber min={50} max={100} step={0.1} style={{ width: '100%' }} placeholder="e.g. 98.5" />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="weightKg" label="Weight (kg)">
              <InputNumber min={1} max={500} step={0.1} style={{ width: '100%' }} placeholder="e.g. 70.5" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="heightCm" label="Height (cm)">
              <InputNumber min={30} max={300} step={0.1} style={{ width: '100%' }} placeholder="e.g. 175.0" />
            </Form.Item>
          </Col>
        </Row>
        {bmi && (
          <Typography.Text type="secondary" style={{ display: 'block', marginBottom: 12 }}>
            Calculated BMI: <strong>{bmi}</strong>
          </Typography.Text>
        )}
        <Form.Item name="notes" label="Notes">
          <Input.TextArea rows={2} maxLength={500} showCount placeholder="Optional clinical notes" />
        </Form.Item>
      </Form>
    </Modal>
  )
}
