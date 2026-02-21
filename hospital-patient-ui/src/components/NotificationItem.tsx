import { CalendarOutlined, CloseCircleOutlined, ClockCircleOutlined, CheckCircleOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import type { PatientNotification, NotificationType } from '../types/patient.types'

dayjs.extend(relativeTime)

interface Props {
  notification: PatientNotification
  onRead: (id: number) => void
}

const TYPE_ICON: Record<NotificationType, React.ReactNode> = {
  APPOINTMENT_BOOKED:    <CalendarOutlined style={{ color: '#52c41a' }} />,
  APPOINTMENT_CONFIRMED: <CalendarOutlined style={{ color: '#1677ff' }} />,
  APPOINTMENT_CANCELLED: <CloseCircleOutlined style={{ color: '#ff4d4f' }} />,
  APPOINTMENT_REMINDER:  <ClockCircleOutlined style={{ color: '#fa8c16' }} />,
  APPOINTMENT_COMPLETED: <CheckCircleOutlined style={{ color: '#1677ff' }} />,
}

export function NotificationItem({ notification, onRead }: Props) {
  const { id, type, title, message, isRead, createdAt } = notification

  return (
    <div
      onClick={() => { if (!isRead) onRead(id) }}
      style={{
        display: 'flex',
        gap: 12,
        padding: '10px 12px',
        borderLeft: isRead ? 'none' : '3px solid #1677ff',
        background: isRead ? 'transparent' : '#f0f5ff',
        cursor: isRead ? 'default' : 'pointer',
        borderRadius: 4,
        marginBottom: 8,
      }}
    >
      <div style={{ paddingTop: 2, fontSize: 16 }}>{TYPE_ICON[type]}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: isRead ? 400 : 600, marginBottom: 2, fontSize: 13 }}>{title}</div>
        <div style={{ fontSize: 12, color: '#555', marginBottom: 4, whiteSpace: 'pre-wrap' }}>{message}</div>
        <div style={{ fontSize: 11, color: '#999' }}>{dayjs(createdAt).fromNow()}</div>
      </div>
    </div>
  )
}
