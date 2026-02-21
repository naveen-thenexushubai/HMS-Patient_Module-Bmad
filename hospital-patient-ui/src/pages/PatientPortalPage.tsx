import { useNavigate } from 'react-router-dom'
import {
  Layout, Card, Row, Col, Descriptions, Table, Tag, Button, Form, Input, notification, Spin, Alert, Space
} from 'antd'
import { LogoutOutlined } from '@ant-design/icons'
import { NotificationBell } from '../components/NotificationBell'
import type { ColumnsType } from 'antd/es/table'
import type { PatientAppointment, PatientAllergy, AppointmentStatus, AppointmentType, AllergySeverity, PortalContactUpdateRequest } from '../types/patient.types'
import { usePortalMe, usePortalAppointments, usePortalAllergies, useUpdatePortalContact } from '../hooks/usePatientPortal'
import { SUCCESS_NOTIFICATION_DURATION } from '../constants/config'

const { Header, Content } = Layout

const STATUS_COLOR: Record<AppointmentStatus, string> = {
  SCHEDULED: 'blue', CONFIRMED: 'geekblue', COMPLETED: 'green', CANCELLED: 'default', NO_SHOW: 'red',
}

const TYPE_LABEL: Record<AppointmentType, string> = {
  CONSULTATION: 'Consultation', FOLLOW_UP: 'Follow-Up', PROCEDURE: 'Procedure',
  ROUTINE_CHECKUP: 'Routine Checkup', EMERGENCY: 'Emergency',
}

const SEVERITY_COLOR: Record<AllergySeverity, string> = {
  MILD: 'green', MODERATE: 'orange', SEVERE: 'red', LIFE_THREATENING: 'red',
}

const appointmentColumns: ColumnsType<PatientAppointment> = [
  { title: 'Date', dataIndex: 'appointmentDate' },
  { title: 'Time', dataIndex: 'appointmentTime' },
  { title: 'Type', dataIndex: 'appointmentType', render: (t: AppointmentType) => <Tag>{TYPE_LABEL[t]}</Tag> },
  { title: 'Doctor', dataIndex: 'doctorName', render: (v?: string) => v ?? '—' },
  { title: 'Department', dataIndex: 'department', render: (v?: string) => v ?? '—' },
  { title: 'Status', dataIndex: 'status', render: (s: AppointmentStatus) => <Tag color={STATUS_COLOR[s]}>{s}</Tag> },
]

const allergyColumns: ColumnsType<PatientAllergy> = [
  { title: 'Allergy', dataIndex: 'allergyName' },
  { title: 'Type', dataIndex: 'allergyType', render: (t: string) => t.charAt(0) + t.slice(1).toLowerCase() },
  {
    title: 'Severity', dataIndex: 'severity',
    render: (s: AllergySeverity) => (
      <Tag color={SEVERITY_COLOR[s]}>{s === 'LIFE_THREATENING' ? '⚠️ Life Threatening' : s.charAt(0) + s.slice(1).toLowerCase()}</Tag>
    ),
  },
  { title: 'Reaction', dataIndex: 'reaction', render: (v?: string) => v ?? '—' },
]

function maskPhone(phone: string): string {
  if (!phone || phone.length < 4) return phone
  return phone.slice(0, -4).replace(/\d/g, '*') + phone.slice(-4)
}

export function PatientPortalPage() {
  const navigate = useNavigate()
  const [form] = Form.useForm<PortalContactUpdateRequest>()

  const { data: patient, isLoading: patientLoading, isError } = usePortalMe()
  const { data: appointments, isLoading: apptLoading } = usePortalAppointments()
  const { data: allergies, isLoading: allergyLoading } = usePortalAllergies()
  const updateContactMutation = useUpdatePortalContact()

  function handleLogout() {
    localStorage.removeItem('token')
    navigate('/login')
  }

  function handleContactUpdate(values: PortalContactUpdateRequest) {
    updateContactMutation.mutate(values, {
      onSuccess: () => {
        notification.success({ message: 'Contact information updated', duration: SUCCESS_NOTIFICATION_DURATION })
        form.resetFields()
      },
      onError: (err: any) => notification.error({ message: err?.title ?? 'Error', description: err?.detail }),
    })
  }

  if (patientLoading) return <div style={{ textAlign: 'center', padding: 80 }}><Spin size="large" /></div>
  if (isError || !patient) return <Alert type="error" message="Unable to load your profile. Please login again." />

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px' }}>
        <span style={{ color: '#fff', fontSize: 18, fontWeight: 600 }}>
          Ai Nexus — Patient Portal
        </span>
        <Space>
          <span style={{ color: 'rgba(255,255,255,0.85)' }}>Welcome, {patient.firstName}</span>
          <NotificationBell />
          <Button size="small" icon={<LogoutOutlined />} onClick={handleLogout} ghost>
            Sign Out
          </Button>
        </Space>
      </Header>
      <Content style={{ background: '#f5f5f5', padding: 24 }}>
        <Row gutter={[16, 16]}>
          {/* My Profile */}
          <Col xs={24} lg={12}>
            <Card title="My Profile" size="small">
              <Descriptions column={1} size="small">
                <Descriptions.Item label="Name">{patient.firstName} {patient.lastName}</Descriptions.Item>
                <Descriptions.Item label="Date of Birth">{patient.dateOfBirth}</Descriptions.Item>
                <Descriptions.Item label="Gender">{patient.gender}</Descriptions.Item>
                <Descriptions.Item label="Blood Group">{patient.bloodGroup ?? '—'}</Descriptions.Item>
                <Descriptions.Item label="Phone">{maskPhone(patient.phoneNumber)}</Descriptions.Item>
                <Descriptions.Item label="Email">{patient.email ?? '—'}</Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>

          {/* My Allergies */}
          <Col xs={24} lg={12}>
            <Card title="My Allergies" size="small">
              <Table
                dataSource={allergies ?? []}
                columns={allergyColumns}
                rowKey="id"
                loading={allergyLoading}
                pagination={false}
                size="small"
                locale={{ emptyText: 'No allergies on record' }}
              />
            </Card>
          </Col>

          {/* My Upcoming Appointments */}
          <Col xs={24}>
            <Card title="My Upcoming Appointments" size="small">
              <Table
                dataSource={appointments ?? []}
                columns={appointmentColumns}
                rowKey="id"
                loading={apptLoading}
                pagination={false}
                size="small"
                locale={{ emptyText: 'No upcoming appointments' }}
              />
            </Card>
          </Col>

          {/* Update Contact Info */}
          <Col xs={24} lg={12}>
            <Card title="Update My Contact Information" size="small">
              <Form form={form} layout="vertical" onFinish={handleContactUpdate}>
                <Form.Item name="phoneNumber" label="Phone Number">
                  <Input placeholder="New phone number" />
                </Form.Item>
                <Form.Item name="email" label="Email" rules={[{ type: 'email', message: 'Invalid email' }]}>
                  <Input placeholder="New email address" />
                </Form.Item>
                <Form.Item name="address" label="Address">
                  <Input placeholder="Street address" />
                </Form.Item>
                <Form.Item name="city" label="City">
                  <Input />
                </Form.Item>
                <Form.Item name="state" label="State">
                  <Input />
                </Form.Item>
                <Form.Item name="zipCode" label="ZIP Code">
                  <Input />
                </Form.Item>
                <Form.Item>
                  <Button type="primary" htmlType="submit" loading={updateContactMutation.isPending}>
                    Update Contact Info
                  </Button>
                </Form.Item>
              </Form>
            </Card>
          </Col>
        </Row>
      </Content>
    </Layout>
  )
}
