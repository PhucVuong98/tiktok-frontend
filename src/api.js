// Lớp gọi API có xác thực: tự đính kèm Firebase ID token, tự bật modal đăng nhập
// khi chưa login, và dịch lỗi 401/402 sang thông báo tiếng Việt rõ ràng.
import { auth } from './firebase'
import { store } from './store'

export const BASE_URL = 'https://tiktok-ai-backend-mq3e.onrender.com'

// Lỗi có cờ riêng để component biết đây là "cần đăng nhập" / "hết credit" mà xử lý UX phù hợp.
export class ApiError extends Error {
  constructor(message, { needAuth = false, noCredit = false } = {}) {
    super(message)
    this.needAuth = needAuth
    this.noCredit = noCredit
  }
}

// fetch kèm Authorization: Bearer <idToken>. Dùng cho mọi endpoint tốn phí.
export async function authedFetch(path, opts = {}) {
  const u = auth.currentUser
  if (!u) {
    store.showAuth = true
    throw new ApiError('Cần đăng nhập để dùng tính năng này.', { needAuth: true })
  }
  const token = await u.getIdToken()
  const res = await fetch(`${BASE_URL}${path}`, {
    ...opts,
    headers: { ...(opts.headers || {}), Authorization: `Bearer ${token}` },
  })
  if (res.status === 401) {
    store.showAuth = true
    throw new ApiError('Phiên đăng nhập hết hạn, đăng nhập lại nhé.', { needAuth: true })
  }
  if (res.status === 402) {
    const d = await res.json().catch(() => ({}))
    throw new ApiError(d.detail || 'Bạn đã hết credit.', { noCredit: true })
  }
  return res
}

// Đồng bộ số credit về store (chỉ khi đã đăng nhập).
export async function refreshCredits() {
  if (!auth.currentUser) {
    store.credits = null
    return
  }
  try {
    const res = await authedFetch('/api/me')
    if (res.ok) {
      const d = await res.json()
      store.credits = d.credits
    }
  } catch {
    /* im lặng — không chặn UI nếu lỗi mạng tạm thời */
  }
}
