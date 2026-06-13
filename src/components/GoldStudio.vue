<template>
  <section class="py-16 px-8 bg-black text-white min-h-screen">
    <div class="max-w-3xl mx-auto">
      <div class="text-center mb-8">
        <h2 class="text-4xl font-black uppercase tracking-tight mb-2">🥇 Giá Vàng Hôm Nay</h2>
        <p class="text-gray-400">Cập nhật giá vàng <b class="text-white">trong nước</b> &amp; <b class="text-white">thế giới</b>, rồi tạo luôn video AI bản tin giá vàng.</p>
      </div>

      <!-- Trạng thái tải giá -->
      <div v-if="loadingPrices" class="text-center py-10 text-gray-400">
        <span class="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin align-middle mr-2"></span>
        Đang lấy giá vàng...
      </div>
      <p v-else-if="priceError" class="text-red-400 text-sm text-center py-6">{{ priceError }}</p>

      <template v-else-if="gold">
        <!-- Vàng thế giới -->
        <div v-if="gold.world" class="bg-gradient-to-br from-yellow-600/20 to-amber-500/10 border border-yellow-700/40 rounded-3xl p-6 mb-5">
          <div class="flex items-center justify-between">
            <div>
              <div class="text-xs text-yellow-300/80 font-bold uppercase tracking-widest mb-1">Vàng thế giới (XAU)</div>
              <div class="text-3xl font-black">${{ fmt(gold.world.price_usd) }}<span class="text-base font-medium text-gray-400"> /ounce</span></div>
            </div>
            <div v-if="gold.world.pct_change !== null" class="text-right">
              <div :class="gold.world.pct_change >= 0 ? 'text-green-400' : 'text-red-400'" class="text-2xl font-black">
                {{ gold.world.pct_change >= 0 ? '▲' : '▼' }} {{ Math.abs(gold.world.pct_change) }}%
              </div>
              <div class="text-xs text-gray-500">24h</div>
            </div>
          </div>
        </div>

        <!-- Vàng trong nước -->
        <div class="bg-[#111] rounded-3xl border border-gray-800 p-6 mb-6">
          <div class="flex items-center justify-between mb-4">
            <div class="text-xs text-gray-400 font-bold uppercase tracking-widest">
              Vàng trong nước · {{ gold.domestic_source }}
            </div>
            <button @click="loadPrices" :disabled="loadingPrices"
              class="text-xs text-gray-400 hover:text-white border border-gray-700 rounded-full px-3 py-1 transition disabled:opacity-40">
              ↻ Làm mới
            </button>
          </div>
          <table class="w-full text-sm">
            <thead>
              <tr class="text-gray-500 text-xs uppercase">
                <th class="text-left font-medium pb-2">Loại vàng</th>
                <th class="text-right font-medium pb-2">Mua vào</th>
                <th class="text-right font-medium pb-2">Bán ra</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(g, i) in gold.domestic" :key="i" class="border-t border-gray-800">
                <td class="py-2.5 pr-2 text-gray-200">{{ g.name }}</td>
                <td class="py-2.5 text-right text-gray-300 tabular-nums">{{ fmt(g.buy) }}</td>
                <td class="py-2.5 text-right font-bold text-yellow-400 tabular-nums">{{ fmt(g.sell) }}</td>
              </tr>
            </tbody>
          </table>
          <p class="text-gray-600 text-xs mt-3">
            Đơn vị: VNĐ / chỉ.
            <span v-if="gold.domestic_updated"> Cập nhật: {{ gold.domestic_updated }}.</span>
            <span v-if="gold.stale" class="text-amber-500"> (dữ liệu tạm thời từ bộ nhớ đệm)</span>
          </p>
        </div>

        <!-- Tạo video -->
        <div class="bg-[#111] rounded-3xl border border-gray-800 p-6 space-y-4">
          <div>
            <label class="text-xs text-gray-400 font-bold uppercase tracking-widest mb-2 block">Kiểu video</label>
            <div class="flex gap-2">
              <button @click="mode = 'dialogue'"
                :class="mode === 'dialogue' ? 'bg-white text-black' : 'bg-[#222] text-gray-400 hover:text-white border border-gray-700'"
                class="flex-1 px-4 py-2.5 rounded-xl text-xs font-bold transition">💬 2 nhân vật bàn tin</button>
              <button @click="mode = 'single'"
                :class="mode === 'single' ? 'bg-white text-black' : 'bg-[#222] text-gray-400 hover:text-white border border-gray-700'"
                class="flex-1 px-4 py-2.5 rounded-xl text-xs font-bold transition">🧍 1 người dẫn tin</button>
            </div>
          </div>

          <button
            @click="generateVideo"
            :disabled="loadingVideo || !gold.script_seed"
            class="w-full bg-gradient-to-r from-yellow-500 to-amber-600 text-black py-4 rounded-xl font-black text-sm hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <span v-if="loadingVideo" class="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></span>
            {{ loadingVideo ? `AI đang dựng video... ${elapsed}s (~1–2 phút)` : '🎬 Tạo Video AI Giá Vàng' }}
          </button>
          <p class="text-gray-500 text-xs">Tốn 1 credit. AI dùng số liệu giá vàng ở trên để viết kịch bản và dựng video 9:16.</p>

          <p v-if="statusMsg" class="text-amber-400 text-xs">{{ statusMsg }}</p>
          <p v-if="videoError" class="text-red-400 text-xs">{{ videoError }}</p>

          <div v-if="videoUrl" class="space-y-3">
            <video :src="videoUrl" controls class="w-full rounded-xl" style="max-height: 480px; background:#000;" />
            <a :href="videoUrl" download="gia_vang.mp4"
              class="block text-center text-xs font-bold bg-black border border-white text-white px-4 py-3 rounded-xl hover:bg-white hover:text-black transition">
              Tải xuống MP4
            </a>
          </div>
        </div>
      </template>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { authedFetch, refreshCredits, ApiError, BASE_URL } from '../api'

