// src/services/api.ts
import { storageService } from './storageService';

const ENV_API_URL = (import.meta as unknown as { env?: Record<string, string> }).env
  ?.VITE_API_URL;

export const API_BASE_URL = (ENV_API_URL || 'http://localhost:5000/api').replace(
  /\/$/,
  ''
);

export class ApiError extends Error {
  status: number;
  code: string;
  isNetworkError: boolean;
  fieldErrors?: Record<string, string>;

  constructor(
    message: string,
    status = 0,
    code = 'API_ERROR',
    isNetworkError = false,
    fieldErrors?: Record<string, string>
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.isNetworkError = isNetworkError;
    this.fieldErrors = fieldErrors;
  }
}

export function getStoredAccessToken(): string | null {
  const fromLocal = storageService.getItem<string | null>('access_token', null);
  if (fromLocal) return fromLocal;
  try {
    const fromSession = sessionStorage.getItem('prepai_access_token');
    return fromSession ? (JSON.parse(fromSession) as string) : null;
  } catch {
    return null;
  }
}

export function setStoredAccessToken(token: string, persistent = true): void {
  if (persistent) {
    storageService.setItem('access_token', token);
    try {
      sessionStorage.removeItem('prepai_access_token');
    } catch {
      // Ignore
    }
  } else {
    storageService.removeItem('access_token');
    try {
      sessionStorage.setItem('prepai_access_token', JSON.stringify(token));
    } catch {
      // Ignore
    }
  }
}

export function clearStoredAccessToken(): void {
  storageService.removeItem('access_token');
  try {
    sessionStorage.removeItem('prepai_access_token');
  } catch {
    // Ignore
  }
}

async function attemptTokenRefresh(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) return false;
    const data = (await res.json()) as { accessToken?: string };
    if (data.accessToken) {
      const hasLocal = Boolean(storageService.getItem<string | null>('access_token', null));
      setStoredAccessToken(data.accessToken, hasLocal);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

export interface ApiRequestOptions extends RequestInit {
  skipAuth?: boolean;
  retryOnUnauthorized?: boolean;
}

export async function apiRequest<T>(
  endpoint: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  const { skipAuth = false, retryOnUnauthorized = true, headers, body, ...rest } = options;
  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
  const token = skipAuth ? null : getStoredAccessToken();

  const requestHeaders: Record<string, string> = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(headers as Record<string, string> | undefined),
  };

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...rest,
      body,
      credentials: 'include',
      headers: requestHeaders,
    });
  } catch {
    throw new ApiError(
      'Unable to connect to the PrepAI backend server. Ensure the API server is running.',
      0,
      'NETWORK_ERROR',
      true
    );
  }

  if (response.status === 401 && !skipAuth && retryOnUnauthorized) {
    const refreshed = await attemptTokenRefresh();
    if (refreshed) {
      return apiRequest<T>(endpoint, { ...options, retryOnUnauthorized: false });
    }
  }

  let data: Record<string, unknown> = {};
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    try {
      data = (await response.json()) as Record<string, unknown>;
    } catch {
      data = {};
    }
  }

  if (!response.ok) {
    const message =
      (typeof data.message === 'string' && data.message) ||
      (typeof data.error === 'string' && data.error) ||
      `Request failed with status ${response.status}.`;
    const code = typeof data.code === 'string' ? data.code : 'API_ERROR';
    const fieldErrors =
      data.errors && typeof data.errors === 'object' && !Array.isArray(data.errors)
        ? (data.errors as Record<string, string>)
        : undefined;

    throw new ApiError(message, response.status, code, false, fieldErrors);
  }

  return data as T;
}

export async function apiDownloadBlob(endpoint: string): Promise<Blob> {
  const token = getStoredAccessToken();
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'GET',
    credentials: 'include',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  if (!response.ok) {
    throw new ApiError(`Failed to download file (status ${response.status}).`, response.status);
  }
  return response.blob();
}
