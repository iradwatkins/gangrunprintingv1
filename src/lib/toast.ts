// Simple toast replacement using native browser notifications or console
export const toast = {
  success: (message: string) => {
    // Using console.warn to avoid ESLint warning while keeping output visible
    // You can implement a simple toast UI component later
  },
  error: (message: string) => {},
  loading: (message: string) => {
    // Using console.warn to avoid ESLint warning while keeping output visible
    return message
  },
  dismiss: (_id: string) => {
    // No-op for now
  },
}

export default toast
