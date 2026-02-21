import { useState } from 'react'
import { Badge, Button } from 'antd'
import { BellOutlined } from '@ant-design/icons'
import { useUnreadCount } from '../hooks/usePatientNotifications'
import { NotificationDrawer } from './NotificationDrawer'

export function NotificationBell() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const { data } = useUnreadCount()
  const unreadCount = data?.count ?? 0

  return (
    <>
      <Badge count={unreadCount} overflowCount={99} size="small">
        <Button
          type="text"
          icon={<BellOutlined style={{ fontSize: 18, color: 'rgba(255,255,255,0.85)' }} />}
          onClick={() => setDrawerOpen(true)}
          style={{ padding: '0 4px' }}
        />
      </Badge>
      <NotificationDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  )
}
