import { useState, useEffect } from 'react'
import { Avatar, Button, Upload, Space, Popconfirm, notification } from 'antd'
import { UserOutlined, UploadOutlined, DeleteOutlined, CameraOutlined } from '@ant-design/icons'
import type { UploadFile, UploadProps } from 'antd'
import { useUploadPhoto, useDeletePhoto } from '../hooks/usePatientPhoto'
import { fetchPatientPhotoBlob } from '../api/patient-api'
import { MAX_PHOTO_SIZE_MB, SUCCESS_NOTIFICATION_DURATION } from '../constants/config'

interface Props {
  patientId: string
  hasPhoto: boolean
  canEdit: boolean
  firstName?: string
  lastName?: string
}

export function PatientPhotoUpload({ patientId, hasPhoto, canEdit, firstName, lastName }: Props) {
  const [fileList, setFileList] = useState<UploadFile[]>([])
  const [blobUrl, setBlobUrl] = useState<string | null>(null)

  const uploadMutation = useUploadPhoto(patientId)
  const deleteMutation = useDeletePhoto(patientId)

  const initials = `${firstName?.[0] ?? ''}${lastName?.[0] ?? ''}`.toUpperCase() || '?'

  // Fetch photo as blob so the JWT Authorization header is included.
  // A plain <img src="..."> would bypass the axios interceptor and be blocked by Spring Security.
  useEffect(() => {
    if (!hasPhoto) {
      setBlobUrl(prev => {
        if (prev) URL.revokeObjectURL(prev)
        return null
      })
      return
    }

    let objectUrl: string | null = null
    fetchPatientPhotoBlob(patientId)
      .then(url => {
        objectUrl = url
        setBlobUrl(url)
      })
      .catch(() => setBlobUrl(null))

    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [patientId, hasPhoto])

  const uploadProps: UploadProps = {
    fileList,
    beforeUpload(file) {
      const isImage = file.type.startsWith('image/')
      if (!isImage) {
        notification.error({ message: 'Only image files are allowed' })
        return Upload.LIST_IGNORE
      }
      const isWithinLimit = file.size / 1024 / 1024 <= MAX_PHOTO_SIZE_MB
      if (!isWithinLimit) {
        notification.error({ message: `Photo must be under ${MAX_PHOTO_SIZE_MB} MB` })
        return Upload.LIST_IGNORE
      }
      uploadMutation.mutate(file, {
        onSuccess: () => {
          setFileList([])
          notification.success({ message: 'Photo uploaded', duration: SUCCESS_NOTIFICATION_DURATION })
        },
        onError: () => {
          setFileList([])
          notification.error({ message: 'Upload failed' })
        },
      })
      return false
    },
    onChange({ fileList: newList }) {
      setFileList(newList)
    },
    showUploadList: false,
    accept: 'image/*',
  }

  function handleDelete() {
    deleteMutation.mutate(undefined, {
      onSuccess: () => notification.success({ message: 'Photo removed', duration: SUCCESS_NOTIFICATION_DURATION }),
      onError: () => notification.error({ message: 'Delete failed' }),
    })
  }

  return (
    <Space direction="vertical" align="center">
      {blobUrl ? (
        <img
          src={blobUrl}
          alt="Patient photo"
          style={{ width: 96, height: 96, borderRadius: '50%', objectFit: 'cover', border: '2px solid #f0f0f0' }}
        />
      ) : (
        <Avatar size={96} icon={<UserOutlined />} style={{ backgroundColor: '#1677ff', fontSize: 36 }}>
          {initials}
        </Avatar>
      )}

      {canEdit && (
        <Space>
          <Upload {...uploadProps}>
            <Button
              size="small"
              icon={hasPhoto ? <CameraOutlined /> : <UploadOutlined />}
              loading={uploadMutation.isPending}
            >
              {hasPhoto ? 'Replace' : 'Upload'}
            </Button>
          </Upload>
          {hasPhoto && (
            <Popconfirm
              title="Remove photo?"
              onConfirm={handleDelete}
              okText="Remove"
              okButtonProps={{ danger: true }}
            >
              <Button size="small" icon={<DeleteOutlined />} danger loading={deleteMutation.isPending} />
            </Popconfirm>
          )}
        </Space>
      )}
    </Space>
  )
}
