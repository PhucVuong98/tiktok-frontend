<template>
  <section class="py-16 px-8 bg-black text-white">
    <div class="max-w-4xl mx-auto text-center">
      <h2 class="text-4xl font-black uppercase tracking-tight mb-4">Tạo Kịch Bản Affiliate</h2>
      <p class="text-gray-400 mb-10">Dán link Shopee hoặc TikTok Shop. AI sẽ lo phần còn lại.</p>

      <form @submit.prevent="generate" class="bg-white rounded-3xl p-2 flex flex-col md:flex-row shadow-2xl">
        <input 
          v-model="productUrl"
          type="url" 
          placeholder="Nhập link sản phẩm..." 
          class="flex-1 px-6 py-4 rounded-2xl text-black focus:outline-none placeholder-gray-500"
          required
        />
        <select v-model="tone" class="bg-gray-100 text-black px-6 py-4 rounded-xl mx-2 font-medium focus:outline-none">
          <option value="Hài hước">Hài hước</option>
          <option value="Đánh giá chân thực">Đánh giá chân thực</option>
          <option value="Drama">Drama / Vạch trần</option>
        </select>
        <button 
          type="submit" 
          class="bg-black text-white px-8 py-4 rounded-2xl font-bold hover:bg-gray-800 transition"
          :disabled="loading"
        >
          {{ loading ? 'Đang viết...' : 'Tạo Kịch Bản' }}
        </button>
      </form>

      <!-- Kết quả hiển thị -->
      <div v-if="result" class="mt-12 bg-[#111] p-8 text-left rounded-2xl border border-gray-800">
  <div class="flex justify-between items-center mb-6">
    <h3 class="text-xl font-bold">Kịch bản của bạn:</h3>
    <button class="text-xs bg-white text-black px-3 py-1 rounded-full font-bold">Copy</button>
  </div>
  
  <div class="flex items-center space-x-4 mb-6 bg-black p-4 rounded-xl border border-gray-700">
    <img v-if="result.product_image" :src="result.product_image" alt="Product" class="w-16 h-16 object-cover rounded-lg">
    <div>
      <p class="text-xs text-gray-400 font-bold uppercase tracking-wider">Đã nhận diện sản phẩm</p>
      <p class="text-sm font-medium text-white line-clamp-2">{{ result.product_detected }}</p>
    </div>
  </div>

  <pre class="whitespace-pre-wrap font-sans text-lg text-gray-300 leading-relaxed">{{ result.script }}</pre>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'

const productUrl = ref('')
const tone = ref('Hài hước')
const result = ref(null)
const loading = ref(false)

const generate = async () => {
  loading.value = true
  try {
    const res = await fetch('https://tiktok-ai-backend-mq3e.onrender.com/api/generate-script', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product_url: productUrl.value, tone: tone.value })
    })
    result.value = await res.json()
  } catch (error) {
    console.error("Lỗi:", error)
  } finally {
    loading.value = false
  }
}
</script>
