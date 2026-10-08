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
      className="m-auto w-[min(22rem,calc(100%-2rem))] rounded-2xl border border-line bg-surface p-6 text-ink shadow-2xl backdrop:bg-black/60 backdrop:backdrop-blur-sm open:motion-safe:animate-enter"
    >
      <h2 id="quit-title" className="text-lg font-semibold">
        Vill du avsluta quizet?
      </h2>
      <div className="mt-6 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={onCancel}
          autoFocus
          className="min-h-12 touch-manipulation rounded-xl border border-line bg-surface-hover px-4 font-medium hover:border-muted/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
        >
          Fortsätt
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className="min-h-12 touch-manipulation rounded-xl border border-wrong/50 px-4 font-medium text-wrong hover:bg-wrong/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
        >
          Avsluta
        </button>
      </div>
    </dialog>
  )
}
