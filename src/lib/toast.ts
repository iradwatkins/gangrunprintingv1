// Simple toast replacement using native browser notifications or console
export const toast = {
  success: (message: string) => {
    console.log('✅', message);
    // You can implement a simple toast UI component later
  },
  error: (message: string) => {
    console.error('❌', message);
  },
  loading: (message: string) => {
    console.log('⏳', message);
    return message;
  },
  dismiss: (id: string) => {
    // No-op for now
  }
};

export default toast;