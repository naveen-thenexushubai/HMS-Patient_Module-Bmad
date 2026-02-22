import { Card, Timeline, Tag, Typography, Empty } from 'antd'
import { CheckCircleOutlined } from '@ant-design/icons'
import type { AppointmentType } from '../types/patient.types'
import { useVisitHistory } from '../hooks/usePatientAppointments'

interface Props {
  patientId: string
}

const TYPE_COLOR: Record<AppointmentType, string> = {
  CONSULTATION:    'blue',
  FOLLOW_UP:       'cyan',
  PROCEDURE:       'purple',
  ROUTINE_CHECKUP: 'green',
  EMERGENCY:       'red',
}

const TYPE_LABEL: Record<AppointmentType, string> = {
  CONSULTATION:    'Consultation',
  FOLLOW_UP:       'Follow-Up',
  PROCEDURE:       'Procedure',
  ROUTINE_CHECKUP: 'Routine Checkup',
  EMERGENCY:       'Emergency',
}

export function VisitHistoryTimeline({ patientId }: Props) {
  const { data: visits, isLoading } = useVisitHistory(patientId)

  const items = (visits ?? []).slice(0, 20).map(v => ({
    dot: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
    label: (
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontWeight: 600 }}>{v.appointmentDate}</div>
        <div style={{ color: '#888', fontSize: 12 }}>{v.appointmentTime}</div>
      </div>
    ),
    children: (
      <div style={{ paddingBottom: 8 }}>
        <Tag color={TYPE_COLOR[v.appointmentType]}>{TYPE_LABEL[v.appointmentType]}</Tag>
        {v.doctorName && <span style={{ marginLeft: 8, color: '#595959' }}>{v.doctorName}</span>}
        {v.department && <span style={{ marginLeft: 4, color: '#888', fontSize: 12 }}>— {v.department}</span>}
        {v.diagnosis && (
          <div style={{ marginTop: 4 }}>
            <Typography.Text strong>Diagnosis: </Typography.Text>
            <Typography.Text>{v.diagnosis}</Typography.Text>
          </div>
        )}
        {v.visitNotes && (
          <div style={{ marginTop: 2 }}>
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>{v.visitNotes}</Typography.Text>
          </div>
        )}
      </div>
    ),
  }))

  return (
    <Card title="Visit History" size="small" loading={isLoading}>
      {items.length === 0 ? (
        <Empty description="No visit history" image={Empty.PRESENTED_IMAGE_SIMPLE} />
      ) : (
        <Timeline mode="left" items={items} />
      )}
    </Card>
  )
}
