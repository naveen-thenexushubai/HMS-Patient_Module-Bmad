import { useState } from 'react'
import { Card, Table, Button, Empty, Row, Col, Statistic, Typography } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import type { ColumnsType } from 'antd/es/table'
import { useVitals } from '../hooks/usePatientVitals'
import type { PatientVitals } from '../types/patient.types'
import { AddVitalsModal } from './AddVitalsModal'

interface Props {
  patientId: string
  canRecord: boolean
}

export function VitalsHistoryCard({ patientId, canRecord }: Props) {
  const [addOpen, setAddOpen] = useState(false)
  const { data: vitals = [], isLoading } = useVitals(patientId)

  const latest = vitals[0]

  // Chart data — show up to 10 most recent, chronological order for the chart
  const chartData = [...vitals].reverse().slice(-10).map(v => ({
    date: new Date(v.recordedAt).toLocaleDateString(),
    Pulse: v.pulseRate,
    'BP Systolic': v.bloodPressureSystolic,
    'BP Diastolic': v.bloodPressureDiastolic,
    'Temp x10': v.temperatureCelsius != null ? Math.round(v.temperatureCelsius * 10) : undefined,
    'SpO₂': v.oxygenSaturation != null ? Number(v.oxygenSaturation) : undefined,
  }))

  const columns: ColumnsType<PatientVitals> = [
    {
      title: 'Date',
      dataIndex: 'recordedAt',
      key: 'date',
      render: (v: string) => new Date(v).toLocaleString(),
      width: 160,
    },
    { title: 'Temp (°C)', dataIndex: 'temperatureCelsius', key: 'temp', render: (v?: number) => v ?? '—' },
    {
      title: 'BP (mmHg)',
      key: 'bp',
      render: (_, r) =>
        r.bloodPressureSystolic != null && r.bloodPressureDiastolic != null
          ? `${r.bloodPressureSystolic}/${r.bloodPressureDiastolic}`
          : '—',
    },
    { title: 'Pulse', dataIndex: 'pulseRate', key: 'pulse', render: (v?: number) => v ?? '—' },
    { title: 'RR', dataIndex: 'respiratoryRate', key: 'rr', render: (v?: number) => v ?? '—' },
    { title: 'SpO₂ (%)', dataIndex: 'oxygenSaturation', key: 'spo2', render: (v?: number) => v ?? '—' },
    { title: 'Weight (kg)', dataIndex: 'weightKg', key: 'weight', render: (v?: number) => v ?? '—' },
    { title: 'BMI', dataIndex: 'bmi', key: 'bmi', render: (v?: number) => v ?? '—' },
    { title: 'By', dataIndex: 'recordedBy', key: 'by', width: 100 },
  ]

  return (
    <>
      <Card
        title="Vitals History"
        size="small"
        extra={
          canRecord && (
            <Button size="small" icon={<PlusOutlined />} onClick={() => setAddOpen(true)}>
              Record Vitals
            </Button>
          )
        }
      >
        {vitals.length === 0 && !isLoading ? (
          <Empty description="No vitals recorded" image={Empty.PRESENTED_IMAGE_SIMPLE} />
        ) : (
          <>
            {/* Latest readings */}
            {latest && (
              <Row gutter={[16, 8]} style={{ marginBottom: 16 }}>
                {latest.bloodPressureSystolic != null && (
                  <Col>
                    <Statistic
                      title="BP"
                      value={`${latest.bloodPressureSystolic}/${latest.bloodPressureDiastolic}`}
                      suffix="mmHg"
                    />
                  </Col>
                )}
                {latest.pulseRate != null && (
                  <Col><Statistic title="Pulse" value={latest.pulseRate} suffix="BPM" /></Col>
                )}
                {latest.temperatureCelsius != null && (
                  <Col><Statistic title="Temp" value={Number(latest.temperatureCelsius)} suffix="°C" precision={1} /></Col>
                )}
                {latest.oxygenSaturation != null && (
                  <Col><Statistic title="SpO₂" value={Number(latest.oxygenSaturation)} suffix="%" precision={1} /></Col>
                )}
                {latest.weightKg != null && (
                  <Col><Statistic title="Weight" value={Number(latest.weightKg)} suffix="kg" precision={1} /></Col>
                )}
                {latest.bmi != null && (
                  <Col><Statistic title="BMI" value={Number(latest.bmi)} precision={1} /></Col>
                )}
                <Col>
                  <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                    Last recorded: {new Date(latest.recordedAt).toLocaleString()} by {latest.recordedBy}
                  </Typography.Text>
                </Col>
              </Row>
            )}

            {/* Trend chart — only show if 2+ readings */}
            {chartData.length >= 2 && (
              <div style={{ marginBottom: 16 }}>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="Pulse" stroke="#1677ff" dot={false} />
                    <Line type="monotone" dataKey="BP Systolic" stroke="#ff4d4f" dot={false} />
                    <Line type="monotone" dataKey="BP Diastolic" stroke="#fa8c16" dot={false} />
                    <Line type="monotone" dataKey="SpO₂" stroke="#52c41a" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* History table */}
            <Table
              dataSource={vitals}
              columns={columns}
              rowKey="id"
              pagination={{ pageSize: 10 }}
              size="small"
              loading={isLoading}
              scroll={{ x: 800 }}
            />
          </>
        )}
      </Card>

      <AddVitalsModal open={addOpen} patientId={patientId} onClose={() => setAddOpen(false)} />
    </>
  )
}
