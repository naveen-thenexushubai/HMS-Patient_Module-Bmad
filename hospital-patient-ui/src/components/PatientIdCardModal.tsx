import { Modal, Button, Divider } from 'antd'
import { PrinterOutlined } from '@ant-design/icons'
import { QRCodeSVG } from 'qrcode.react'
import type { Patient } from '../types/patient.types'
import { formatDate } from '../utils/date.utils'

interface Props {
  open: boolean
  patient: Patient
  onClose: () => void
}

export function PatientIdCardModal({ open, patient, onClose }: Props) {
  function handlePrint() {
    window.print()
  }

  return (
    <Modal
      open={open}
      title="Patient ID Card Preview"
      onCancel={onClose}
      footer={
        <>
          <Button onClick={onClose}>Close</Button>
          <Button type="primary" icon={<PrinterOutlined />} onClick={handlePrint}>
            Print Card
          </Button>
        </>
      }
      width={500}
    >
      <style>{`
        @media print {
          body > *:not(.ant-modal-root) { display: none !important; }
          .ant-modal-root .ant-modal-footer { display: none !important; }
          .patient-id-card { break-inside: avoid; }
        }
      `}</style>

      <div
        className="patient-id-card"
        style={{
          border: '2px solid #1677ff',
          borderRadius: 12,
          padding: 24,
          background: 'linear-gradient(135deg, #e6f4ff 0%, #f0f5ff 100%)',
          display: 'flex',
          gap: 24,
          alignItems: 'center',
        }}
      >
        {/* QR Code */}
        <div style={{ flexShrink: 0 }}>
          <QRCodeSVG
            value={patient.patientId}
            size={100}
            level="M"
            includeMargin
          />
        </div>

        {/* Patient Info */}
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, color: '#1677ff', fontWeight: 700, letterSpacing: 1.5, marginBottom: 2 }}>
            HOSPITAL PATIENT ID CARD
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#141414', lineHeight: 1.2 }}>
            {patient.firstName} {patient.lastName}
          </div>
          <Divider style={{ margin: '8px 0' }} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 0', fontSize: 12 }}>
            <span style={{ color: '#8c8c8c' }}>Patient ID</span>
            <span style={{ fontWeight: 600 }}>{patient.patientId}</span>
            {patient.mrn && (
              <>
                <span style={{ color: '#8c8c8c' }}>MRN</span>
                <span style={{ fontWeight: 600 }}>{patient.mrn}</span>
              </>
            )}
            <span style={{ color: '#8c8c8c' }}>Date of Birth</span>
            <span>{formatDate(patient.dateOfBirth)}</span>
            <span style={{ color: '#8c8c8c' }}>Blood Group</span>
            <span>{patient.bloodGroup ?? '—'}</span>
          </div>
        </div>
      </div>
    </Modal>
  )
}
