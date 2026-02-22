import { useEffect } from 'react'
import { Modal, Form, Input, Select, DatePicker, TimePicker, notification } from 'antd'
import dayjs from 'dayjs'
import type { AppointmentRequest, AppointmentType } from '../types/patient.types'
import { useBookAppointment } from '../hooks/usePatientAppointments'
import { SUCCESS_NOTIFICATION_DURATION } from '../constants/config'

interface Props {
  open: boolean
  patientId: string
  onClose: () => void
}

const APPOINTMENT_TYPES: { label: string; value: AppointmentType }[] = [
  { label: 'Consultation', value: 'CONSULTATION' },
  { label: 'Follow-Up', value: 'FOLLOW_UP' },
  { label: 'Procedure', value: 'PROCEDURE' },
  { label: 'Routine Checkup', value: 'ROUTINE_CHECKUP' },
  { label: 'Emergency', value: 'EMERGENCY' },
]

export function BookAppointmentModal({ open, patientId, onClose }: Props) {
  const [form] = Form.useForm()
  const bookMutation = useBookAppointment(patientId)

  useEffect(() => {
    if (open) form.resetFields()
  }, [open, form])

  function handleSubmit(values: any) {
    const req: AppointmentRequest = {
      appointmentDate:  values.appointmentDate.format('YYYY-MM-DD'),
      appointmentTime:  values.appointmentTime.format('HH:mm'),
      appointmentType:  values.appointmentType,
      doctorName:       values.doctorName,
      department:       values.department,
      reasonForVisit:   values.reasonForVisit,
    }
    bookMutation.mutate(req, {
      onSuccess: () => {
        notification.success({ message: 'Appointment booked', duration: SUCCESS_NOTIFICATION_DURATION })
        onClose()
      },
      onError: (err: any) => notification.error({ message: err?.title ?? 'Error', description: err?.detail }),
    })
  }

  return (
    <Modal
      open={open}
      title="Book Appointment"
      okText="Book"
      onOk={() => form.submit()}
      onCancel={onClose}
      confirmLoading={bookMutation.isPending}
      destroyOnClose
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item name="appointmentDate" label="Date" rules={[{ required: true, message: 'Required' }]}>
          <DatePicker
            style={{ width: '100%' }}
            disabledDate={d => d.isBefore(dayjs().startOf('day'))}
          />
        </Form.Item>

        <Form.Item name="appointmentTime" label="Time" rules={[{ required: true, message: 'Required' }]}>
          <TimePicker style={{ width: '100%' }} format="HH:mm" minuteStep={15} />
        </Form.Item>

        <Form.Item name="appointmentType" label="Type" rules={[{ required: true, message: 'Required' }]}>
          <Select placeholder="Select type" options={APPOINTMENT_TYPES} />
        </Form.Item>

        <Form.Item name="doctorName" label="Doctor Name">
          <Input placeholder="Dr. Name" />
        </Form.Item>

        <Form.Item name="department" label="Department">
          <Input placeholder="e.g. Cardiology, General Medicine" />
        </Form.Item>

        <Form.Item name="reasonForVisit" label="Reason for Visit">
          <Input.TextArea rows={3} placeholder="Brief description of visit reason" maxLength={1000} showCount />
        </Form.Item>
      </Form>
    </Modal>
  )
}
