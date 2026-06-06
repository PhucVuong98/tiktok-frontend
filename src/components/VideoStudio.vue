<template>
  <section class="py-16 px-8 bg-black text-white min-h-screen">
    <div class="max-w-3xl mx-auto">
      <div class="text-center mb-10">
        <h2 class="text-4xl font-black uppercase tracking-tight mb-2">🎬 Tạo Video TikTok</h2>
        <p class="text-gray-400">AI biến kịch bản thành <b class="text-white">hội thoại 2 nhân vật</b> (mỗi người một giọng) + cảnh động + caption → video 9:16. Mất ~1–2 phút.</p>
      </div>

      <div class="bg-[#111] rounded-3xl border border-gray-800 p-8 space-y-6">
        <!-- Script -->
        <div>
          <label class="text-xs text-gray-400 font-bold uppercase tracking-widest mb-2 block">Script / Lời thoại</label>
          <textarea
            v-model="script"
            rows="6"
            placeholder="Dán hoặc nhập script bạn muốn đọc trong video..."
            class="w-full bg-black border border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-200 focus:outline-none focus:border-white resize-none placeholder-gray-600"
          />
        </div>

        <!-- Product image + name -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="text-xs text-gray-400 font-bold uppercase tracking-widest mb-2 block">Link ảnh sản phẩm</label>
            <input
              v-model="productImage"
              type="url"
              placeholder="https://..."
              class="w-full bg-black border border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-200 focus:outline-none focus:border-white placeholder-gray-600"
            />
          </div>
          <div>
            <label class="text-xs text-gray-400 font-bold uppercase tracking-widest mb-2 block">Tên sản phẩm</label>
            <input
              v-model="productName"
              type="text"
              placeholder="Tên hiển thị trên video"
              class="w-full bg-black border border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-200 focus:outline-none focus:border-white placeholder-gray-600"
            />
          </div>
        </div>

        <!-- Preview ảnh -->
        <div v-if="productImage" class="flex justify-center">
          <img :src="productImage" alt="preview" class="h-32 rounded-xl object-cover border border-gray-700" />
        </div>

        <!-- Persona pickers: 2 nhân vật hội thoại -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="text-xs text-gray-400 font-bold uppercase tracking-widest mb-2 block">Nhân vật A</label>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="p in personas"
                :key="'a-' + p.id"
                @click="personaA = p.id"
                :class="personaA === p.id ? 'bg-white text-black' : 'bg-[#222] text-gray-400 hover:text-white border border-gray-700'"
                class="px-3 py-1.5 rounded-full text-xs font-bold transition"
              >
                {{ p.emoji }} {{ p.name }}
              </button>
            </div>
          </div>
          <div>
            <label class="text-xs text-gray-400 font-bold uppercase tracking-widest mb-2 block">Nhân vật B</label>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="p in personas"
                :key="'b-' + p.id"
                @click="personaB = p.id"
                :class="personaB === p.id ? 'bg-white text-black' : 'bg-[#222] text-gray-400 hover:text-white border border-gray-700'"
                class="px-3 py-1.5 rounded-full text-xs font-bold transition"
              >
                {{ p.emoji }} {{ p.name }}
              </button>
            </div>
          </div>
        </div>
        <p v-if="personaA === personaB" class="text-amber-400 text-xs -mt-3">
          Đang chọn trùng nhân vật — hệ thống sẽ tự đổi Nhân vật B sang người khác để có 2 giọng.
        </p>

        <!-- Generate -->
        <button
          @click="generateVideo"
          :disabled="loadingVideo || !script.trim()"
          class="w-full bg-gradient-to-r from-pink-600 to-rose-500 text-white py-4 rounded-xl font-black text-sm hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <span v-if="loadingVideo" class="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></span>
          {{ loadingVideo ? `AI đang dựng video... ${elapsed}s (~1–2 phút)` : '🎬 Xuất Video TikTok' }}
        </button>

        <p v-if="statusMsg" class="text-amber-400 text-xs">{{ statusMsg }}</p>
        <p v-if="videoError" class="text-red-400 text-xs">{{ videoError }}</p>

        <!-- Result -->
        <div v-if="videoUrl" class="mt-2 space-y-3">
          <video :src="videoUrl" controls class="w-full rounded-xl" style="max-height: 480px; background:#000;" />
          <a
            :href="videoUrl"
            download="tiktok_video.mp4"
            class="block text-center text-xs font-bold bg-black border border-white text-white px-4 py-3 rounded-xl hover:bg-white hover:text-black transition"
          >
            Tải xuống MP4
          </a>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'
import { store } from '../store'

const BASE_URL = 'https://tiktok-ai-backend-mq3e.onrender.com'

