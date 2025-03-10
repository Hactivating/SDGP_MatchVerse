// Format a date object to YYYY-MM-DD string
export const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Generate time slots between start and end hours
export const getTimeSlots = (start, end) => {
  const slots = [];
  const safeStart = Math.max(0, Math.min(23, start));
  const safeEnd = Math.max(safeStart, Math.min(24, end));
  for (let hour = safeStart; hour < safeEnd; hour++) {
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    slots.push(`${hour12}:00 ${ampm}`);
  }
  return slots;
};

// Convert HHMM format (e.g., 900 for 9:00 AM) to hour (e.g., 9)
export const convertHHMMToHour = (timeInHHMM) => {
  return Math.floor(timeInHHMM / 100);
};

// Format time in HHMM format to HH:MM for input fields
export const formatTimeForInput = (time) => {
  const hours = Math.floor(time / 100).toString().padStart(2, '0');
  const minutes = (time % 100).toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};

// Parse HH:MM time to HHMM format
export const parseTimeToHHMM = (timeStr) => {
  const [hours, minutes] = timeStr.split(':');
  return parseInt(hours) * 100 + parseInt(minutes);
};

// Format time for display (e.g., "9:00 AM")
export const formatTime = (hour) => {
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:00 ${ampm}`;
};