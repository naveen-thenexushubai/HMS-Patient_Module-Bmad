import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Table, Tag, Input, Select, DatePicker, Row, Col, Button } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import type { PatientAppointment, AppointmentStatus, AppointmentType } from '../types/patient.types'
import { useAllAppointments } from '../hooks/usePatientAppointments'
import { buildPatientDetailPath } from '../constants/routes'
import { PageHeader } from '../components/PageHeader'
import type { GlobalAppointmentParams } from '../api/patient-api'
import dayjs from 'dayjs'

const { RangePicker } = DatePicker

const STATUS_COLOR: Record<AppointmentStatus, string> = {
  SCHEDULED:  'blue',
  CONFIRMED:  'geekblue',
  COMPLETED:  'green',
  CANCELLED:  'default',
  NO_SHOW:    'red',
}

const TYPE_LABEL: Record<AppointmentType, string> = {
  CONSULTATION:    'Consultation',
  FOLLOW_UP:       'Follow-Up',
  PROCEDURE:       'Procedure',
  ROUTINE_CHECKUP: 'Routine Checkup',
  EMERGENCY:       'Emergency',
}

export function AppointmentListPage() {
  const navigate = useNavigate()
  const [params, setParams] = useState<GlobalAppointmentParams>({ page: 0, size: 20 })

  const { data, isLoading } = useAllAppointments(params)

  function handleSearch(value: string) {
    setParams(p => ({ ...p, patientId: value || undefined, page: 0 }))
  }

  function handleStatusChange(value: string) {
    setParams(p => ({ ...p, status: value || undefined, page: 0 }))
  }

  function handleTypeChange(value: string) {
    setParams(p => ({ ...p, appointmentType: value || undefined, page: 0 }))
  }

  function handleDateRange(_: any, [from, to]: [string, string]) {
    setParams(p => ({ ...p, dateFrom: from || undefined, dateTo: to || undefined, page: 0 }))
  }

  const columns: ColumnsType<PatientAppointment> = [
    {
      title: 'Patient ID',
      dataIndex: 'patientId',
      render: (id: string) => (
        <Button type="link" size="small" onClick={() => navigate(buildPatientDetailPath(id))}>
          {id}
        </Button>
      ),
    },
    { title: 'Date', dataIndex: 'appointmentDate' },
    { title: 'Time', dataIndex: 'appointmentTime' },
    {
      title: 'Type',
      dataIndex: 'appointmentType',
      render: (t: AppointmentType) => <Tag>{TYPE_LABEL[t]}</Tag>,
    },
    { title: 'Doctor', dataIndex: 'doctorName', render: (v?: string) => v ?? '—' },
    { title: 'Department', dataIndex: 'department', render: (v?: string) => v ?? '—' },
    {
      title: 'Status',
      dataIndex: 'status',
      render: (s: AppointmentStatus) => <Tag color={STATUS_COLOR[s]}>{s}</Tag>,
    },
  ]

  return (
    <div style={{ padding: 24 }}>
      <PageHeader title="All Appointments" subtitle="Global appointment list across all patients" />

      <Card size="small" style={{ marginBottom: 16 }}>
        <Row gutter={[12, 12]} align="middle">
          <Col xs={24} sm={6}>
            <Input.Search
              placeholder="Search by patient ID"
              onSearch={handleSearch}
              allowClear
            />
          </Col>
          <Col xs={24} sm={4}>
            <Select
              placeholder="Status"
              allowClear
              style={{ width: '100%' }}
              onChange={handleStatusChange}
              options={[
                { label: 'Scheduled', value: 'SCHEDULED' },
                { label: 'Confirmed', value: 'CONFIRMED' },
                { label: 'Completed', value: 'COMPLETED' },
                { label: 'Cancelled', value: 'CANCELLED' },
                { label: 'No Show', value: 'NO_SHOW' },
              ]}
            />
          </Col>
          <Col xs={24} sm={4}>
            <Select
              placeholder="Type"
              allowClear
              style={{ width: '100%' }}
              onChange={handleTypeChange}
              options={Object.entries(TYPE_LABEL).map(([v, l]) => ({ label: l, value: v }))}
            />
          </Col>
          <Col xs={24} sm={8}>
            <RangePicker
              style={{ width: '100%' }}
              onChange={handleDateRange}
              disabledDate={d => d.isAfter(dayjs().add(1, 'year'))}
            />
          </Col>
        </Row>
      </Card>

      <Table
        dataSource={data?.content ?? []}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        size="small"
        pagination={{
          current: (params.page ?? 0) + 1,
          pageSize: params.size ?? 20,
          total: data?.totalElements ?? 0,
          onChange: (page) => setParams(p => ({ ...p, page: page - 1 })),
          showTotal: (total) => `${total} appointments`,
        }}
      />
    </div>
  )
}
