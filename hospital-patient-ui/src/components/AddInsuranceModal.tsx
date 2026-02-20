import { useEffect } from 'react'
import { Modal, Form, Input, Select, Switch, Alert, DatePicker, Row, Col, notification } from 'antd'
import dayjs from 'dayjs'
import { useAddInsurance, useUpdateInsurance } from '../hooks/usePatientInsurance'
import type { PatientInsurance, PatientInsuranceRequest } from '../types/patient.types'
import { COVERAGE_TYPES, SUCCESS_NOTIFICATION_DURATION } from '../constants/config'

interface Props {
  open: boolean
  patientId: string
  editRecord: PatientInsurance | null
  onClose: () => void
}

export function AddInsuranceModal({ open, patientId, editRecord, onClose }: Props) {
  const [form] = Form.useForm()
  const addMutation    = useAddInsurance(patientId)
  const updateMutation = useUpdateInsurance(patientId)
  const isEdit = !!editRecord
  const isPending = addMutation.isPending || updateMutation.isPending

  useEffect(() => {
    if (open && editRecord) {
      form.setFieldsValue({
        providerName:   editRecord.providerName,
        policyNumber:   editRecord.policyNumber,
        groupNumber:    editRecord.groupNumber,
        coverageType:   editRecord.coverageType,
        subscriberName: editRecord.subscriberName,
        subscriberDob:  editRecord.subscriberDob ? dayjs(editRecord.subscriberDob) : null,
        validFrom:      editRecord.validFrom ? dayjs(editRecord.validFrom) : null,
        validTo:        editRecord.validTo   ? dayjs(editRecord.validTo)   : null,
        isPrimary:      editRecord.isPrimary,
      })
    } else if (open) {
      form.resetFields()
    }
  }, [open, editRecord, form])

  function handleOk() {
    form.validateFields().then(values => {
      const req: PatientInsuranceRequest = {
        providerName:   values.providerName,
        policyNumber:   values.policyNumber,
        groupNumber:    values.groupNumber,
        coverageType:   values.coverageType,
        subscriberName: values.subscriberName,
        subscriberDob:  values.subscriberDob ? values.subscriberDob.format('YYYY-MM-DD') : undefined,
        validFrom:      values.validFrom ? values.validFrom.format('YYYY-MM-DD') : undefined,
        validTo:        values.validTo   ? values.validTo.format('YYYY-MM-DD')   : undefined,
        isPrimary:      values.isPrimary ?? true,
      }

      if (isEdit && editRecord) {
        updateMutation.mutate({ id: editRecord.id, req }, {
          onSuccess: () => {
            notification.success({ message: 'Insurance updated', duration: SUCCESS_NOTIFICATION_DURATION })
            onClose()
          },
          onError: () => notification.error({ message: 'Update failed' }),
        })
      } else {
        addMutation.mutate(req, {
          onSuccess: () => {
            notification.success({ message: 'Insurance added', duration: SUCCESS_NOTIFICATION_DURATION })
            onClose()
          },
          onError: () => notification.error({ message: 'Add failed' }),
        })
      }
    })
  }

  return (
    <Modal
      open={open}
      title={isEdit ? 'Edit Insurance' : 'Add Insurance'}
      onOk={handleOk}
      onCancel={onClose}
      okText={isEdit ? 'Save' : 'Add'}
      confirmLoading={isPending}
      width={600}
    >
      {(addMutation.isError || updateMutation.isError) && (
        <Alert type="error" message="Operation failed. Please try again." style={{ marginBottom: 16 }} />
      )}
      <Form form={form} layout="vertical">
        <Form.Item name="providerName" label="Provider Name" rules={[{ required: true, message: 'Provider name is required' }]}>
          <Input placeholder="e.g. Blue Cross Blue Shield" />
        </Form.Item>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="coverageType" label="Coverage Type">
              <Select placeholder="Select type" allowClear>
                {COVERAGE_TYPES.map(t => <Select.Option key={t} value={t}>{t}</Select.Option>)}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="isPrimary" label="Primary Insurance" valuePropName="checked">
              <Switch />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="policyNumber" label="Policy Number">
              <Input placeholder="Policy #" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="groupNumber" label="Group Number">
              <Input placeholder="Group #" />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="subscriberName" label="Subscriber Name">
              <Input placeholder="Name on policy" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="subscriberDob" label="Subscriber DOB">
              <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="validFrom" label="Valid From">
              <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="validTo" label="Valid To">
              <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  )
}
