export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export async function fetchJSON<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
    ...options,
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Request ${path} failed: ${res.status} ${res.statusText} – ${body}`);
  }
  return res.json();
}
