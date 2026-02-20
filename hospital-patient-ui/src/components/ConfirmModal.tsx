import { Modal } from 'antd'

interface Props {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  onConfirm: () => void
  onCancel: () => void
  loading?: boolean
}

export function ConfirmModal({ open, title, message, confirmLabel = 'Confirm', onConfirm, onCancel, loading }: Props) {
  return (
    <Modal
      open={open}
      title={title}
      onOk={onConfirm}
      onCancel={onCancel}
      okText={confirmLabel}
      okButtonProps={{ danger: true, loading }}
      cancelButtonProps={{ disabled: loading }}
    >
      <p>{message}</p>
    </Modal>
  )
}
