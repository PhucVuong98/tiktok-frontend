import { reactive } from 'vue'

// State dùng chung giữa các component (không cần Vuex/Pinia cho app nhỏ)
export const store = reactive({
  view: 'home', // 'home' | 'video'
  videoDraft: { script: '', productImage: '', productName: '', voice: 'nova' },
})

// Đổ dữ liệu từ kết quả script sang tab Video rồi chuyển view
export function sendToVideo({ script = '', productImage = '', productName = '', voice = 'nova' }) {
  store.videoDraft = { script, productImage, productName, voice }
  store.view = 'video'
}
