import { useEffect, useRef } from "react";

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "确认",
  cancelLabel = "取消",
  onConfirm,
  onCancel,
}) {
  const dialogRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  function handleCancel(event) {
    event.preventDefault();
    onCancel?.();
  }

  function handleBackdropClick(event) {
    if (event.target === dialogRef.current) {
      onCancel?.();
    }
  }

  return (
    <dialog ref={dialogRef} className="confirm-dialog" onClose={onCancel} onClick={handleBackdropClick}>
      <h2>{title}</h2>
      <p>{message}</p>
      <div className="confirm-dialog-actions">
        <button type="button" className="secondary-button" onClick={handleCancel}>
          {cancelLabel}
        </button>
        <button type="button" className="primary-button" onClick={onConfirm}>
          {confirmLabel}
        </button>
      </div>
    </dialog>
  );
}
