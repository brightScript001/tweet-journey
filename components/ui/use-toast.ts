"use client"

import { useEffect, useState } from "react"

const TOAST_TIMEOUT = 5000

type ToastProps = {
  title: string
  description: string
  variant?: "default" | "destructive"
}

type Toast = ToastProps & {
  id: string
  visible: boolean
}

let toasts: Toast[] = []
let listeners: ((toasts: Toast[]) => void)[] = []

const notifyListeners = () => {
  listeners.forEach((listener) => listener([...toasts]))
}

export function toast(props: ToastProps) {
  const id = Math.random().toString(36).substring(2, 9)
  const newToast: Toast = { ...props, id, visible: true }

  toasts = [...toasts, newToast]
  notifyListeners()

  setTimeout(() => {
    toasts = toasts.map((t) => (t.id === id ? { ...t, visible: false } : t))
    notifyListeners()

    setTimeout(() => {
      toasts = toasts.filter((t) => t.id !== id)
      notifyListeners()
    }, 300)
  }, TOAST_TIMEOUT)

  return {
    id,
    dismiss: () => {
      toasts = toasts.map((t) => (t.id === id ? { ...t, visible: false } : t))
      notifyListeners()

      setTimeout(() => {
        toasts = toasts.filter((t) => t.id !== id)
        notifyListeners()
      }, 300)
    },
  }
}

export function useToast() {
  const [currentToasts, setCurrentToasts] = useState<Toast[]>([])

  useEffect(() => {
    const listener = (updatedToasts: Toast[]) => {
      setCurrentToasts(updatedToasts)
    }

    listeners.push(listener)
    return () => {
      listeners = listeners.filter((l) => l !== listener)
    }
  }, [])

  return { toast, toasts: currentToasts }
}

