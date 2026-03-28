import axios from 'axios';

// สร้าง axios instance ที่มีค่า default พร้อม
const api = axios.create({
  baseURL: 'http://localhost:5000', // ชี้ไป backend
});

// ── Request Interceptor ──────────────────────────────
// ทุก request จะผ่านตรงนี้ก่อน — แนบ token อัตโนมัติ
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Response Interceptor ─────────────────────────────
// ถ้าได้ 401 กลับมา = token หมดอายุ → ขอ token ใหม่อัตโนมัติ
api.interceptors.response.use(
  (response) => response, // ปกติ return เลย

  async (error) => {
    const originalRequest = error.config;

    // ถ้า 401 และยังไม่เคย retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) throw new Error('No refresh token');

        // ขอ access token ใหม่
        const res = await axios.post('http://localhost:5000/auth/refresh', {
          refreshToken,
        });

        const newToken = res.data.accessToken;
        localStorage.setItem('accessToken', newToken);

        // ส่ง request เดิมใหม่พร้อม token ใหม่
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);

      } catch (err) {
        // refresh token หมดอายุ → logout
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export default api;