/**
 * Generate a stable device fingerprint based on browser properties.
 * This is used for anti-proxy enforcement on the backend.
 * @returns {string} unique device ID
 */
export const getDeviceId = () => {
  const stored = localStorage.getItem('qp_device_id');
  if (stored) return stored;

  // Build a fingerprint from browser properties
  const components = [
    navigator.userAgent,
    navigator.language,
    screen.colorDepth,
    screen.width,
    screen.height,
    new Date().getTimezoneOffset(),
    navigator.hardwareConcurrency,
    navigator.platform,
  ].join('|');

  // Simple hash function (non-cryptographic, for fingerprinting only)
  let hash = 0;
  for (let i = 0; i < components.length; i++) {
    const char = components.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  // Add a random suffix to ensure uniqueness even on identical machines
  const deviceId = `${Math.abs(hash).toString(36)}-${Math.random().toString(36).substr(2, 9)}`;
  localStorage.setItem('qp_device_id', deviceId);
  return deviceId;
};

/**
 * Format a date object to a readable string
 * @param {Date|string} date
 * @returns {string}
 */
export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Format a date to show time
 * @param {Date|string} date
 * @returns {string}
 */
export const formatTime = (date) => {
  return new Date(date).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Get color class for attendance percentage
 * @param {number} pct
 * @returns {string}
 */
export const getAttendanceColor = (pct) => {
  if (pct >= 75) return 'text-success';
  if (pct >= 50) return 'text-warning';
  return 'text-danger';
};

/**
 * Get progress fill color class for attendance bar
 * @param {number} pct
 * @returns {string}
 */
export const getProgressColor = (pct) => {
  if (pct >= 75) return 'bg-success';
  if (pct >= 50) return 'bg-warning';
  return 'bg-danger';
};

/**
 * Truncate long text
 * @param {string} text
 * @param {number} maxLength
 */
export const truncate = (text, maxLength = 60) => {
  if (!text) return '';
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
};
