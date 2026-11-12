// ============================================================
// 🌐 api.ts — Cấu hình API Client tập trung cho Nexus Auto Frontend
// ============================================================

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') || 'http://localhost:5000';

export async function apiFetch<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = endpoint.startsWith('http')
    ? endpoint
    : `${API_BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  const headers = new Headers(options.headers || {});

  // Nếu body là JSON object (không phải FormData), tự động gắn Content-Type
  if (
    options.body &&
    !(options.body instanceof FormData) &&
    !headers.has('Content-Type')
  ) {
    headers.set('Content-Type', 'application/json');
  }

  // Tự động đính kèm token từ localStorage nếu có (bên cạnh HttpOnly Cookie)
  const token = localStorage.getItem('admin_token');
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include', // Luôn gửi HttpOnly cookie kèm theo request
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const errorMessage =
      data?.error ||
      data?.message ||
      `Lỗi yêu cầu máy chủ: ${response.status} ${response.statusText}`;
    throw new Error(errorMessage);
  }

  return data as T;
}
