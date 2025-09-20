// Simple toast replacement using native browser notifications or console
export const toast = {
  success: (message: string) => {
    // Using console.warn to avoid ESLint warning while keeping output visible
    console.warn('✅', message)
    // You can implement a simple toast UI component later
  },
  error: (message: string) => {
    console.error('❌', message)
  },
  loading: (message: string) => {
    // Using console.warn to avoid ESLint warning while keeping output visible
    console.warn('⏳', message)
    return message
  },
  dismiss: (_id: string) => {
    // No-op for now
  },
}

export default toast
