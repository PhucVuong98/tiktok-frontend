<template>
  <section class="py-16 px-8 bg-black text-white min-h-screen">
    <div class="max-w-3xl mx-auto">
      <div class="text-center mb-10">
        <h2 class="text-4xl font-black uppercase tracking-tight mb-2">🎬 Tạo Video TikTok</h2>
        <p class="text-gray-400">AI dựng cảnh động (zoom/pan điện ảnh) + caption + voice thành video 9:16. Mất ~1–2 phút.</p>
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

        <!-- Voice picker -->
        <div>
          <label class="text-xs text-gray-400 font-bold uppercase tracking-widest mb-2 block">Giọng đọc</label>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="v in voices"
              :key="v.id"
              @click="selectedVoice = v.id"
              :class="selectedVoice === v.id ? 'bg-white text-black' : 'bg-[#222] text-gray-400 hover:text-white border border-gray-700'"
              class="px-4 py-1.5 rounded-full text-xs font-bold transition"
            >
              {{ v.label }}
            </button>
          </div>
        </div>

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

const voices = [
  { id: 'nova',    label: 'Nova — Nữ trẻ' },
  { id: 'shimmer', label: 'Shimmer — Nữ nhẹ nhàng' },
  { id: 'alloy',   label: 'Alloy — Nữ tự nhiên' },
  { id: 'onyx',    label: 'Onyx — Nam trầm' },
  { id: 'echo',    label: 'Echo — Nam rõ' },
]

// Khởi tạo từ dữ liệu nháp gửi sang từ tab Script (nếu có).
// Component remount mỗi lần mở tab Video nên luôn lấy được draft mới nhất.
const script = ref(store.videoDraft.script)
const productImage = ref(store.videoDraft.productImage)
const productName = ref(store.videoDraft.productName)
const selectedVoice = ref(store.videoDraft.voice || 'nova')

const loadingVideo = ref(false)
const videoUrl = ref(null)
const videoError = ref('')
const statusMsg = ref('')   // thông báo trạng thái (không phải lỗi), vd "đang khởi động lại"
const elapsed = ref(0)      // số giây đã trôi qua, hiển thị để biết đang chạy

// 4 phút: đủ cho cold start server (~20s) + dựng video (~60s) + biên độ an toàn.
const REQUEST_TIMEOUT = 240000

// Một lần gọi API có timeout cứng bằng AbortController, tránh treo vô hạn.
const fetchVideoOnce = async () => {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT)
  try {
    return await fetch(`${BASE_URL}/api/generate-video`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        script: script.value,
        voice: selectedVoice.value,
        product_image_url: productImage.value,
        product_name: productName.value,
      }),
      signal: controller.signal,
    })
  } finally {
    clearTimeout(timer)
  }
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

  let attempt = 0
  try {
    while (true) {
      attempt += 1
      try {
        const res = await fetchVideoOnce()
        if (!res.ok) {
          const detail = await res.text().catch(() => '')
          throw new Error(detail || `HTTP ${res.status}`)
        }
        const blob = await res.blob()
        videoUrl.value = URL.createObjectURL(blob)
        statusMsg.value = ''
        break
      } catch (err) {
        // TypeError = "Failed to fetch" (NET ERROR), thường do server free-tier
        // vừa ngủ dậy -> thử lại đúng 1 lần. Timeout thật (AbortError) thì không
        // lặp để khỏi đợi thêm 4 phút nữa.
        if (err.name === 'TypeError' && attempt < 2) {
          statusMsg.value = 'Server đang khởi động, tự thử lại...'
          continue
        }
        throw err
      }
    }
  } catch (err) {
    if (err.name === 'AbortError') {
      videoError.value = 'Quá thời gian chờ (server có thể đang quá tải). Thử lại sau giây lát nhé.'
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
