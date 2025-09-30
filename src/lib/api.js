
const DEFAULT_HEADERS = {
  Accept: 'application/json'
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') || '';

let authToken = null;

export const setAuthToken = (token) => {
  authToken = token || null;
};

function buildUrl(path) {
  if (!path) {
    throw new Error('A request path is required.');
  }

  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  if (!API_BASE_URL) {
    throw new Error('VITE_API_BASE_URL is not configured.');
  }

  return `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

async function parseJsonResponse(response) {
  const text = await response.text();
  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch (error) {
    const parseError = new Error('Failed to parse server response as JSON.');
    parseError.cause = error;
    throw parseError;
  }
}

async function request(path, options = {}) {
  const url = buildUrl(path);
  const headers = {
    ...DEFAULT_HEADERS,
    ...(options.headers ?? {})
  };

  const hasBody = options.body !== undefined && options.body !== null;

  if (hasBody && !(headers['Content-Type'] || headers['content-type'])) {
    headers['Content-Type'] = 'application/json';
  }

  if (authToken && !headers.Authorization) {
    headers.Authorization = authToken.startsWith('Bearer ')
      ? authToken
      : `Bearer ${authToken}`;
  }

  const fetchOptions = {
    method: options.method ?? (hasBody ? 'POST' : 'GET'),
    ...options,
    headers,
    body: hasBody && typeof options.body !== 'string'
      ? JSON.stringify(options.body)
      : options.body
  };

  const response = await fetch(url, fetchOptions);
  const payload = await parseJsonResponse(response);

  if (!response.ok) {
    const error = new Error(payload?.message || response.statusText);
    error.status = response.status;
    error.data = payload;
    throw error;
  }

  return payload?.data ?? payload;
}

const apiClient = {
  request,
  get: (path, options = {}) => request(path, { ...options, method: 'GET' }),
  post: (path, body, options = {}) => request(path, { ...options, method: 'POST', body }),
  put: (path, body, options = {}) => request(path, { ...options, method: 'PUT', body }),
  patch: (path, body, options = {}) => request(path, { ...options, method: 'PATCH', body }),
  delete: (path, options = {}) => request(path, { ...options, method: 'DELETE' })
};

export default apiClient;
