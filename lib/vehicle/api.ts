const DEFAULT_API_BASE_URL = '';

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '') || DEFAULT_API_BASE_URL;

export async function fetchVehicleApi<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, init);
  if (!res.ok) {
    throw new Error(`Vehicle API request failed: ${path}`);
  }

  const json = await res.json();
  return (json.data ?? json) as T;
}

export async function fetchVehicleAppApi<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, init);
  if (!res.ok) {
    throw new Error(`Vehicle app API request failed: ${path}`);
  }

  const json = await res.json();
  return (json.data ?? json) as T;
}