// Danh sách nhân vật (khớp VOICE_PERSONAS ở backend, theo id).
const personas = [
  { id: 'genz',   emoji: '✨', name: 'Cô Nàng Gen Z' },
  { id: 'cool',   emoji: '😎', name: 'Anh Trai Cool' },
  { id: 'mc',     emoji: '⚡', name: 'MC Năng Động' },
  { id: 'chidai', emoji: '👑', name: 'Chị Đại Miền Nam' },
  { id: 'rapper', emoji: '🎤', name: 'Rapper Đường Phố' },
  { id: 'ballad', emoji: '🎵', name: 'Ca Sĩ Ballad' },
]

// Khởi tạo từ dữ liệu nháp gửi sang từ tab Script (nếu có).
// Component remount mỗi lần mở tab Video nên luôn lấy được draft mới nhất.
const script = ref(store.videoDraft.script)
const productImage = ref(store.videoDraft.productImage)
const productName = ref(store.videoDraft.productName)
const personaA = ref('genz')   // nhân vật A mặc định
const personaB = ref('cool')   // nhân vật B mặc định

const loadingVideo = ref(false)
const videoUrl = ref(null)
const videoError = ref('')
const statusMsg = ref('')   // thông báo trạng thái (không phải lỗi), vd "đang khởi động lại"
const elapsed = ref(0)      // số giây đã trôi qua, hiển thị để biết đang chạy

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

// Cơ chế JOB BẤT ĐỒNG BỘ — không còn phụ thuộc độ dài video.
// 1) POST tạo job -> nhận job_id ngay (request rất nhanh, không chạm timeout 100s).
// 2) Poll /video-status mỗi 3s tới khi 'done' hoặc 'error'.
// 3) GET /video-result tải MP4 về.

// POST khởi tạo job. Có timeout cứng 60s (chỉ cần đủ cho cold start ~20s).
const startJob = async () => {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 60000)
  try {
    const res = await fetch(`${BASE_URL}/api/generate-video`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        script: script.value,
        persona_a_id: personaA.value,
        persona_b_id: personaB.value,
        product_image_url: productImage.value,
        product_name: productName.value,
      }),
      signal: controller.signal,
    })
    if (!res.ok) {
      const detail = await res.text().catch(() => '')
      throw new Error(detail || `HTTP ${res.status}`)
    }
    const data = await res.json()
    if (!data.job_id) throw new Error('Server không trả về job_id')
    return data.job_id
  } finally {
    clearTimeout(timer)
  }
}

// Poll trạng thái tới khi xong. Tối đa ~10 phút (200 lần × 3s).
const pollUntilDone = async (jobId) => {
  for (let i = 0; i < 200; i++) {
    await sleep(3000)
    let res
    try {
      res = await fetch(`${BASE_URL}/api/video-status/${jobId}`)
    } catch {
      continue // lỗi mạng tạm thời -> thử lại vòng sau
    }
    if (res.status === 404) throw new Error('Job đã hết hạn, thử tạo lại nhé.')
    if (!res.ok) continue
    const data = await res.json()
    if (data.status === 'done') return
    if (data.status === 'error') throw new Error(data.error || 'Lỗi tạo video')
    // pending / processing -> tiếp tục chờ
  }
  throw new Error('Quá thời gian tạo video, thử lại nhé.')
}

const generateVideo = async () => {
  if (!script.value.trim()) return
  loadingVideo.value = true
  videoError.value = ''
  statusMsg.value = ''
  elapsed.value = 0
  const ticker = setInterval(() => { elapsed.value += 1 }, 1000)
  if (videoUrl.value) {
    URL.revokeObjectURL(videoUrl.value)
    videoUrl.value = null
  }

  try {
    // Khởi tạo job, thử lại 1 lần nếu server vừa ngủ dậy (lỗi mạng/cold start).
    statusMsg.value = 'Đang gửi yêu cầu...'
    let jobId
    for (let attempt = 1; ; attempt++) {
      try {
        jobId = await startJob()
        break
      } catch (err) {
        if ((err.name === 'TypeError' || err.name === 'AbortError') && attempt < 2) {
          statusMsg.value = 'Server đang khởi động, thử lại...'
          continue
        }
        throw err
      }
    }

    statusMsg.value = 'AI đang dựng video...'
    await pollUntilDone(jobId)

    statusMsg.value = 'Đang tải video...'
    const res = await fetch(`${BASE_URL}/api/video-result/${jobId}`)
    if (!res.ok) throw new Error('Không tải được video kết quả')
    const blob = await res.blob()
    videoUrl.value = URL.createObjectURL(blob)
    statusMsg.value = ''
  } catch (err) {
    if (err.name === 'AbortError') {
      videoError.value = 'Quá thời gian chờ khởi tạo. Thử lại nhé.'
    } else if (err.name === 'TypeError') {
      videoError.value = 'Không kết nối được server. Kiểm tra mạng rồi thử lại nhé.'
    } else {
      videoError.value = 'Tạo video thất bại: ' + (err.message || 'lỗi không xác định')
    }
    console.error(err)
  } finally {
    statusMsg.value = ''
    clearInterval(ticker)
    loadingVideo.value = false
  }
}
</script>
