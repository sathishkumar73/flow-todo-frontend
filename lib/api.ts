const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(
  path: string,
  token: string | null,
  init?: RequestInit
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...((init?.headers ?? {}) as Record<string, string>),
  };

  const res = await fetch(`${API_URL}${path}`, { ...init, headers });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(res.status, body.detail ?? "Request failed");
  }

  return res.json() as Promise<T>;
}

export function createApi(getToken: () => Promise<string | null>) {
  return {
    get<T>(path: string) {
      return getToken().then((t) => request<T>(path, t));
    },
    post<T>(path: string, body: unknown) {
      return getToken().then((t) =>
        request<T>(path, t, { method: "POST", body: JSON.stringify(body) })
      );
    },
    patch<T>(path: string, body: unknown) {
      return getToken().then((t) =>
        request<T>(path, t, { method: "PATCH", body: JSON.stringify(body) })
      );
    },
    delete<T>(path: string) {
      return getToken().then((t) => request<T>(path, t, { method: "DELETE" }));
    },
  };
}
