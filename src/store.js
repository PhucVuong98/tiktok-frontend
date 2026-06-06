import { reactive } from 'vue'

// State dùng chung giữa các component (không cần Vuex/Pinia cho app nhỏ)
export const store = reactive({
  view: 'home', // 'home' | 'video'
  videoDraft: { script: '', productImage: '', productName: '', voice: 'nova' },

  // Auth + credit (đặt ở store để mọi component đọc/ghi chung)
  user: null,       // firebase user (null = chưa đăng nhập)
  credits: null,    // số credit còn lại (null = chưa load)
  showAuth: false,  // bật modal đăng nhập từ bất kỳ đâu: store.showAuth = true
})

// Đổ dữ liệu từ kết quả script sang tab Video rồi chuyển view
export function sendToVideo({ script = '', productImage = '', productName = '', voice = 'nova' }) {
  store.videoDraft = { script, productImage, productName, voice }
  store.view = 'video'
}
