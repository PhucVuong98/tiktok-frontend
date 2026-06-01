<template>
  <section class="py-16 px-8 bg-black text-white">
    <div class="max-w-5xl mx-auto">
      <div class="text-center mb-10">
        <h2 class="text-4xl font-black uppercase tracking-tight mb-2">Tạo Kịch Bản Affiliate</h2>
        <p class="text-gray-400">Dán link Shopee hoặc TikTok Shop. AI sẽ lo phần còn lại.</p>
      </div>

      <!-- Mode toggle -->
      <div class="flex justify-center mb-8">
        <div class="bg-[#111] border border-gray-700 rounded-full p-1 flex gap-1">
          <button @click="mode = 'single'"
            :class="mode === 'single' ? 'bg-white text-black' : 'text-gray-400 hover:text-white'"
            class="px-5 py-2 rounded-full text-sm font-bold transition">
            1 Kịch Bản
          </button>
          <button @click="mode = 'persona'"
            :class="mode === 'persona' ? 'bg-white text-black' : 'text-gray-400 hover:text-white'"
            class="px-5 py-2 rounded-full text-sm font-bold transition">
            3 Nhân Vật ✨
          </button>
          <button @click="mode = 'dialogue'"
            :class="mode === 'dialogue' ? 'bg-white text-black' : 'text-gray-400 hover:text-white'"
            class="px-5 py-2 rounded-full text-sm font-bold transition">
            🎭 Hội Thoại + Voice
          </button>
        </div>
      </div>

      <!-- Form -->
      <form @submit.prevent="generate" class="bg-white rounded-3xl p-2 flex flex-col md:flex-row shadow-2xl mb-12">
        <input v-model="productUrl" type="url"
          placeholder="Nhập link sản phẩm Shopee / TikTok Shop..."
          class="flex-1 px-6 py-4 rounded-2xl text-black focus:outline-none placeholder-gray-500" required />
        <select v-if="mode === 'single'" v-model="tone"
          class="bg-gray-100 text-black px-6 py-4 rounded-xl mx-2 font-medium focus:outline-none">
          <option value="Hài hước">Hài hước</option>
          <option value="Đánh giá chân thực">Đánh giá chân thực</option>
          <option value="Drama">Drama / Vạch trần</option>
        </select>
        <button type="submit" :disabled="loading"
          class="bg-black text-white px-8 py-4 rounded-2xl font-bold hover:bg-gray-800 transition disabled:opacity-50 whitespace-nowrap">
          {{ loading ? 'Đang viết...' : 'Tạo Kịch Bản' }}
        </button>
      </form>

      <!-- Kết quả: single -->
      <div v-if="mode === 'single' && result" class="bg-[#111] p-8 rounded-2xl border border-gray-800">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-xl font-bold">Kịch bản của bạn:</h3>
          <button @click="copyText(result.script)" class="text-xs bg-white text-black px-3 py-1 rounded-full font-bold">Copy</button>
        </div>
        <ProductBadge :image="result.product_image" :name="result.product_detected" />
        <pre class="whitespace-pre-wrap font-sans text-lg text-gray-300 leading-relaxed mb-8">{{ result.script }}</pre>
        <VoicePanel :script="result.script" />
      </div>

      <!-- Kết quả: persona -->
      <div v-if="mode === 'persona' && personaResult">
        <ProductBadge :image="personaResult.product_image" :name="personaResult.product_detected" class="mb-8" />
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div v-for="s in personaResult.scripts" :key="s.id"
            class="bg-[#111] border border-gray-700 rounded-2xl p-6 flex flex-col gap-4">
            <div class="flex justify-between items-start">
              <div>
                <span class="text-2xl">{{ s.emoji }}</span>
                <h4 class="text-base font-black mt-1">{{ s.name }}</h4>
                <p class="text-xs text-gray-500 mt-0.5">{{ s.desc }}</p>
              </div>
              <button @click="copyText(s.script)" class="text-xs bg-white text-black px-3 py-1 rounded-full font-bold shrink-0">Copy</button>
            </div>
            <pre class="whitespace-pre-wrap font-sans text-sm text-gray-300 leading-relaxed flex-1">{{ s.script }}</pre>
            <VoicePanel :script="s.script" />
          </div>
        </div>
      </div>

      <!-- Kết quả: dialogue -->
      <div v-if="mode === 'dialogue' && dialogueResult" class="space-y-6">
        <ProductBadge :image="dialogueResult.product_image" :name="dialogueResult.product_detected" />

        <!-- Script hội thoại -->
        <div class="bg-[#111] rounded-2xl border border-gray-700 p-8">
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-xl font-bold">🎭 Kịch bản hội thoại</h3>
            <button @click="copyText(dialogueResult.dialogue)" class="text-xs bg-white text-black px-3 py-1 rounded-full font-bold">Copy</button>
          </div>

          <!-- Render từng dòng thoại có màu nhân vật -->
          <div class="space-y-3">
            <div v-for="(line, i) in parsedLines" :key="i" class="flex gap-3">
              <span :class="charColorClass(line.char)"
                class="text-xs font-black px-2 py-1 rounded-full shrink-0 h-fit mt-0.5 uppercase tracking-wide">
                {{ line.char }}
              </span>
              <p class="text-gray-200 text-base leading-relaxed">{{ line.text }}</p>
            </div>
          </div>
        </div>

        <!-- Tạo voice -->
        <div class="bg-[#111] rounded-2xl border border-gray-700 p-8">
          <h3 class="text-xl font-bold mb-2">🎙️ Tạo Voice Hội Thoại</h3>
          <p class="text-gray-500 text-sm mb-6">Mỗi nhân vật sẽ được gán giọng đọc riêng, ghép thành 1 file audio.</p>

          <!-- Giọng của từng nhân vật -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div v-for="(char, i) in dialogueResult.characters" :key="i"
              class="bg-black rounded-xl p-4 border border-gray-700">
              <p class="text-xs text-gray-400 font-bold uppercase mb-2">{{ char.name }}</p>
              <select v-model="charVoices[char.name]"
                class="w-full bg-[#111] border border-gray-600 text-white px-3 py-2 rounded-lg text-sm focus:outline-none">
                <option value="nova">Nova — Nữ trẻ</option>
                <option value="shimmer">Shimmer — Nữ nhẹ nhàng</option>
                <option value="alloy">Alloy — Nữ tự nhiên</option>
                <option value="onyx">Onyx — Nam trầm</option>
                <option value="echo">Echo — Nam rõ</option>
              </select>
            </div>
          </div>

          <button @click="generateDialogueVoice" :disabled="loadingVoice"
            class="w-full bg-white text-black py-4 rounded-xl font-black text-sm hover:bg-gray-200 transition disabled:opacity-50">
            {{ loadingVoice ? 'Đang ghép audio...' : '🎙️ Tạo Voice & Ghép Audio' }}
          </button>

          <!-- Audio player -->
          <div v-if="dialogueAudioUrl" class="mt-6 space-y-3">
            <audio :src="dialogueAudioUrl" controls class="w-full" />
            <a :href="dialogueAudioUrl" download="dialogue_voice.mp3"
              class="block text-center text-xs font-bold bg-black border border-white text-white px-4 py-3 rounded-xl hover:bg-white hover:text-black transition">
              Tải xuống MP3
            </a>
          </div>
        </div>
      </div>

    </div>
  </section>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import VoicePanel from './VoicePanel.vue'
