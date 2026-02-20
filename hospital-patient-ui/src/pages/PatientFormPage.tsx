import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Form, Input, Select, Button, Row, Col, Card, Space, notification, Spin, DatePicker
} from 'antd'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import dayjs from 'dayjs'
import { patientSchema, type PatientFormSchema } from '../utils/validation.utils'
import { usePatient } from '../hooks/usePatient'
import { useCreatePatient, useUpdatePatient } from '../hooks/usePatientMutations'
import { PageHeader } from '../components/PageHeader'
import { buildPatientDetailPath, ROUTES } from '../constants/routes'
import { BLOOD_GROUPS, SUCCESS_NOTIFICATION_DURATION } from '../constants/config'
import type { ApiError } from '../types/api.types'

const { Option } = Select
const { TextArea } = Input

interface FieldGroupProps { label: string; children: React.ReactNode }
function FieldGroup({ label, children }: FieldGroupProps) {
  return (
    <Card title={label} size="small" style={{ marginBottom: 16 }}>
      <Row gutter={[16, 0]}>{children}</Row>
    </Card>
  )
}

interface FormFieldProps {
  label: string
  name: string
  required?: boolean
  error?: string
  children: React.ReactNode
}
function FormField({ label, name, required, error, children }: FormFieldProps) {
  return (
    <Col xs={24} md={12}>
      <Form.Item
        label={label}
        required={required}
        validateStatus={error ? 'error' : ''}
        help={error}
        htmlFor={name}
      >
        {children}
      </Form.Item>
    </Col>
  )
}

