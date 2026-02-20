import { Typography } from 'antd'
import type { ReactNode } from 'react'

interface Props {
  title: string
  subtitle?: ReactNode
  extra?: ReactNode
}

export function PageHeader({ title, subtitle, extra }: Props) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
      <div>
        <Typography.Title level={3} style={{ margin: 0 }}>{title}</Typography.Title>
        {subtitle && <Typography.Text type="secondary">{subtitle}</Typography.Text>}
      </div>
      {extra && <div>{extra}</div>}
    </div>
  )
}
