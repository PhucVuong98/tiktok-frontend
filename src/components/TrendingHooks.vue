<template>
  <section class="py-16 px-8 max-w-7xl mx-auto border-t border-gray-200">
    <div class="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
      <div>
        <h2 class="text-4xl font-black uppercase tracking-tight text-nikeDark">Kho Hooks Thịnh Hành</h2>
        <p class="text-gray-500 mt-2 font-medium text-lg">Phân tích và gợi ý bởi cỗ máy AI Trend Reporter.</p>
      </div>
      
      <button 
        @click="runAITrendReporter" 
        :disabled="isUpdating"
        class="bg-nikeDark text-white px-6 py-3 rounded-full text-sm font-bold flex items-center gap-2 hover:bg-gray-800 transition shadow-lg disabled:opacity-50"
      >
        <span v-if="isUpdating">⏳ Đang phân tích dữ liệu Tiktok...</span>
        <span v-else>🤖 AI Quét Trend Mới Nhất</span>
      </button>
    </div>
    
    <div class="flex overflow-x-auto space-x-3 mb-10 pb-2 scrollbar-hide">
      <button 
        v-for="tab in tabs" :key="tab"
        @click="filterHooks(tab)"
        :class="activeTab === tab ? 'bg-nikeDark text-white border-nikeDark' : 'bg-nikeGray text-gray-500 border-transparent hover:bg-gray-200 hover:text-black'"
        class="px-8 py-3 rounded-full font-bold whitespace-nowrap transition border-2 text-sm uppercase tracking-wider"
      >
        {{ tab }}
      </button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div 
        v-for="hook in hooks" :key="hook.id"
        class="group bg-white border-2 border-gray-200 p-8 rounded-3xl flex flex-col justify-between hover:border-nikeDark hover:shadow-xl transition-all duration-300 cursor-pointer"
      >
        <div>
          <div class="flex justify-between items-center mb-6">
            <span class="text-xs font-black text-white bg-black px-3 py-1 rounded-full uppercase tracking-widest">{{ hook.category }}</span>
            <span class="text-xs font-bold text-gray-400 uppercase tracking-widest">{{ hook.niche }}</span>
          </div>
          <p class="text-xl font-medium leading-relaxed text-nikeDark">"{{ hook.text }}"</p>
        </div>
        
        <div class="mt-10 flex justify-between items-center border-t border-gray-100 pt-4">
          <div class="flex flex-col">
            <span class="text-xs text-gray-400 font-bold uppercase">Hiệu suất</span>
            <span class="text-sm font-black text-green-600">🔥 {{ hook.views }} Views</span>
          </div>
          <button 
            @click="copyText(hook.text)"
            class="text-sm font-bold bg-nikeGray text-nikeDark px-4 py-2 rounded-full hover:bg-black hover:text-white transition"
          >
            Copy ngay
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const tabs = ['Tất cả', 'Trend', 'Drama', 'Dễ làm', 'Bán hàng']
const activeTab = ref('Tất cả')
const hooks = ref([])
const isUpdating = ref(false)

// Lấy dữ liệu từ Backend
const fetchHooks = async (category) => {
  try {
    const res = await fetch(`https://tiktok-ai-backend-mq3e.onrender.com/api/trending-hooks?category=${category}`)
    hooks.value = await res.json()
  } catch (error) {
    console.error("Lỗi kết nối Server:", error)
  }
}

// Hàm đổi Tab
const filterHooks = (tab) => {
  activeTab.value = tab
  fetchHooks(tab)
}

// Hàm kích hoạt AI Trend Reporter
const runAITrendReporter = async () => {
  isUpdating.value = true
  try {
    await fetch('https://tiktok-ai-backend-mq3e.onrender.com/api/ai-update-trends', { method: 'POST' })
    // Cập nhật xong thì quay về tab Tất cả và load lại dữ liệu mới nhất
    activeTab.value = 'Tất cả'
    await fetchHooks('Tất cả')
    alert("AI đã tổng hợp xong các Hook thịnh hành mới nhất!")
  } catch (error) {
    alert("Có lỗi khi gọi AI. Vui lòng thử lại.")
  } finally {
    isUpdating.value = false
  }
}

// Copy Hook vào Clipboard
const copyText = (text) => {
  navigator.clipboard.writeText(text)
  alert("Đã copy Hook vào bộ nhớ tạm!")
}

// Tự động lấy dữ liệu khi load trang
onMounted(() => {
  fetchHooks('Tất cả')
})
</script>
