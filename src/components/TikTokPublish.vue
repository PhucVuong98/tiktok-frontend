<template>
  <div class="border border-gray-800 rounded-2xl p-4 bg-[#0c0c0c]">
    <div class="text-xs text-gray-400 font-bold uppercase tracking-widest mb-3">Đăng lên TikTok</div>

    <!-- Backend chưa cấu hình TikTok -->
    <p v-if="configured === false" class="text-amber-500 text-xs">
      Tính năng đăng TikTok chưa được bật trên server (thiếu cấu hình app TikTok).
    </p>

    <template v-else>
      <!-- Chưa kết nối -->
      <div v-if="!connected">
        <p class="text-gray-500 text-xs mb-3">Kết nối tài khoản TikTok của bạn để đăng video trực tiếp.</p>
        <button @click="connect" :disabled="busy"
          class="w-full bg-white text-black py-3 rounded-xl font-bold text-sm hover:bg-gray-200 transition disabled:opacity-50">
          {{ busy ? 'Đang mở TikTok...' : '🔗 Kết nối TikTok' }}
        </button>
      </div>

      <!-- Đã kết nối -->
      <div v-else class="space-y-3">
        <input v-model="title" type="text" maxlength="150"
          placeholder="Tiêu đề / caption cho video TikTok"
          class="w-full bg-black border border-gray-700 rounded-xl px-3 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-white placeholder-gray-600" />
        <button @click="publish" :disabled="busy || !jobId"
          class="w-full bg-gradient-to-r from-pink-600 to-rose-500 text-white py-3 rounded-xl font-black text-sm hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2">
          <span v-if="busy" class="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></span>
          {{ busy ? 'Đang đăng...' : '📤 Đăng lên TikTok' }}
        </button>
        <button @click="disconnect" :disabled="busy"
          class="text-xs text-gray-500 hover:text-red-400 transition">Ngắt kết nối</button>
      </div>

      <p v-if="msg" :class="msgErr ? 'text-red-400' : 'text-green-400'" class="text-xs mt-2">{{ msg }}</p>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { authedFetch, ApiError } from '../api'

const props = defineProps({ jobId: { type: String, default: '' } })

const configured = ref(null)   // null=chưa biết, true/false
const connected = ref(false)
const busy = ref(false)
const title = ref('')
const msg = ref('')
const msgErr = ref(false)

const setMsg = (t, err = false) => { msg.value = t; msgErr.value = err }

const refreshStatus = async () => {
  try {
    const res = await authedFetch('/api/tiktok/status')
    if (res.ok) {
      const d = await res.json()
      configured.value = d.configured
      connected.value = d.connected
    }
  } catch { /* im lặng */ }
}

// Nhận tín hiệu từ popup OAuth (App.vue/popup postMessage khi quay về ?tiktok=...)
const onMessage = (e) => {
  if (e.data && e.data.tiktok) {
    if (e.data.tiktok === 'connected') { setMsg('Đã kết nối TikTok ✓'); refreshStatus() }
    else if (e.data.tiktok === 'expired') setMsg('Phiên kết nối hết hạn, thử lại nhé.', true)
    else setMsg('Kết nối TikTok thất bại, thử lại nhé.', true)
  }
}

onMounted(() => { refreshStatus(); window.addEventListener('message', onMessage) })
onBeforeUnmount(() => window.removeEventListener('message', onMessage))

const connect = async () => {
  busy.value = true; setMsg('')
  try {
    const res = await authedFetch('/api/tiktok/auth-url')
    if (!res.ok) throw new Error('Không lấy được liên kết TikTok')
    const { auth_url } = await res.json()
    // Mở popup để giữ nguyên trang (video đang xem không mất). Bị chặn -> redirect cả trang.
    const popup = window.open(auth_url, 'tiktok_oauth', 'width=600,height=720')
    if (!popup) window.location.href = auth_url
  } catch (err) {
    setMsg(err instanceof ApiError ? err.message : 'Không kết nối được TikTok.', true)
  } finally {
    busy.value = false
  }
}

const publish = async () => {
  if (!props.jobId) return
  busy.value = true; setMsg('')
  try {
    const res = await authedFetch('/api/tiktok/publish', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ job_id: props.jobId, title: title.value, public: true }),
    })
    const d = await res.json().catch(() => ({}))
    if (res.status === 401) { connected.value = false; throw new Error(d.detail || 'Phiên TikTok hết hạn, kết nối lại nhé.') }
    if (!res.ok) throw new Error(d.detail || 'Đăng TikTok thất bại')
    setMsg(d.note || 'Đã gửi video lên TikTok ✓')
  } catch (err) {
    setMsg(err instanceof ApiError ? err.message : (err.message || 'Đăng TikTok thất bại'), true)
  } finally {
    busy.value = false
  }
}

const disconnect = async () => {
  busy.value = true
  try {
    await authedFetch('/api/tiktok/disconnect', { method: 'POST' })
    connected.value = false; setMsg('Đã ngắt kết nối TikTok.')
  } catch { /* im lặng */ } finally { busy.value = false }
}
</script>
