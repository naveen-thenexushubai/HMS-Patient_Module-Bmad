import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { Layout, Button, Space, Tag } from 'antd'
import { LogoutOutlined, CalendarOutlined } from '@ant-design/icons'
import { ROUTES } from './constants/routes'
import { useCurrentUser, isPatientRole, canViewGlobalAppointments } from './hooks/useCurrentUser'
import { PatientListPage }       from './pages/PatientListPage'
import { PatientDetailPage }     from './pages/PatientDetailPage'
import { PatientFormPage }       from './pages/PatientFormPage'
import { AppointmentListPage }   from './pages/AppointmentListPage'
import { PatientPortalPage }     from './pages/PatientPortalPage'
import { LoginPage }             from './pages/LoginPage'
import { NotFoundPage }          from './pages/NotFoundPage'

const { Header, Content } = Layout

const ROLE_COLOR: Record<string, string> = {
  RECEPTIONIST: 'blue',
  DOCTOR:       'green',
  NURSE:        'cyan',
  ADMIN:        'red',
  PATIENT:      'purple',
}

function AppHeader() {
  const navigate  = useNavigate()
  const user      = useCurrentUser()

  function handleLogout() {
    localStorage.removeItem('token')
    navigate('/login')
  }

  if (isPatientRole(user)) return null  // Portal has its own header

  return (
    <Header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px' }}>
      <span style={{ color: '#fff', fontSize: 18, fontWeight: 600 }}>
        Ai Nexus — Hospital Patient Management
      </span>
      {user && (
        <Space>
          {canViewGlobalAppointments(user) && (
            <Button size="small" icon={<CalendarOutlined />} onClick={() => navigate(ROUTES.APPOINTMENTS)} ghost>
              Appointments
            </Button>
          )}
          <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: 14 }}>{user.username}</span>
          <Tag color={ROLE_COLOR[user.role] ?? 'default'}>{user.role}</Tag>
          <Button size="small" icon={<LogoutOutlined />} onClick={handleLogout} ghost>
            Sign Out
          </Button>
        </Space>
      )}
    </Header>
  )
}

function RootRedirect() {
  const user = useCurrentUser()
  if (isPatientRole(user)) return <Navigate to={ROUTES.PORTAL} replace />
  return <Navigate to={ROUTES.PATIENTS} replace />
}

export default function App() {
  const user = useCurrentUser()

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <AppHeader />
      <Content style={{ background: '#f5f5f5' }}>
        <Routes>
          <Route path="/login"                element={<LoginPage />} />
          <Route path="/"                     element={<RootRedirect />} />
          <Route path={ROUTES.PORTAL}         element={<PatientPortalPage />} />
          <Route path={ROUTES.PATIENTS}       element={isPatientRole(user) ? <Navigate to={ROUTES.PORTAL} replace /> : <PatientListPage />} />
          <Route path={ROUTES.PATIENT_NEW}    element={<PatientFormPage />} />
          <Route path={ROUTES.PATIENT_DETAIL} element={<PatientDetailPage />} />
          <Route path={ROUTES.PATIENT_EDIT}   element={<PatientFormPage />} />
          <Route path={ROUTES.APPOINTMENTS}   element={<AppointmentListPage />} />
          <Route path="*"                     element={<NotFoundPage />} />
        </Routes>
      </Content>
    </Layout>
  )
}