import ProductBadge from './ProductBadge.vue'

const productUrl = ref('')
const tone = ref('Hài hước')
const mode = ref('single')
const loading = ref(false)

const result = ref(null)
const personaResult = ref(null)
const dialogueResult = ref(null)

const charVoices = ref({})
const loadingVoice = ref(false)
const dialogueAudioUrl = ref(null)

const BASE_URL = 'https://tiktok-ai-backend-mq3e.onrender.com'

const CHAR_COLORS = [
  'bg-blue-600 text-white',
  'bg-pink-600 text-white',
  'bg-green-600 text-white',
  'bg-orange-500 text-white',
]

const charColorMap = ref({})
let colorIndex = 0

const charColorClass = (name) => {
  if (!charColorMap.value[name]) {
    charColorMap.value[name] = CHAR_COLORS[colorIndex % CHAR_COLORS.length]
    colorIndex++
  }
  return charColorMap.value[name]
}

// Parse dialogue thành từng dòng có char + text
const parsedLines = computed(() => {
  if (!dialogueResult.value?.dialogue) return []
  const pattern = /^\[(.+?)\]:\s*(.+)$/
  return dialogueResult.value.dialogue
    .split('\n')
    .map(l => l.trim())
    .filter(l => l)
    .map(l => {
      const m = l.match(pattern)
      return m ? { char: m[1].trim(), text: m[2].trim() } : null
    })
    .filter(Boolean)
})

// Khi có kết quả dialogue, khởi tạo giọng mặc định cho từng nhân vật
watch(dialogueResult, (val) => {
  if (!val?.characters) return
  charColorMap.value = {}
  colorIndex = 0
  const defaults = ['nova', 'onyx', 'shimmer', 'echo']
  val.characters.forEach((c, i) => {
    charVoices.value[c.name] = defaults[i % defaults.length]
  })
})

const generate = async () => {
  loading.value = true
  result.value = null
  personaResult.value = null
  dialogueResult.value = null
  dialogueAudioUrl.value = null
  try {
    if (mode.value === 'single') {
      const res = await fetch(`${BASE_URL}/api/generate-script`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_url: productUrl.value, tone: tone.value })
      })
      result.value = await res.json()
    } else if (mode.value === 'persona') {
      const res = await fetch(`${BASE_URL}/api/generate-persona-scripts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_url: productUrl.value })
      })
      personaResult.value = await res.json()
    } else {
      const res = await fetch(`${BASE_URL}/api/generate-dialogue`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_url: productUrl.value })
      })
      dialogueResult.value = await res.json()
    }
  } catch (error) {
    console.error('Lỗi:', error)
  } finally {
    loading.value = false
  }
}

const generateDialogueVoice = async () => {
  if (!dialogueResult.value?.dialogue) return
  loadingVoice.value = true
  if (dialogueAudioUrl.value) {
    URL.revokeObjectURL(dialogueAudioUrl.value)
    dialogueAudioUrl.value = null
  }

  // Inject giọng đã chọn vào từng dòng thoại trước khi gửi
  const dialogueWithVoices = dialogueResult.value.dialogue
    .split('\n')
    .map(line => {
      const m = line.trim().match(/^\[(.+?)\]:/)
      if (m) {
        const charName = m[1].trim()
        const voice = charVoices.value[charName] || 'nova'
        return `[${charName}|${voice}]: ${line.trim().replace(/^\[.+?\]:\s*/, '')}`
      }
      return line
    })
    .join('\n')

  try {
    const res = await fetch(`${BASE_URL}/api/generate-dialogue-voice`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dialogue: dialogueWithVoices })
    })
    if (!res.ok) throw new Error(await res.text())
    const blob = await res.blob()
    dialogueAudioUrl.value = URL.createObjectURL(blob)
  } catch (err) {
    console.error('Lỗi tạo voice:', err)
    alert('Tạo voice thất bại, thử lại nhé.')
  } finally {
    loadingVoice.value = false
  }
}

const copyText = (text) => {
  navigator.clipboard.writeText(text)
  alert('Đã copy!')
}
</script>
