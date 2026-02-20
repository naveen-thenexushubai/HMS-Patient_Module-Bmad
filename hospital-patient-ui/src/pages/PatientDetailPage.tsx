import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Button, Card, Col, Descriptions, Row, Spin, Alert, Space, notification, Tag
} from 'antd'
import { ArrowLeftOutlined, EditOutlined, IdcardOutlined, AuditOutlined } from '@ant-design/icons'
import { usePatient } from '../hooks/usePatient'
import { useUpdatePatientStatus } from '../hooks/usePatientMutations'
import { StatusBadge } from '../components/StatusBadge'
import { ConfirmModal } from '../components/ConfirmModal'
import { PageHeader } from '../components/PageHeader'
import { PatientPhotoUpload } from '../components/PatientPhotoUpload'
import { DuplicatesAlert } from '../components/DuplicatesAlert'
import { FamilyRelationshipsCard } from '../components/FamilyRelationshipsCard'
import { PatientIdCardModal } from '../components/PatientIdCardModal'
import { InsuranceCard } from '../components/InsuranceCard'
import { VitalsHistoryCard } from '../components/VitalsHistoryCard'
import { AuditTrailModal } from '../components/AuditTrailModal'
import { formatDate, formatDateTime } from '../utils/date.utils'
import { useCurrentUser, canEditPatient, canManageStatus, canRecordVitals, canViewAuditTrail } from '../hooks/useCurrentUser'
import { buildPatientEditPath, ROUTES } from '../constants/routes'
import { SUCCESS_NOTIFICATION_DURATION } from '../constants/config'

