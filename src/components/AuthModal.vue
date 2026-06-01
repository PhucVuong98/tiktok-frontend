<template>
  <!-- Overlay -->
  <div class="fixed inset-0 bg-black/60 z-50 flex items-center justify-center px-4" @click.self="$emit('close')">
    <div class="bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl relative">

      <!-- Nút đóng -->
      <button @click="$emit('close')" class="absolute top-5 right-6 text-gray-400 hover:text-black text-2xl font-bold">×</button>

      <!-- Tiêu đề -->
      <h2 class="text-3xl font-black uppercase tracking-tight mb-1">
        {{ isLogin ? 'Đăng Nhập' : 'Đăng Ký' }}
      </h2>
      <p class="text-gray-500 text-sm mb-6">
        {{ isLogin ? 'Chào mừng trở lại, Creator!' : 'Tạo tài khoản miễn phí ngay.' }}
      </p>

      <!-- Nút Google -->
      <button
        @click="handleGoogle"
        :disabled="loadingGoogle"
        class="w-full flex items-center justify-center gap-3 border-2 border-gray-200 rounded-xl px-4 py-3 font-bold text-sm hover:border-black transition disabled:opacity-50 mb-5"
      >
        <svg class="w-5 h-5" viewBox="0 0 48 48">
          <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
          <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
          <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
          <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
        </svg>
        {{ loadingGoogle ? 'Đang xử lý...' : 'Tiếp tục với Google' }}
      </button>

      <!-- Divider -->
      <div class="flex items-center gap-3 mb-5">
        <div class="flex-1 h-px bg-gray-200"></div>
        <span class="text-xs text-gray-400 font-medium">HOẶC</span>
        <div class="flex-1 h-px bg-gray-200"></div>
      </div>

      <!-- Form Email/Password -->
      <form @submit.prevent="handleSubmit" class="flex flex-col gap-4">
        <input
          v-model="email"
          type="email"
          placeholder="Email của bạn"
          required
          class="border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-black transition"
        />
        <input
          v-model="password"
          type="password"
          placeholder="Mật khẩu"
          required
          class="border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-black transition"
        />

        <!-- Thông báo lỗi -->
        <p v-if="errorMsg" class="text-red-500 text-sm">{{ errorMsg }}</p>

        <button
          type="submit"
          :disabled="loading"
          class="bg-black text-white py-3 rounded-xl font-bold text-sm hover:bg-gray-800 transition disabled:opacity-50"
        >
          {{ loading ? 'Đang xử lý...' : (isLogin ? 'Đăng Nhập' : 'Đăng Ký') }}
        </button>
      </form>

      <!-- Toggle login/register -->
      <p class="text-center text-sm text-gray-500 mt-6">
        {{ isLogin ? 'Chưa có tài khoản?' : 'Đã có tài khoản?' }}
        <button @click="toggleMode" class="font-bold text-black underline ml-1">
          {{ isLogin ? 'Đăng ký ngay' : 'Đăng nhập' }}
        </button>
      </p>

    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { auth } from '../firebase'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
} from 'firebase/auth'

const emit = defineEmits(['close'])

const isLogin = ref(true)
const email = ref('')
const password = ref('')
const errorMsg = ref('')
const loading = ref(false)
const loadingGoogle = ref(false)

const toggleMode = () => {
  isLogin.value = !isLogin.value
  errorMsg.value = ''
}

const friendlyError = (code) => {
  const map = {
    'auth/user-not-found': 'Email không tồn tại.',
    'auth/wrong-password': 'Mật khẩu không đúng.',
    'auth/email-already-in-use': 'Email này đã được đăng ký.',
    'auth/weak-password': 'Mật khẩu phải có ít nhất 6 ký tự.',
    'auth/invalid-email': 'Email không hợp lệ.',
    'auth/invalid-credential': 'Email hoặc mật khẩu không đúng.',
    'auth/popup-closed-by-user': 'Bạn đã đóng cửa sổ đăng nhập.',
  }
  return map[code] || 'Có lỗi xảy ra, vui lòng thử lại.'
}

const handleGoogle = async () => {
  loadingGoogle.value = true
  errorMsg.value = ''
  try {
    await signInWithPopup(auth, new GoogleAuthProvider())
    emit('close')
  } catch (err) {
    errorMsg.value = friendlyError(err.code)
  } finally {
    loadingGoogle.value = false
  }
}

const handleSubmit = async () => {
  loading.value = true
  errorMsg.value = ''
  try {
    if (isLogin.value) {
      await signInWithEmailAndPassword(auth, email.value, password.value)
    } else {
      await createUserWithEmailAndPassword(auth, email.value, password.value)
    }
    emit('close')
  } catch (err) {
    errorMsg.value = friendlyError(err.code)
  } finally {
    loading.value = false
  }
}
</script>
