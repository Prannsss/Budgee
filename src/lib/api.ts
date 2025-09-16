type RequestOptions = RequestInit & { json?: any };

export async function api(path: string, options: RequestOptions = {}) {
  const { json, headers, ...rest } = options;
  const res = await fetch(path, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(headers || {}),
    },
    ...(json !== undefined ? { body: JSON.stringify(json), method: options.method || 'POST' } : rest),
  });

  const contentType = res.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  const data = isJson ? await res.json() : null;

  if (!res.ok) {
    const message = data?.error?.message || `Request failed with ${res.status}`;
    throw new Error(message);
  }

  return data?.data ?? data;
}


