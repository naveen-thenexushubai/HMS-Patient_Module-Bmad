import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Form, Input, Select, Button, Typography, notification, Space } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import axios from 'axios'
import { ROUTES } from '../constants/routes'

const { Title, Text } = Typography
const { Option } = Select

interface DevLoginForm {
  username: string
  role: 'RECEPTIONIST' | 'DOCTOR' | 'NURSE' | 'ADMIN'
}

const ROLE_DESCRIPTIONS: Record<string, string> = {
  RECEPTIONIST: 'Register, search, view, update patients',
  DOCTOR:       'Search and view patients (read-only)',
  NURSE:        'Search and view patients (read-only)',
  ADMIN:        'Full access — register, update, activate/deactivate',
}

export function LoginPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [selectedRole, setSelectedRole] = useState<string>('RECEPTIONIST')

  async function onFinish(values: DevLoginForm) {
    setLoading(true)
    try {
      const { data } = await axios.post<{ token: string }>(
        '/api/v1/auth/dev-login',
        { username: values.username, role: values.role }
      )
      localStorage.setItem('token', data.token)
      notification.success({ message: `Logged in as ${values.username} (${values.role})`, duration: 3 })
      navigate(ROUTES.PATIENTS)
    } catch {
      notification.error({ message: 'Login failed', description: 'Could not reach the backend. Make sure the API is running.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f0f2f5',
    }}>
      <Card style={{ width: 420, boxShadow: '0 4px 24px rgba(0,0,0,0.10)' }}>
        <Space direction="vertical" style={{ width: '100%', marginBottom: 8 }}>
          <Title level={3} style={{ margin: 0 }}>Ai Nexus</Title>
          <Text type="secondary">Hospital Patient Management — Dev Login</Text>
        </Space>

        <div style={{
          background: '#fffbe6',
          border: '1px solid #ffe58f',
          borderRadius: 6,
          padding: '8px 12px',
          marginBottom: 20,
          fontSize: 12,
          color: '#ad6800',
        }}>
          <strong>Development mode only.</strong> This login page is not available in production. Choose any role to test the UI with the correct permissions.
        </div>

        <Form layout="vertical" onFinish={onFinish} initialValues={{ role: 'RECEPTIONIST', username: 'receptionist1' }}>
          <Form.Item label="Username" name="username" rules={[{ required: true, message: 'Enter a username' }]}>
            <Input prefix={<UserOutlined />} placeholder="e.g. receptionist1" />
          </Form.Item>

          <Form.Item label="Role" name="role" rules={[{ required: true }]}>
            <Select onChange={v => setSelectedRole(v)}>
              <Option value="RECEPTIONIST">RECEPTIONIST</Option>
              <Option value="DOCTOR">DOCTOR</Option>
              <Option value="NURSE">NURSE</Option>
              <Option value="ADMIN">ADMIN</Option>
            </Select>
          </Form.Item>

          {selectedRole && (
            <div style={{ marginBottom: 16, fontSize: 13, color: 'rgba(0,0,0,0.45)' }}>
              <LockOutlined /> {ROLE_DESCRIPTIONS[selectedRole]}
            </div>
          )}

          <Form.Item style={{ marginBottom: 0 }}>
            <Button type="primary" htmlType="submit" loading={loading} block>
              Sign In
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}
