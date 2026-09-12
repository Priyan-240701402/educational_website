const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

function getOrCreateClientId() {
  if (typeof window === 'undefined') return 'server_render';
  let clientId = localStorage.getItem('portal_client_id');
  if (!clientId) {
    clientId = 'client_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
    try {
      localStorage.setItem('portal_client_id', clientId);
    } catch {}
  }
  return clientId;
}

export async function api(path, options = {}) {
  const { headers, ...restOptions } = options;
  const clientId = getOrCreateClientId();

  const response = await fetch(`${API_URL}${path}`, {
    ...restOptions,
    headers: {
      'Content-Type': 'application/json',
      'X-Client-Id': clientId,
      ...headers,
    },
  });

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.message || 'Unable to complete this request.');
  }

  // If payload contains pagination metadata, return an object with data and pagination
  if (payload.pagination) {
    return {
      data: payload.data,
      pagination: payload.pagination
    };
  }

  return payload.data;
}

export function apiUrl(path) {
  return `${API_URL}${path}`;
}

export function triggerEnquiryModal(prefill = {}) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('open-enquiry-modal', { detail: prefill }));
  }
}