export function PatientDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const user = useCurrentUser()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [idCardOpen, setIdCardOpen] = useState(false)
  const [auditOpen, setAuditOpen] = useState(false)

  const { data: patient, isLoading, isError, error } = usePatient(id ?? '')
  const statusMutation = useUpdatePatientStatus(id ?? '')

  function handleStatusToggle() {
    if (!patient) return
    const newStatus = patient.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'

    if (newStatus === 'INACTIVE') {
      setConfirmOpen(true)
      return
    }
    statusMutation.mutate('ACTIVE', {
      onSuccess: () => {
        notification.success({ message: 'Patient activated', duration: SUCCESS_NOTIFICATION_DURATION })
      },
      onError: (err: any) => {
        notification.error({ message: err?.title ?? 'Error', description: err?.detail })
      },
    })
  }

  function handleConfirmDeactivate() {
    statusMutation.mutate('INACTIVE', {
      onSuccess: () => {
        setConfirmOpen(false)
        notification.success({ message: 'Patient deactivated', duration: SUCCESS_NOTIFICATION_DURATION })
      },
      onError: (err: any) => {
        setConfirmOpen(false)
        notification.error({ message: err?.title ?? 'Error', description: err?.detail })
      },
    })
  }

  if (isLoading) return <div style={{ textAlign: 'center', padding: 80 }}><Spin size="large" /></div>
  if (isError || !patient)
    return <Alert type="error" message={(error as any)?.title ?? 'Error'} description={(error as any)?.detail} />

  return (
    <div style={{ padding: 24 }}>
      <PageHeader
        title={`${patient.firstName} ${patient.lastName}`}
        subtitle={
          <Space>
            <span>Patient ID: {patient.patientId}</span>
            {patient.mrn && <Tag color="blue">MRN: {patient.mrn}</Tag>}
          </Space>
        }
        extra={
          <Space>
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(ROUTES.PATIENTS)}>
              Back to List
            </Button>
            {canViewAuditTrail(user) && (
              <Button icon={<AuditOutlined />} onClick={() => setAuditOpen(true)}>
                Audit Trail
              </Button>
            )}
            <Button icon={<IdcardOutlined />} onClick={() => setIdCardOpen(true)}>
              Print ID Card
            </Button>
            {canEditPatient(user) && (
              <Button type="primary" icon={<EditOutlined />} onClick={() => navigate(buildPatientEditPath(patient.patientId))}>
                Edit Patient
              </Button>
            )}
            {canManageStatus(user) && (
              <Button
                danger={patient.status === 'ACTIVE'}
                onClick={handleStatusToggle}
                loading={statusMutation.isPending}
              >
                {patient.status === 'ACTIVE' ? 'Deactivate Patient' : 'Activate Patient'}
              </Button>
            )}
          </Space>
        }
      />

      {/* Duplicate detection alert */}
      <DuplicatesAlert patientId={patient.patientId} />

      <Row gutter={[16, 16]}>
        {/* Photo + Personal Information */}
        <Col xs={24} lg={12}>
          <Card title="Personal Information" size="small">
            <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
              <PatientPhotoUpload
                patientId={patient.patientId}
                hasPhoto={patient.hasPhoto ?? false}
                canEdit={canEditPatient(user)}
                firstName={patient.firstName}
                lastName={patient.lastName}
              />
              <Descriptions column={1} size="small" style={{ flex: 1 }}>
                <Descriptions.Item label="Status"><StatusBadge status={patient.status} /></Descriptions.Item>
                {patient.mrn && <Descriptions.Item label="MRN">{patient.mrn}</Descriptions.Item>}
                <Descriptions.Item label="Date of Birth">{formatDate(patient.dateOfBirth)}</Descriptions.Item>
                <Descriptions.Item label="Age">{patient.age} years</Descriptions.Item>
                <Descriptions.Item label="Gender">{patient.gender.charAt(0) + patient.gender.slice(1).toLowerCase()}</Descriptions.Item>
                <Descriptions.Item label="Blood Group">{patient.bloodGroup ?? '—'}</Descriptions.Item>
              </Descriptions>
            </div>
          </Card>
        </Col>

        {/* Contact Information */}
        <Col xs={24} lg={12}>
          <Card title="Contact Information" size="small">
            <Descriptions column={1} size="small">
              <Descriptions.Item label="Phone">{patient.phoneNumber}</Descriptions.Item>
              <Descriptions.Item label="Email">{patient.email ?? '—'}</Descriptions.Item>
              <Descriptions.Item label="Address">{patient.address ?? '—'}</Descriptions.Item>
              <Descriptions.Item label="City">{patient.city ?? '—'}</Descriptions.Item>
              <Descriptions.Item label="State">{patient.state ?? '—'}</Descriptions.Item>
              <Descriptions.Item label="ZIP">{patient.zipCode ?? '—'}</Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        {/* Emergency Contact */}
        <Col xs={24} lg={12}>
          <Card title="Emergency Contact" size="small">
            <Descriptions column={1} size="small">
              <Descriptions.Item label="Name">{patient.emergencyContactName ?? '—'}</Descriptions.Item>
              <Descriptions.Item label="Phone">{patient.emergencyContactPhone ?? '—'}</Descriptions.Item>
              <Descriptions.Item label="Relationship">{patient.emergencyContactRelationship ?? '—'}</Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        {/* Medical Information */}
        <Col xs={24} lg={12}>
          <Card title="Medical Information" size="small">
            <Descriptions column={1} size="small">
              <Descriptions.Item label="Known Allergies">{patient.knownAllergies ?? '—'}</Descriptions.Item>
              <Descriptions.Item label="Chronic Conditions">{patient.chronicConditions ?? '—'}</Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        {/* Family Relationships */}
        <Col xs={24}>
          <FamilyRelationshipsCard
            patientId={patient.patientId}
            canEdit={canEditPatient(user)}
          />
        </Col>

        {/* Insurance */}
        <Col xs={24}>
          <InsuranceCard patientId={id ?? ''} canEdit={canEditPatient(user)} />
        </Col>

        {/* Vitals */}
        <Col xs={24}>
          <VitalsHistoryCard patientId={id ?? ''} canRecord={canRecordVitals(user)} />
        </Col>

        {/* Record Information */}
        <Col xs={24}>
          <Card title="Record Information" size="small">
            <Descriptions column={2} size="small">
              <Descriptions.Item label="Registered By">{patient.registeredBy}</Descriptions.Item>
              <Descriptions.Item label="Registered At">{formatDateTime(patient.registeredAt)}</Descriptions.Item>
              <Descriptions.Item label="Last Updated By">{patient.updatedBy ?? '—'}</Descriptions.Item>
              <Descriptions.Item label="Last Updated At">{formatDateTime(patient.updatedAt)}</Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
      </Row>

      <ConfirmModal
        open={confirmOpen}
        title="Deactivate Patient"
        message="Are you sure you want to deactivate this patient? They will no longer appear in the active patient list."
        confirmLabel="Deactivate"
        onConfirm={handleConfirmDeactivate}
        onCancel={() => setConfirmOpen(false)}
        loading={statusMutation.isPending}
      />

      {idCardOpen && (
        <PatientIdCardModal
          open={idCardOpen}
          patient={patient}
          onClose={() => setIdCardOpen(false)}
        />
      )}

      <AuditTrailModal open={auditOpen} patientId={id ?? ''} onClose={() => setAuditOpen(false)} />
    </div>
  )
}
