export interface PageResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  number: number
  size: number
}

export interface FieldError {
  field: string
  message: string
}

export interface ApiError {
  type: string
  title: string
  status: number
  detail: string
  fieldErrors?: FieldError[]
}
