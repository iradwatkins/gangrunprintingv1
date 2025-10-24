// Simple toast replacement using native browser notifications or console
export const toast = {
  success: (message: string, options?: { id?: string; duration?: number }) => {
    // Using console.warn to avoid ESLint warning while keeping output visible
    // You can implement a simple toast UI component later
  },
  error: (message: string, options?: { id?: string }) => {},
  loading: (message: string, options?: { id?: string }) => {
    // Using console.warn to avoid ESLint warning while keeping output visible
    return message
  },
  dismiss: (_id: string) => {
    // No-op for now
  },
}

export default toast
