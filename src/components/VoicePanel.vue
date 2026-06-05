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
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  script: String,
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
</script>
