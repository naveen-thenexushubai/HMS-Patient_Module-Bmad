import { z } from 'zod'

const PHONE_REGEX = /^(\+1-?)?\(?\d{3}\)?[-.\\s]?\d{3}[-.\\s]?\d{4}$/

export const patientSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName:  z.string().min(1, 'Last name is required').max(100),
  dateOfBirth: z
    .string()
    .min(1, 'Date of birth is required')
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date of birth must be YYYY-MM-DD')
    .refine(val => dayjs(val).isBefore(dayjs()), 'Date of birth cannot be in the future'),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER'], { required_error: 'Gender is required' }),
  phoneNumber: z
    .string()
    .min(1, 'Phone number is required')
    .regex(PHONE_REGEX, 'Phone: +1-XXX-XXX-XXXX, (XXX) XXX-XXXX, or XXX-XXX-XXXX'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  address:  z.string().optional(),
  city:     z.string().optional(),
  state:    z.string().optional(),
  zipCode:  z.string().optional(),
  emergencyContactName:         z.string().optional(),
  emergencyContactPhone:        z.string().regex(PHONE_REGEX, 'Invalid phone').optional().or(z.literal('')),
  emergencyContactRelationship: z.string().optional(),
  bloodGroup:        z.string().optional(),
  knownAllergies:    z.string().optional(),
  chronicConditions: z.string().optional(),
})

// dayjs needed for the refine — imported here to keep it co-located
import dayjs from 'dayjs'

export type PatientFormSchema = z.infer<typeof patientSchema>
