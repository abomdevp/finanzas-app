/**
 * Formats a number as Chilean Peso (CLP)
 * Example: 123456 -> $123.456
 */
export const formatCLP = (amount) => {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

/**
 * Generates a simple UUID for records
 */
export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

/**
 * Gets the current month key (e.g. "2024-04")
 */
export const getCurrentMonthKey = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};
/**
 * Formats a date string with day name
 * Example: "2024-04-29" -> "Lunes 29 de abril"
 */
export const formatDateWithDay = (dateString) => {
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  const options = { weekday: 'long', day: 'numeric', month: 'long' };
  return new Intl.DateTimeFormat('es-CL', options).format(date);
};
