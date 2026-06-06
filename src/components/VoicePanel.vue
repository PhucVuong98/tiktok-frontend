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

    <!-- Gửi sang tab Video (giữ nguyên giọng đã chọn ở trên) -->
    <button
      @click="sendToVideo({ script, productImage, productName, voice: selectedVoice })"
      class="w-full bg-gradient-to-r from-pink-600 to-rose-500 text-white py-3 rounded-xl font-bold text-sm hover:opacity-90 transition flex items-center justify-center gap-2"
    >
      🎬 Gửi sang tab Video
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { sendToVideo } from '../store'
import { authedFetch, ApiError } from '../api'

const props = defineProps({
  script: String,
  productImage: { type: String, default: '' },
  productName: { type: String, default: '' },
})

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

const generateVoice = async () => {
  loadingVoice.value = true
  errorMsg.value = ''
  if (audioUrl.value) {
    URL.revokeObjectURL(audioUrl.value)
    audioUrl.value = null
  }
  try {
    const res = await authedFetch('/api/generate-voice', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ script: props.script, voice: selectedVoice.value })
    })
    if (!res.ok) throw new Error(await res.text())
    const blob = await res.blob()
    audioUrl.value = URL.createObjectURL(blob)
  } catch (err) {
    errorMsg.value = err instanceof ApiError ? err.message : 'Tạo voice thất bại, thử lại nhé.'
    console.error(err)
  } finally {
    loadingVoice.value = false
  }
}
</script>
