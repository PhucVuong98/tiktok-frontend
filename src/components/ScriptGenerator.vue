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
          <button
            @click="mode = 'single'"
            :class="mode === 'single' ? 'bg-white text-black' : 'text-gray-400 hover:text-white'"
            class="px-6 py-2 rounded-full text-sm font-bold transition"
          >
            1 Kịch Bản
          </button>
          <button
            @click="mode = 'persona'"
            :class="mode === 'persona' ? 'bg-white text-black' : 'text-gray-400 hover:text-white'"
            class="px-6 py-2 rounded-full text-sm font-bold transition"
          >
            3 Nhân Vật ✨
          </button>
        </div>
      </div>

      <!-- Form -->
      <form @submit.prevent="generate" class="bg-white rounded-3xl p-2 flex flex-col md:flex-row shadow-2xl mb-12">
        <input
          v-model="productUrl"
          type="url"
          placeholder="Nhập link sản phẩm Shopee / TikTok Shop..."
          class="flex-1 px-6 py-4 rounded-2xl text-black focus:outline-none placeholder-gray-500"
          required
        />
        <select
          v-if="mode === 'single'"
          v-model="tone"
          class="bg-gray-100 text-black px-6 py-4 rounded-xl mx-2 font-medium focus:outline-none"
        >
          <option value="Hài hước">Hài hước</option>
          <option value="Đánh giá chân thực">Đánh giá chân thực</option>
          <option value="Drama">Drama / Vạch trần</option>
        </select>
        <button
          type="submit"
          :disabled="loading"
          class="bg-black text-white px-8 py-4 rounded-2xl font-bold hover:bg-gray-800 transition disabled:opacity-50 whitespace-nowrap"
        >
          {{ loading ? 'Đang viết...' : 'Tạo Kịch Bản' }}
        </button>
      </form>

      <!-- Kết quả: mode single -->
      <div v-if="mode === 'single' && result" class="bg-[#111] p-8 text-left rounded-2xl border border-gray-800">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-xl font-bold">Kịch bản của bạn:</h3>
          <button @click="copyText(result.script)" class="text-xs bg-white text-black px-3 py-1 rounded-full font-bold">Copy</button>
        </div>
        <div class="flex items-center space-x-4 mb-6 bg-black p-4 rounded-xl border border-gray-700">
          <img v-if="result.product_image" :src="result.product_image" alt="Product" class="w-16 h-16 object-cover rounded-lg">
          <div>
            <p class="text-xs text-gray-400 font-bold uppercase tracking-wider">Đã nhận diện sản phẩm</p>
            <p class="text-sm font-medium text-white line-clamp-2">{{ result.product_detected }}</p>
          </div>
        </div>
        <pre class="whitespace-pre-wrap font-sans text-lg text-gray-300 leading-relaxed mb-8">{{ result.script }}</pre>

        <!-- Voice panel -->
        <VoicePanel :script="result.script" />
      </div>

      <!-- Kết quả: mode persona -->
      <div v-if="mode === 'persona' && personaResult">
        <div class="flex items-center space-x-4 mb-8 bg-[#111] p-4 rounded-xl border border-gray-700">
          <img v-if="personaResult.product_image" :src="personaResult.product_image" alt="Product" class="w-16 h-16 object-cover rounded-lg">
          <div>
            <p class="text-xs text-gray-400 font-bold uppercase tracking-wider">Đã nhận diện sản phẩm</p>
            <p class="text-sm font-medium text-white">{{ personaResult.product_detected }}</p>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div
            v-for="s in personaResult.scripts"
            :key="s.id"
            class="bg-[#111] border border-gray-700 rounded-2xl p-6 flex flex-col gap-4"
          >
            <div class="flex justify-between items-start">
              <div>
                <span class="text-2xl">{{ s.emoji }}</span>
                <h4 class="text-base font-black mt-1">{{ s.name }}</h4>
                <p class="text-xs text-gray-500 mt-0.5">{{ s.desc }}</p>
              </div>
              <button @click="copyText(s.script)" class="text-xs bg-white text-black px-3 py-1 rounded-full font-bold shrink-0">
                Copy
              </button>
            </div>
            <pre class="whitespace-pre-wrap font-sans text-sm text-gray-300 leading-relaxed flex-1">{{ s.script }}</pre>
            <!-- Voice panel per persona -->
            <VoicePanel :script="s.script" />
          </div>
        </div>
      </div>

    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'
import VoicePanel from './VoicePanel.vue'

const productUrl = ref('')
const tone = ref('Hài hước')
const mode = ref('single')
const result = ref(null)
const personaResult = ref(null)
const loading = ref(false)

const BASE_URL = 'https://tiktok-ai-backend-mq3e.onrender.com'

const generate = async () => {
  loading.value = true
  result.value = null
  personaResult.value = null
  try {
    if (mode.value === 'single') {
      const res = await fetch(`${BASE_URL}/api/generate-script`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_url: productUrl.value, tone: tone.value })
      })
      result.value = await res.json()
    } else {
      const res = await fetch(`${BASE_URL}/api/generate-persona-scripts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_url: productUrl.value })
      })
      personaResult.value = await res.json()
    }
  } catch (error) {
    console.error('Lỗi:', error)
  } finally {
    loading.value = false
  }
}

const copyText = (text) => {
  navigator.clipboard.writeText(text)
  alert('Đã copy kịch bản!')
}
</script>
