import { Drawer, Button, Empty, Spin } from 'antd'
import { useNotifications, useMarkRead, useMarkAllRead } from '../hooks/usePatientNotifications'
import { NotificationItem } from './NotificationItem'

interface Props {
  open: boolean
  onClose: () => void
}

export function NotificationDrawer({ open, onClose }: Props) {
  const { data: notifications, isLoading } = useNotifications()
  const markRead = useMarkRead()
  const markAllRead = useMarkAllRead()

  const unreadCount = notifications?.filter(n => !n.isRead).length ?? 0

  return (
    <Drawer
      title="Notifications"
      placement="right"
      width={380}
      open={open}
      onClose={onClose}
      extra={
        unreadCount > 0 ? (
          <Button
            type="link"
            size="small"
            loading={markAllRead.isPending}
            onClick={() => markAllRead.mutate()}
          >
            Mark all read
          </Button>
        ) : null
      }
    >
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: 40 }}>
          <Spin />
        </div>
      ) : !notifications || notifications.length === 0 ? (
        <Empty description="No notifications yet" />
      ) : (
        notifications.slice(0, 50).map(n => (
          <NotificationItem
            key={n.id}
            notification={n}
            onRead={(id) => markRead.mutate(id)}
          />
        ))
      )}
    </Drawer>
  )
}
