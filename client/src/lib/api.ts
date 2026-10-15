import type { Settings } from "@/lib/ascii";

const BASE = import.meta.env.VITE_API_URL || "/api";
const KEY = "ascii_cam_token";

export const getToken = () => localStorage.getItem(KEY);
export const setToken = (t: string | null) => (t ? localStorage.setItem(KEY, t) : localStorage.removeItem(KEY));

export interface User { _id: string; name: string; email: string; role: "user" | "admin" }
export interface Artwork {
  _id: string; title: string; text?: string; thumbnail?: string; cols: number; rowCount: number;
  settings: Settings; sourceType: "camera" | "video" | "image"; isPublic: boolean; tags: string[];
  user: string | { _id: string; name: string }; createdAt: string;
}
export interface Preset { _id: string; name: string; settings: Settings }
export interface Faq { _id: string; question: string; answer: string }
export interface Page<T> { items: T[]; page: number; pages: number; total: number }
export type NewArtwork = Pick<Artwork, "title" | "text" | "thumbnail" | "cols" | "rowCount" | "settings" | "sourceType" | "isPublic" | "tags">;

export class ApiError extends Error {
  constructor(public status: number, message: string, public details?: { field: string; message: string }[]) {
    super(message);
  }
}

async function request<T>(path: string, method = "GET", body?: unknown): Promise<T> {
  const headers: Record<string, string> = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  let res: Response;
  try {
    res = await fetch(BASE + path, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) });
  } catch {
    throw new ApiError(0, "Cannot reach the server. Is the backend running?");
  }
  if (res.status === 204) return undefined as T;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(res.status, data?.error?.message || "Request failed", data?.error?.details);
  return data as T;
}

export const api = {
  register: (b: { name: string; email: string; password: string }) => request<{ token: string; user: User }>("/auth/register", "POST", b),
  login: (b: { email: string; password: string }) => request<{ token: string; user: User }>("/auth/login", "POST", b),
  me: () => request<{ user: User }>("/auth/me").then((r) => r.user),

  listArtworks: (q: { scope: "public" | "mine"; page: number; search?: string }) =>
    request<Page<Artwork>>(`/artworks?scope=${q.scope}&page=${q.page}&limit=12${q.search ? `&search=${encodeURIComponent(q.search)}` : ""}`),
  getArtwork: (id: string) => request<{ artwork: Artwork }>(`/artworks/${id}`).then((r) => r.artwork),
  createArtwork: (b: NewArtwork) => request<{ artwork: Artwork }>("/artworks", "POST", b).then((r) => r.artwork),
  updateArtwork: (id: string, b: Partial<Pick<Artwork, "title" | "isPublic" | "tags">>) => request<{ artwork: Artwork }>(`/artworks/${id}`, "PATCH", b).then((r) => r.artwork),
  deleteArtwork: (id: string) => request<void>(`/artworks/${id}`, "DELETE"),

  listPresets: () => request<{ items: Preset[] }>("/presets").then((r) => r.items),
  createPreset: (b: { name: string; settings: Settings }) => request<{ preset: Preset }>("/presets", "POST", b).then((r) => r.preset),
  deletePreset: (id: string) => request<void>(`/presets/${id}`, "DELETE"),

  faqs: () => request<{ items: Faq[] }>("/faqs").then((r) => r.items),
};

export const errorText = (e: unknown) =>
  e instanceof ApiError ? [e.message, ...(e.details?.map((d) => `${d.field}: ${d.message}`) ?? [])].join(" — ") : "Something went wrong.";
