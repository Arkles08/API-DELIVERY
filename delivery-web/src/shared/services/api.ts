const CONFIGURED_API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api/v1';
const FALLBACK_API_BASE_URL = CONFIGURED_API_BASE_URL.startsWith('http') ? '/api/v1' : 'http://127.0.0.1:8010/api/v1';

async function readErrorMessage(response: Response): Promise<string> {
  try {
    const payload = (await response.json()) as { detail?: unknown; message?: unknown };

    if (typeof payload.detail === 'string') {
      return payload.detail;
    }

    if (Array.isArray(payload.detail)) {
      const firstDetail = payload.detail[0] as { msg?: string } | undefined;
      if (firstDetail?.msg) {
        return firstDetail.msg;
      }
      return 'Falha de validação na API.';
    }

    if (payload.detail && typeof payload.detail === 'object') {
      const detailWithMessage = payload.detail as { message?: string };
      if (typeof detailWithMessage.message === 'string') {
        return detailWithMessage.message;
      }
      return 'Falha inesperada na API';
    }

    if (typeof payload.message === 'string') {
      return payload.message;
    }

    return 'Falha inesperada na API';
  } catch {
    return 'Falha inesperada na API';
  }
}

async function fetchJson<T>(baseUrl: string, path: string, init?: RequestInit): Promise<T> {
  const headers: HeadersInit = {
    ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
    ...(init?.headers ?? {}),
  };

  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers,
  });

  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  try {
    return await fetchJson<T>(CONFIGURED_API_BASE_URL, path, init);
  } catch (error) {
    if (error instanceof TypeError) {
      return await fetchJson<T>(FALLBACK_API_BASE_URL, path, init);
    }

    throw error;
  }
}
