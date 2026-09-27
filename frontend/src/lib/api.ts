const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api/v1'

export class ApiError extends Error {
  status: number
  // FastAPI's `detail` when it's a plain sentence meant for people (domain errors).
  detail: string | null

  constructor(status: number, message: string, detail: string | null) {
    super(message)
    this.status = status
    this.detail = detail
  }
}

async function readDetail(response: Response): Promise<string | null> {
  try {
    const body: unknown = await response.json()
    if (typeof body === 'object' && body !== null && 'detail' in body && typeof body.detail === 'string') {
      return body.detail
    }
  } catch {
    // Not JSON (e.g. a proxy error page); fall through.
  }
  return null
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  })

  if (!response.ok) {
    const detail = await readDetail(response)
    throw new ApiError(response.status, `${response.status} ${response.statusText}`, detail)
  }

  return response.json() as Promise<T>
}
