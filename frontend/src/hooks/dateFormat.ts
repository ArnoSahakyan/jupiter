export const dateOptions: Intl.DateTimeFormatOptions = {
  month: 'long',
  day: 'numeric',
  year: 'numeric',
  hour: 'numeric',
  minute: 'numeric',
  hour12: true
};

export const formatDate = (date: Date) => new Intl.DateTimeFormat('en-US', dateOptions).format(date);

// Chat times: "2:05 PM" for today, "Nov 14, 2:05 PM" for older messages.
export const formatMessageTime = (value: string | Date) => {
  const date = new Date(value);
  const isToday = date.toDateString() === new Date().toDateString();
  return new Intl.DateTimeFormat('en-US', isToday
    ? { hour: 'numeric', minute: '2-digit' }
    : { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }
  ).format(date);
};
// Short times for posts and comments: "just now", "5m", "3h", "2d", "Nov 14",
// "Nov 14, 2025" for other years. Use formatDate for the full date (tooltips).
export const formatRelative = (value: string | Date) => {
  const date = new Date(value);
  const seconds = Math.round((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
  if (seconds < 7 * 86400) return `${Math.floor(seconds / 86400)}d`;
  const sameYear = date.getFullYear() === new Date().getFullYear();
  return new Intl.DateTimeFormat('en-US', sameYear
    ? { month: 'short', day: 'numeric' }
    : { month: 'short', day: 'numeric', year: 'numeric' }
  ).format(date);
};
