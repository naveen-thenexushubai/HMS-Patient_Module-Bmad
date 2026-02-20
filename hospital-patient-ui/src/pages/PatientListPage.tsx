import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Table, Input, Select, Button, Alert, Spin, Row, Col, Switch, InputNumber, Collapse, Space, notification } from 'antd'
import { PlusOutlined, SearchOutlined, FilterOutlined, DownloadOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { usePatients } from '../hooks/usePatients'
import { StatusBadge } from '../components/StatusBadge'
import { PageHeader } from '../components/PageHeader'
import { useDebounce } from '../utils/use-debounce'
import { useCurrentUser, canEditPatient } from '../hooks/useCurrentUser'
import { buildPatientDetailPath, buildPatientEditPath, ROUTES } from '../constants/routes'
import { BLOOD_GROUPS, MAX_PAGE_SIZE, SEARCH_DEBOUNCE_MS } from '../constants/config'
import type { PatientSummary, PatientStatus, Gender } from '../types/patient.types'
import { exportPatientsCsv } from '../api/patient-api'

const { Option } = Select

export function PatientListPage() {
  const navigate = useNavigate()
  const user = useCurrentUser()

  // Basic filters
  const [searchInput, setSearchInput] = useState('')
  const [statusFilter, setStatusFilter] = useState<PatientStatus | undefined>('ACTIVE')
  const [genderFilter, setGenderFilter] = useState<Gender | undefined>()
  const [bloodGroupFilter, setBloodGroupFilter] = useState<string | undefined>()
  const [page, setPage] = useState(0)

  // Advanced filters
  const [cityFilter, setCityFilter] = useState<string | undefined>()
  const [stateFilter, setStateFilter] = useState<string | undefined>()
  const [ageFrom, setAgeFrom] = useState<number | undefined>()
  const [ageTo, setAgeTo] = useState<number | undefined>()
  const [hasAllergiesFilter, setHasAllergiesFilter] = useState<boolean | undefined>()
  const [hasChronicFilter, setHasChronicFilter] = useState<boolean | undefined>()

  const debouncedSearch = useDebounce(searchInput, SEARCH_DEBOUNCE_MS)

  // Convert age range to birth year range
  const currentYear = new Date().getFullYear()
  const birthYearFrom = ageTo != null ? currentYear - ageTo : undefined
  const birthYearTo   = ageFrom != null ? currentYear - ageFrom : undefined

  const { data, isLoading, isError, error } = usePatients({
    search: debouncedSearch || undefined,
    status: statusFilter,
    gender: genderFilter,
    bloodGroup: bloodGroupFilter || undefined,
    city: cityFilter || undefined,
    state: stateFilter || undefined,
    birthYearFrom,
    birthYearTo,
    hasAllergies: hasAllergiesFilter,
    hasChronicConditions: hasChronicFilter,
    page,
    size: MAX_PAGE_SIZE,
  })

  const columns: ColumnsType<PatientSummary> = [
    { title: 'Patient ID', dataIndex: 'patientId', key: 'patientId', width: 110 },
    { title: 'MRN', dataIndex: 'mrn', key: 'mrn', width: 120, render: (v?: string) => v ?? '—' },
    {
      title: 'Full Name', key: 'name',
      render: (_, r) => `${r.firstName} ${r.lastName}`,
    },
    { title: 'Age', dataIndex: 'age', key: 'age', width: 70 },
    { title: 'Gender', dataIndex: 'gender', key: 'gender', width: 90,
      render: (g: Gender) => g.charAt(0) + g.slice(1).toLowerCase() },
    { title: 'Phone', dataIndex: 'phoneNumber', key: 'phoneNumber' },
    { title: 'Status', dataIndex: 'status', key: 'status', width: 110,
      render: (s: PatientStatus) => <StatusBadge status={s} /> },
    {
      title: 'Action', key: 'action', width: 80,
      render: (_, r) => canEditPatient(user)
        ? <Button size="small" onClick={e => { e.stopPropagation(); navigate(buildPatientEditPath(r.patientId)) }}>Edit</Button>
        : null,
    },
  ]

  function clearAdvancedFilters() {
    setCityFilter(undefined)
    setStateFilter(undefined)
    setAgeFrom(undefined)
    setAgeTo(undefined)
    setHasAllergiesFilter(undefined)
    setHasChronicFilter(undefined)
    setPage(0)
  }

  async function handleExportCsv() {
    try {
      const blob = await exportPatientsCsv({
        search: debouncedSearch || undefined,
        status: statusFilter,
        gender: genderFilter,
        bloodGroup: bloodGroupFilter || undefined,
        city: cityFilter || undefined,
        state: stateFilter || undefined,
        birthYearFrom,
        birthYearTo,
        hasAllergies: hasAllergiesFilter,
        hasChronicConditions: hasChronicFilter,
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'patients_export.csv'
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      notification.error({ message: 'Export failed' })
    }
  }

  return (
    <div style={{ padding: 24 }}>
      <PageHeader
        title="Patients"
        subtitle="Manage patient records"
        extra={
          canEditPatient(user) && (
            <Space>
              <Button icon={<DownloadOutlined />} onClick={handleExportCsv}>
                Export CSV
              </Button>
              <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate(ROUTES.PATIENT_NEW)}>
                Register New Patient
              </Button>
            </Space>
          )
        }
      />

      {/* Basic Filters */}
      <Row gutter={[16, 16]} style={{ marginBottom: 8 }}>
        <Col xs={24} md={10}>
          <Input
            placeholder="Search by ID, MRN, name, phone, or email"
            prefix={<SearchOutlined />}
            value={searchInput}
            onChange={e => { setSearchInput(e.target.value); setPage(0) }}
            allowClear
            aria-label="Search patients"
          />
        </Col>
        <Col xs={8} md={4}>
          <Select
            value={statusFilter}
            onChange={v => { setStatusFilter(v); setPage(0) }}
            style={{ width: '100%' }}
            placeholder="Status"
            allowClear
            aria-label="Filter by status"
          >
            <Option value="ACTIVE">Active</Option>
            <Option value="INACTIVE">Inactive</Option>
          </Select>
        </Col>
        <Col xs={8} md={4}>
          <Select
            value={genderFilter}
            onChange={v => { setGenderFilter(v); setPage(0) }}
            style={{ width: '100%' }}
            placeholder="Gender"
            allowClear
            aria-label="Filter by gender"
          >
            <Option value="MALE">Male</Option>
            <Option value="FEMALE">Female</Option>
            <Option value="OTHER">Other</Option>
          </Select>
        </Col>
        <Col xs={8} md={4}>
          <Select
            value={bloodGroupFilter}
            onChange={v => { setBloodGroupFilter(v); setPage(0) }}
            style={{ width: '100%' }}
            placeholder="Blood Group"
            allowClear
            aria-label="Filter by blood group"
          >
            {BLOOD_GROUPS.map(bg => <Option key={bg} value={bg}>{bg}</Option>)}
          </Select>
        </Col>
      </Row>

      {/* Advanced Filters — collapsible */}
      <Collapse
        size="small"
        style={{ marginBottom: 16 }}
        items={[
          {
            key: 'advanced',
            label: <><FilterOutlined /> Advanced Filters</>,
            children: (
              <Row gutter={[16, 12]}>
                <Col xs={12} md={4}>
                  <Input
                    placeholder="City"
                    value={cityFilter}
                    onChange={e => { setCityFilter(e.target.value || undefined); setPage(0) }}
                    allowClear
                  />
                </Col>
                <Col xs={12} md={4}>
                  <Input
                    placeholder="State"
                    value={stateFilter}
                    onChange={e => { setStateFilter(e.target.value || undefined); setPage(0) }}
                    allowClear
                  />
                </Col>
                <Col xs={12} md={3}>
                  <InputNumber
                    placeholder="Age From"
                    min={0} max={150}
                    value={ageFrom}
                    onChange={v => { setAgeFrom(v ?? undefined); setPage(0) }}
                    style={{ width: '100%' }}
                  />
                </Col>
                <Col xs={12} md={3}>
                  <InputNumber
                    placeholder="Age To"
                    min={0} max={150}
                    value={ageTo}
                    onChange={v => { setAgeTo(v ?? undefined); setPage(0) }}
                    style={{ width: '100%' }}
                  />
                </Col>
                <Col xs={12} md={4} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Switch
                    checked={hasAllergiesFilter === true}
                    onChange={checked => { setHasAllergiesFilter(checked ? true : undefined); setPage(0) }}
                    size="small"
                  />
                  <span style={{ fontSize: 12 }}>Has Allergies</span>
                </Col>
                <Col xs={12} md={4} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Switch
                    checked={hasChronicFilter === true}
                    onChange={checked => { setHasChronicFilter(checked ? true : undefined); setPage(0) }}
                    size="small"
                  />
                  <span style={{ fontSize: 12 }}>Has Chronic Conditions</span>
                </Col>
                <Col xs={24} md={2}>
                  <Button size="small" onClick={clearAdvancedFilters}>Clear</Button>
                </Col>
              </Row>
            ),
          },
        ]}
      />

      {isError && <Alert type="error" message={(error as any)?.title} description={(error as any)?.detail} style={{ marginBottom: 16 }} />}

      {isLoading
        ? <div style={{ textAlign: 'center', padding: 48 }}><Spin size="large" /></div>
        : (
          <Table
            dataSource={data?.content ?? []}
            columns={columns}
            rowKey="patientId"
            onRow={record => ({ onClick: () => navigate(buildPatientDetailPath(record.patientId)), style: { cursor: 'pointer' } })}
            locale={{ emptyText: 'No patients found' }}
            pagination={{
              total: data?.totalElements ?? 0,
              pageSize: MAX_PAGE_SIZE,
              current: page + 1,
              onChange: p => setPage(p - 1),
              showTotal: total => `${total} patients`,
            }}
            scroll={{ x: 900 }}
          />
        )
      }
    </div>
  )
}
