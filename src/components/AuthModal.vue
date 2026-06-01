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
      <p class="text-gray-500 text-sm mb-8">
        {{ isLogin ? 'Chào mừng trở lại, Creator!' : 'Tạo tài khoản miễn phí ngay.' }}
      </p>

      <!-- Form -->
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
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth'

const emit = defineEmits(['close'])

const isLogin = ref(true)
const email = ref('')
const password = ref('')
const errorMsg = ref('')
const loading = ref(false)

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
  }
  return map[code] || 'Có lỗi xảy ra, vui lòng thử lại.'
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