export function PatientFormPage() {
  const { id } = useParams<{ id?: string }>()
  const navigate = useNavigate()
  const isEdit = !!id

  const { data: existingPatient, isLoading: loadingPatient } = usePatient(id ?? '')
  const createMutation = useCreatePatient()
  const updateMutation = useUpdatePatient(id ?? '')

  const {
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<PatientFormSchema>({ resolver: zodResolver(patientSchema), mode: 'onBlur' })

  // Prepopulate form when editing
  useEffect(() => {
    if (isEdit && existingPatient) {
      reset({
        firstName:   existingPatient.firstName,
        lastName:    existingPatient.lastName,
        dateOfBirth: existingPatient.dateOfBirth,
        gender:      existingPatient.gender,
        phoneNumber: existingPatient.phoneNumber,
        email:       existingPatient.email ?? '',
        address:     existingPatient.address ?? '',
        city:        existingPatient.city ?? '',
        state:       existingPatient.state ?? '',
        zipCode:     existingPatient.zipCode ?? '',
        emergencyContactName:         existingPatient.emergencyContactName ?? '',
        emergencyContactPhone:        existingPatient.emergencyContactPhone ?? '',
        emergencyContactRelationship: existingPatient.emergencyContactRelationship ?? '',
        bloodGroup:        existingPatient.bloodGroup ?? '',
        knownAllergies:    existingPatient.knownAllergies ?? '',
        chronicConditions: existingPatient.chronicConditions ?? '',
      })
    }
  }, [isEdit, existingPatient, reset])

  async function onSubmit(data: PatientFormSchema) {
    const mutation = isEdit ? updateMutation : createMutation

    mutation.mutate(data as any, {
      onSuccess: result => {
        notification.success({
          message: isEdit ? 'Patient updated' : `Patient registered — ID: ${result.patientId}`,
          duration: SUCCESS_NOTIFICATION_DURATION,
        })
        // PRD REQ-1.11: warn about duplicate phone but allow registration
        if (!isEdit && result.duplicatePhoneWarning) {
          notification.warning({
            message: 'Duplicate Phone Warning',
            description: 'Another patient with this phone number may already exist. Please verify before proceeding.',
            duration: 10,
          })
        }
        navigate(buildPatientDetailPath(result.patientId))
      },
      onError: (err: unknown) => {
        const apiErr = err as ApiError
        // Map backend field errors to react-hook-form
        if (apiErr?.fieldErrors) {
          apiErr.fieldErrors.forEach(fe => {
            setError(fe.field as any, { message: fe.message })
          })
        } else {
          notification.error({ message: apiErr?.title ?? 'Error', description: apiErr?.detail })
        }
      },
    })
  }

  if (isEdit && loadingPatient)
    return <div style={{ textAlign: 'center', padding: 80 }}><Spin size="large" /></div>

  return (
    <div style={{ padding: 24, maxWidth: 900, margin: '0 auto' }}>
      <PageHeader
        title={isEdit ? 'Edit Patient' : 'Register New Patient'}
        subtitle={isEdit ? `Editing: ${existingPatient?.patientId}` : undefined}
      />

      <p style={{ marginBottom: 16, color: 'rgba(0,0,0,0.45)' }}>* Required field</p>

      <Form layout="vertical" onFinish={handleSubmit(onSubmit)} noValidate>

        {/* Section 1: Personal Information */}
        <FieldGroup label="Personal Information">
          <FormField label="First Name" name="firstName" required error={errors.firstName?.message}>
            <Controller name="firstName" control={control}
              render={({ field }) => <Input {...field} id="firstName" placeholder="John" />} />
          </FormField>
          <FormField label="Last Name" name="lastName" required error={errors.lastName?.message}>
            <Controller name="lastName" control={control}
              render={({ field }) => <Input {...field} id="lastName" placeholder="Doe" />} />
          </FormField>
          <FormField label="Date of Birth" name="dateOfBirth" required error={errors.dateOfBirth?.message}>
            <Controller name="dateOfBirth" control={control}
              render={({ field }) => (
                <DatePicker
                  id="dateOfBirth"
                  style={{ width: '100%' }}
                  disabledDate={d => d && d.isAfter(dayjs())}
                  value={field.value ? dayjs(field.value) : null}
                  onChange={d => field.onChange(d ? d.format('YYYY-MM-DD') : '')}
                  format="YYYY-MM-DD"
                />
              )} />
          </FormField>
          <FormField label="Gender" name="gender" required error={errors.gender?.message}>
            <Controller name="gender" control={control}
              render={({ field }) => (
                <Select {...field} id="gender" placeholder="Select gender" style={{ width: '100%' }}>
                  <Option value="MALE">Male</Option>
                  <Option value="FEMALE">Female</Option>
                  <Option value="OTHER">Other</Option>
                </Select>
              )} />
          </FormField>
        </FieldGroup>

        {/* Section 2: Contact Information */}
        <FieldGroup label="Contact Information">
          <FormField label="Phone Number" name="phoneNumber" required error={errors.phoneNumber?.message}>
            <Controller name="phoneNumber" control={control}
              render={({ field }) => <Input {...field} id="phoneNumber" placeholder="555-123-4567" />} />
          </FormField>
          <FormField label="Email" name="email" error={errors.email?.message}>
            <Controller name="email" control={control}
              render={({ field }) => <Input {...field} id="email" type="email" placeholder="john.doe@email.com" />} />
          </FormField>
          <FormField label="Address" name="address" error={errors.address?.message}>
            <Controller name="address" control={control}
              render={({ field }) => <Input {...field} id="address" />} />
          </FormField>
          <FormField label="City" name="city" error={errors.city?.message}>
            <Controller name="city" control={control}
              render={({ field }) => <Input {...field} id="city" />} />
          </FormField>
          <FormField label="State" name="state" error={errors.state?.message}>
            <Controller name="state" control={control}
              render={({ field }) => <Input {...field} id="state" />} />
          </FormField>
          <FormField label="ZIP Code" name="zipCode" error={errors.zipCode?.message}>
            <Controller name="zipCode" control={control}
              render={({ field }) => <Input {...field} id="zipCode" />} />
          </FormField>
        </FieldGroup>

        {/* Section 3: Emergency Contact */}
        <FieldGroup label="Emergency Contact">
          <FormField label="Contact Name" name="emergencyContactName" error={errors.emergencyContactName?.message}>
            <Controller name="emergencyContactName" control={control}
              render={({ field }) => <Input {...field} id="emergencyContactName" />} />
          </FormField>
          <FormField label="Contact Phone" name="emergencyContactPhone" error={errors.emergencyContactPhone?.message}>
            <Controller name="emergencyContactPhone" control={control}
              render={({ field }) => <Input {...field} id="emergencyContactPhone" />} />
          </FormField>
          <FormField label="Relationship" name="emergencyContactRelationship" error={errors.emergencyContactRelationship?.message}>
            <Controller name="emergencyContactRelationship" control={control}
              render={({ field }) => <Input {...field} id="emergencyContactRelationship" placeholder="Spouse, Parent, Sibling..." />} />
          </FormField>
        </FieldGroup>

        {/* Section 4: Medical Information */}
        <FieldGroup label="Medical Information">
          <FormField label="Blood Group" name="bloodGroup" error={errors.bloodGroup?.message}>
            <Controller name="bloodGroup" control={control}
              render={({ field }) => (
                <Select {...field} id="bloodGroup" placeholder="Select blood group" style={{ width: '100%' }} allowClear>
                  {BLOOD_GROUPS.map(bg => <Option key={bg} value={bg}>{bg}</Option>)}
                </Select>
              )} />
          </FormField>
          <Col xs={24}>
            <Form.Item label="Known Allergies" validateStatus={errors.knownAllergies ? 'error' : ''} help={errors.knownAllergies?.message}>
              <Controller name="knownAllergies" control={control}
                render={({ field }) => <TextArea {...field} id="knownAllergies" rows={3} placeholder="List known allergies..." />} />
            </Form.Item>
          </Col>
          <Col xs={24}>
            <Form.Item label="Chronic Conditions" validateStatus={errors.chronicConditions ? 'error' : ''} help={errors.chronicConditions?.message}>
              <Controller name="chronicConditions" control={control}
                render={({ field }) => <TextArea {...field} id="chronicConditions" rows={3} placeholder="List chronic conditions..." />} />
            </Form.Item>
          </Col>
        </FieldGroup>

        <Space>
          <Button type="primary" htmlType="submit" loading={isSubmitting || createMutation.isPending || updateMutation.isPending}>
            {isEdit ? 'Save Changes' : 'Register Patient'}
          </Button>
          <Button onClick={() => isEdit && id ? navigate(buildPatientDetailPath(id)) : navigate(ROUTES.PATIENTS)}>
            Cancel
          </Button>
        </Space>
      </Form>
    </div>
  )
}
