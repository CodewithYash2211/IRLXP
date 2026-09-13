'use client'
import { useEffect, useRef } from 'react'
export function GameDialog({ children, label, onClose }: { children: React.ReactNode; label: string; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const dialog = ref.current
    dialog?.showModal()
    return () => dialog?.close()
  }, [])
  return <dialog ref={ref} className="game-dialog" aria-label={label} onCancel={e => { e.preventDefault(); onClose() }} onClick={e => { if (e.target === e.currentTarget) onClose() }}>{children}</dialog>
}
