// Simple date formatting utility to replace date-fns
export function format(date: Date | string, formatStr: string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  // Basic formatting patterns
  const month = d.toLocaleDateString('en-US', { month: 'long' });
  const monthShort = d.toLocaleDateString('en-US', { month: 'short' });
  const day = d.getDate();
  const year = d.getFullYear();
  const time = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  
  // Common formats
  if (formatStr === 'PPP') {
    // January 1st, 2024
    return d.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }
  
  if (formatStr === 'PPp') {
    // January 1st, 2024 at 10:30 AM
    return d.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  
  if (formatStr === 'MMM d, yyyy') {
    return `${monthShort} ${day}, ${year}`;
  }
  
  if (formatStr === 'MMMM d, yyyy') {
    return `${month} ${day}, ${year}`;
  }
  
  if (formatStr === 'MM/dd/yyyy') {
    return d.toLocaleDateString('en-US');
  }
  
  // Default
  return d.toLocaleDateString('en-US');
}