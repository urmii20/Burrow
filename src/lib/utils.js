// Utility helpers keep formatting and DOM helpers reusable across the app.
export const toTitleFromSnake = (value, fallback = '') =>
  value
    ?.split('_')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ') || fallback;

// Formats basic dates with optional fallbacks for empty values.
export const formatDate = (value, fallback = 'Not available', options) => {
  if (!value) return fallback;
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? fallback
    : date.toLocaleDateString('en-IN', options);
};

// Formats a timestamp into a friendly date & time string.
export const formatDateTime = (value, fallback = 'Not available') => {
  if (!value) return fallback;
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? fallback
    : date.toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
};

// Formats destination address pieces into a single string.
export const formatAddress = (address, fallback = 'Destination address not available') => {
  if (!address || typeof address !== 'object') return fallback;
  const parts = [address.line1, address.line2, address.city, address.state]
    .map((part) => part?.trim())
    .filter(Boolean);
  return parts.length ? parts.join(', ') : fallback;
};

// Generates the downloadable receipt text block for a request.
export const buildReceiptText = (request) => {
  const payment = request.paymentDetails ?? {};
  const status = payment.paymentStatus ?? 'pending';
  const paymentStatus = status.charAt(0).toUpperCase() + status.slice(1);
  return [
    `Receipt for Request ${request.id}`,
    `Order Number: ${request.orderNumber}`,
    `Platform: ${request.platform}`,
    `Product: ${request.productDescription}`,
    '',
    'Payment Details:',
    `  Base Handling Fee: ₹${payment.baseHandlingFee ?? 0}`,
    `  Storage Fee: ₹${payment.storageFee ?? 0}`,
    `  Delivery Charge: ₹${payment.deliveryCharge ?? 0}`,
    `  GST: ₹${payment.gst ?? 0}`,
    `  Total Amount: ₹${payment.totalAmount ?? 0}`,
    `  Payment Method: ${payment.paymentMethod ?? 'Not specified'}`,
    `  Payment Status: ${paymentStatus}`,
    '',
    `Generated on: ${new Date().toLocaleString()}`
  ];
};

// Downloads a given blob using a temporary anchor element.
export const downloadBlob = (blob, fileName) => {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  anchor.rel = 'noopener noreferrer';
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
};

// Smoothly scrolls the page to an element when it exists.
export const scrollToElement = (elementId) => {
  const element = document.getElementById(elementId);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
};

// Removes a key from an error state object without cloning unnecessarily.
export const omitErrorKey = (setter, key) =>
  setter((previous) => {
    if (!previous?.[key]) return previous;
    const { [key]: _removed, ...rest } = previous;
    return rest;
  });
