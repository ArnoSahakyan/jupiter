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