import { useState } from 'react'
import { Card, Table, Tag, Button, Popconfirm, notification } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import type { PatientAppointment, AppointmentStatus, AppointmentType } from '../types/patient.types'
import { useUpcomingAppointments, useCancelAppointment } from '../hooks/usePatientAppointments'
import { BookAppointmentModal } from './BookAppointmentModal'
import { SUCCESS_NOTIFICATION_DURATION } from '../constants/config'

interface Props {
  patientId: string
  canSchedule: boolean
}

const STATUS_COLOR: Record<AppointmentStatus, string> = {
  SCHEDULED:  'blue',
  CONFIRMED:  'geekblue',
  COMPLETED:  'green',
  CANCELLED:  'default',
  NO_SHOW:    'red',
}

const TYPE_LABEL: Record<AppointmentType, string> = {
  CONSULTATION:    'Consultation',
  FOLLOW_UP:       'Follow-Up',
  PROCEDURE:       'Procedure',
  ROUTINE_CHECKUP: 'Routine Checkup',
  EMERGENCY:       'Emergency',
}

export function AppointmentCard({ patientId, canSchedule }: Props) {
  const [bookOpen, setBookOpen] = useState(false)
  const { data: appointments, isLoading } = useUpcomingAppointments(patientId)
  const cancelMutation = useCancelAppointment(patientId)

  function handleCancel(id: number) {
    cancelMutation.mutate(id, {
      onSuccess: () => notification.success({ message: 'Appointment cancelled', duration: SUCCESS_NOTIFICATION_DURATION }),
      onError: (err: any) => notification.error({ message: err?.title ?? 'Error', description: err?.detail }),
    })
  }

  const columns: ColumnsType<PatientAppointment> = [
    { title: 'Date', dataIndex: 'appointmentDate' },
    { title: 'Time', dataIndex: 'appointmentTime' },
    {
      title: 'Type',
      dataIndex: 'appointmentType',
      render: (t: AppointmentType) => <Tag>{TYPE_LABEL[t]}</Tag>,
    },
    { title: 'Doctor', dataIndex: 'doctorName', render: (v?: string) => v ?? '—' },
    { title: 'Department', dataIndex: 'department', render: (v?: string) => v ?? '—' },
    {
      title: 'Status',
      dataIndex: 'status',
      render: (s: AppointmentStatus) => <Tag color={STATUS_COLOR[s]}>{s}</Tag>,
    },
    ...(canSchedule ? [{
      title: 'Actions',
      key: 'actions',
      render: (_: any, r: PatientAppointment) => (
        r.status === 'SCHEDULED' || r.status === 'CONFIRMED' ? (
          <Popconfirm
            title="Cancel this appointment?"
            onConfirm={() => handleCancel(r.id)}
            okText="Cancel Appointment"
            okButtonProps={{ danger: true }}
          >
            <Button size="small" danger>Cancel</Button>
          </Popconfirm>
        ) : null
      ),
    }] : []),
  ]

  return (
    <>
      <Card
        title="Upcoming Appointments"
        size="small"
        extra={canSchedule && (
          <Button size="small" type="primary" icon={<PlusOutlined />} onClick={() => setBookOpen(true)}>
            Book Appointment
          </Button>
        )}
      >
        <Table
          dataSource={appointments ?? []}
          columns={columns}
          rowKey="id"
          loading={isLoading}
          pagination={false}
          size="small"
          locale={{ emptyText: 'No upcoming appointments' }}
        />
      </Card>

      <BookAppointmentModal open={bookOpen} patientId={patientId} onClose={() => setBookOpen(false)} />
    </>
  )
}
