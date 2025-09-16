import * as React from 'react'

export interface Toast {
  id: string
  title?: string
  description?: string
  action?: React.ReactNode
  variant?: 'default' | 'destructive'
}

interface ToastState {
  toasts: Toast[]
}

const toastTimeouts = new Map<string, NodeJS.Timeout>()

const listeners: Array<(state: ToastState) => void> = []
let memoryState: ToastState = { toasts: [] }

function dispatch(action: { type: string; toast?: Toast; id?: string }) {
  memoryState = reducer(memoryState, action)
  listeners.forEach((listener) => {
    listener(memoryState)
  })
}

function reducer(state: ToastState, action: { type: string; toast?: Toast; id?: string }): ToastState {
  switch (action.type) {
    case 'ADD_TOAST':
      return {
        ...state,
        toasts: [action.toast!, ...state.toasts],
      }
    case 'REMOVE_TOAST':
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.id),
      }
    default:
      return state
  }
}

export function useToast() {
  const [state, setState] = React.useState<ToastState>(memoryState)

  React.useEffect(() => {
    listeners.push(setState)
    return () => {
      const index = listeners.indexOf(setState)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }, [state])

  return {
    ...state,
    toast,
    dismiss: (toastId?: string) => dismiss(toastId),
  }
}

const genId = (() => {
  let count = 0
  return () => {
    count = (count + 1) % Number.MAX_VALUE
    return count.toString()
  }
})()

function toast(props: Omit<Toast, 'id'>) {
  const id = genId()
  const toast = { ...props, id }

  dispatch({ type: 'ADD_TOAST', toast })

  const timeout = setTimeout(() => {
    dismiss(id)
  }, 5000)

  toastTimeouts.set(id, timeout)

  return {
    id,
    dismiss: () => dismiss(id),
  }
}

function dismiss(toastId?: string) {
  if (toastId) {
    const timeout = toastTimeouts.get(toastId)
    if (timeout) {
      clearTimeout(timeout)
      toastTimeouts.delete(toastId)
    }
    dispatch({ type: 'REMOVE_TOAST', id: toastId })
  } else {
    memoryState.toasts.forEach((toast) => {
      const timeout = toastTimeouts.get(toast.id)
      if (timeout) {
        clearTimeout(timeout)
        toastTimeouts.delete(toast.id)
      }
    })
    memoryState = { toasts: [] }
    listeners.forEach((listener) => {
      listener(memoryState)
    })
  }
}

export { toast }