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
          {{ loadingVideo ? 'AI đang dựng video (~1–2 phút)...' : '🎬 Xuất Video TikTok' }}
        </button>

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

const generateVideo = async () => {
  if (!script.value.trim()) return
  loadingVideo.value = true
  videoError.value = ''
  if (videoUrl.value) {
    URL.revokeObjectURL(videoUrl.value)
    videoUrl.value = null
  }
  try {
    const res = await fetch(`${BASE_URL}/api/generate-video`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        script: script.value,
        voice: selectedVoice.value,
        product_image_url: productImage.value,
        product_name: productName.value,
      })
    })
    if (!res.ok) throw new Error(await res.text())
    const blob = await res.blob()
    videoUrl.value = URL.createObjectURL(blob)
  } catch (err) {
    videoError.value = 'Tạo video thất bại, thử lại nhé.'
    console.error(err)
  } finally {
    loadingVideo.value = false
  }
}
</script>
