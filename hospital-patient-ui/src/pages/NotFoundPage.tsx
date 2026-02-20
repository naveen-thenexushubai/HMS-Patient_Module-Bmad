import { Result, Button } from 'antd'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '../constants/routes'

export function NotFoundPage() {
  const navigate = useNavigate()
  return (
    <Result
      status="404"
      title="404"
      subTitle="Page not found."
      extra={<Button type="primary" onClick={() => navigate(ROUTES.PATIENTS)}>Back to Patients</Button>}
    />
  )
}
