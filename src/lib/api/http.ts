import { ENV } from '@/constants/env';
import { ApiError, toApiError } from './errors';

type SessionTokenGetter = () => Promise<string | null>;

let getToken: SessionTokenGetter | null = null;

/** Injected by the auth provider so the client never imports auth state directly. */
export function configureApiAuth(getter: SessionTokenGetter): void {
  getToken = getter;
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body?: unknown;
  signal?: AbortSignal;
  skipAuth?: boolean;
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  if (!ENV.API_URL) {
    throw new ApiError('API URL is not configured. Set EXPO_PUBLIC_API_URL.', 'validation');
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ENV.API_TIMEOUT_MS);
  const externalSignal = options.signal;
  const signal = externalSignal
    ? anySignal([controller.signal, externalSignal])
    : controller.signal;

  try {
    const token = options.skipAuth ? null : await getToken?.().catch(() => null);
    const response = await fetch(`${ENV.API_URL}${path}`, {
      method: options.method ?? 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
      signal,
    });

    if (response.status === 401) throw ApiError.unauthorized();
    if (response.status === 404) throw ApiError.notFound();
    if (!response.ok) {
      const message = await safeMessage(response);
      throw new ApiError(message, 'server', response.status);
    }
    if (response.status === 204) return undefined as T;
    return (await response.json()) as T;
  } catch (error) {
    throw toApiError(error);
  } finally {
    clearTimeout(timer);
  }
}

async function safeMessage(response: Response): Promise<string> {
  try {
    const data = (await response.json()) as { message?: string; error?: string };
    return data.message ?? data.error ?? 'Something went wrong. Please try again.';
  } catch {
    return 'Something went wrong. Please try again.';
  }
}

function anySignal(signals: AbortSignal[]): AbortSignal {
  const controller = new AbortController();
  for (const signal of signals) {
    if (signal.aborted) {
      controller.abort();
      break;
    }
    signal.addEventListener('abort', () => controller.abort(), { once: true });
  }
  return controller.signal;
}
