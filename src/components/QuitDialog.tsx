import { useEffect, useRef } from 'react'

interface Props {
  open: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function QuitDialog({ open, onConfirm, onCancel }: Props) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      onClose={onCancel}
      aria-labelledby="quit-title"
      className="m-auto w-[min(22rem,calc(100%-2rem))] rounded-lg border border-neutral-700 bg-neutral-900 p-5 text-neutral-100 backdrop:bg-black/60"
    >
      <h2 id="quit-title" className="text-lg font-semibold">
        Vill du avsluta quizet?
      </h2>
      <div className="mt-5 flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          autoFocus
          className="min-h-12 rounded-lg border border-neutral-600 px-4"
        >
          Fortsätt
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className="min-h-12 rounded-lg border border-red-400/60 px-4"
        >
          Avsluta
        </button>
      </div>
    </dialog>
  )
}
