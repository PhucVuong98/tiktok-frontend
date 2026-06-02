<template>
  <div class="border-t border-gray-700 pt-5">
    <p class="text-xs text-gray-400 font-bold uppercase tracking-widest mb-3">🎙️ Voice Script</p>

    <div class="flex flex-wrap gap-2 mb-4">
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

    <button
      @click="generateVoice"
      :disabled="loadingVoice"
      class="w-full bg-white text-black py-3 rounded-xl font-bold text-sm hover:bg-gray-200 transition disabled:opacity-50 mb-4 flex items-center justify-center gap-2"
    >
      <span v-if="loadingVoice" class="w-4 h-4 border-2 border-gray-400 border-t-black rounded-full animate-spin"></span>
      {{ loadingVoice ? 'Đang tạo giọng đọc...' : '🎙️ Tạo Voice' }}
    </button>

    <!-- Audio player -->
    <div v-if="audioUrl" class="bg-black rounded-xl p-4 border border-gray-700 mb-4">
      <audio :src="audioUrl" controls class="w-full mb-3" />
      <a
        :href="audioUrl"
        download="voice_script.mp3"
        class="block text-center text-xs font-bold bg-white text-black px-4 py-2 rounded-full hover:bg-gray-200 transition"
      >
        Tải xuống MP3
      </a>
    </div>

    <p v-if="errorMsg" class="text-red-400 text-xs mt-2 mb-4">{{ errorMsg }}</p>

    <!-- Video section -->
    <div class="border-t border-gray-700 pt-5">
      <p class="text-xs text-gray-400 font-bold uppercase tracking-widest mb-3">🎬 Video TikTok</p>
      <p class="text-xs text-gray-500 mb-4">Tạo video 9:16 gồm ảnh sản phẩm + caption + voice. Mất ~30 giây.</p>

      <button
        @click="generateVideo"
        :disabled="loadingVideo"
        class="w-full bg-gradient-to-r from-pink-600 to-rose-500 text-white py-3 rounded-xl font-bold text-sm hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2"
      >
        <span v-if="loadingVideo" class="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></span>
        {{ loadingVideo ? 'Đang tạo video (~30s)...' : '🎬 Xuất Video TikTok' }}
      </button>

      <div v-if="videoUrl" class="mt-4 space-y-3">
        <video :src="videoUrl" controls class="w-full rounded-xl" style="max-height: 320px; background:#000;" />
        <a
          :href="videoUrl"
          download="tiktok_video.mp4"
          class="block text-center text-xs font-bold bg-black border border-white text-white px-4 py-3 rounded-xl hover:bg-white hover:text-black transition"
        >
          Tải xuống MP4
        </a>
      </div>

      <p v-if="videoError" class="text-red-400 text-xs mt-2">{{ videoError }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  script: String,
  productImage: { type: String, default: '' },
  productName: { type: String, default: '' },
})

const BASE_URL = 'https://tiktok-ai-backend-mq3e.onrender.com'

const voices = [
  { id: 'nova',    label: 'Nova — Nữ trẻ' },
  { id: 'shimmer', label: 'Shimmer — Nữ nhẹ nhàng' },
  { id: 'alloy',   label: 'Alloy — Nữ tự nhiên' },
  { id: 'onyx',    label: 'Onyx — Nam trầm' },
  { id: 'echo',    label: 'Echo — Nam rõ' },
]

const selectedVoice = ref('nova')
const loadingVoice = ref(false)
const audioUrl = ref(null)
const errorMsg = ref('')

const loadingVideo = ref(false)
const videoUrl = ref(null)
const videoError = ref('')

const generateVoice = async () => {
  loadingVoice.value = true
  errorMsg.value = ''
  if (audioUrl.value) {
    URL.revokeObjectURL(audioUrl.value)
    audioUrl.value = null
  }
  try {
    const res = await fetch(`${BASE_URL}/api/generate-voice`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ script: props.script, voice: selectedVoice.value })
    })
    if (!res.ok) throw new Error(await res.text())
    const blob = await res.blob()
    audioUrl.value = URL.createObjectURL(blob)
  } catch (err) {
    errorMsg.value = 'Tạo voice thất bại, thử lại nhé.'
    console.error(err)
  } finally {
    loadingVoice.value = false
  }
}

const generateVideo = async () => {
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
        script: props.script,
        voice: selectedVoice.value,
        product_image_url: props.productImage,
        product_name: props.productName,
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