const gold = ref(null)
const loadingPrices = ref(false)
const priceError = ref('')

const mode = ref('dialogue')
const loadingVideo = ref(false)
const videoUrl = ref(null)
const videoError = ref('')
const statusMsg = ref('')
const elapsed = ref(0)

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const fmt = (n) => Number(n).toLocaleString('vi-VN')

// --- Lấy giá vàng (công khai, $0, không cần đăng nhập) ---
const loadPrices = async () => {
  loadingPrices.value = true
  priceError.value = ''
  try {
    const res = await fetch(`${BASE_URL}/api/gold-prices`)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    gold.value = await res.json()
  } catch {
    priceError.value = 'Không lấy được giá vàng lúc này. Thử bấm Làm mới sau giây lát nhé.'
  } finally {
    loadingPrices.value = false
  }
}
onMounted(loadPrices)

// --- Tạo video: tái dùng job bất đồng bộ + queue + credit của /api/generate-video ---
const startJob = async () => {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 60000)
  try {
    const res = await authedFetch('/api/generate-video', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        script: gold.value.script_seed,
        mode: mode.value,
        persona_a_id: 'mc',      // MC năng động dẫn bản tin giá vàng
        persona_b_id: 'cool',
        product_name: 'Giá vàng hôm nay',
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

const pollUntilDone = async (jobId) => {
  for (let i = 0; i < 260; i++) {
    await sleep(3000)
    let res
    try {
      res = await fetch(`${BASE_URL}/api/video-status/${jobId}`)
    } catch {
      continue
    }
    if (res.status === 404) throw new Error('Job đã hết hạn, thử tạo lại nhé.')
    if (!res.ok) continue
    const data = await res.json()
    if (data.status === 'done') return
    if (data.status === 'error') throw new Error(data.error || 'Lỗi tạo video')
    if (data.status === 'pending' && data.position) {
      statusMsg.value = `Đang xếp hàng — vị trí thứ ${data.position}...`
    } else if (data.status === 'processing') {
      statusMsg.value = 'AI đang dựng video...'
    }
  }
  throw new Error('Quá thời gian tạo video, thử lại nhé.')
}

const generateVideo = async () => {
  if (!gold.value?.script_seed) return
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
    if (err instanceof ApiError) {
      videoError.value = err.message
    } else if (err.name === 'AbortError') {
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
    refreshCredits()
  }
}
</script>
