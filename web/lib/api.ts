function siteOrigin(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://127.0.0.1:3000";
}

export function getApiUrl(): string {
  if (typeof window !== "undefined") {
    return "";
  }
  return process.env.API_URL ?? siteOrigin();
}

export async function apiFetch<T>(
  path: string,
  init?: RequestInit & { token?: string },
): Promise<T> {
  const headers = new Headers(init?.headers);
  if (!headers.has("Content-Type") && init?.body) {
    headers.set("Content-Type", "application/json");
  }
  if (init?.token) {
    headers.set("Authorization", `Bearer ${init.token}`);
  }

  const base = getApiUrl();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);
  const response = await fetch(`${base}${path}`, {
    ...init,
    headers,
    cache: init?.cache ?? "no-store",
    signal: controller.signal,
  }).finally(() => clearTimeout(timeout));

  if (!response.ok) {
    let message = `API error ${response.status}`;
    try {
      const raw = await response.text();
      try {
        const payload = JSON.parse(raw) as { error?: string };
        message = payload.error ?? message;
      } catch {
        message = raw || message;
      }
    } catch {
      // keep default message
    }
    throw new Error(message);
  }

  return response.json() as Promise<T>;
}
