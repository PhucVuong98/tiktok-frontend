<template>
  <div class="min-h-screen bg-white text-nikeDark font-sans">
    <!-- Navbar -->
    <nav class="flex items-center justify-between px-8 py-4 border-b border-gray-200 bg-white sticky top-0 z-50">
      <div class="text-2xl font-black tracking-tighter cursor-pointer">CREATOR FACTORY.</div>
      <ul class="hidden md:flex space-x-8 font-medium text-sm">
        <li @click="store.view = 'home'"
          :class="store.view === 'home' ? 'border-b-2 border-black' : 'hover:border-b-2 hover:border-black'"
          class="pb-1 cursor-pointer">Thịnh Hành</li>
        <li @click="store.view = 'home'"
          :class="store.view === 'home' ? 'border-b-2 border-black' : 'hover:border-b-2 hover:border-black'"
          class="pb-1 cursor-pointer">AI Script</li>
        <li @click="store.view = 'video'"
          :class="store.view === 'video' ? 'border-b-2 border-black' : 'hover:border-b-2 hover:border-black'"
          class="pb-1 cursor-pointer">🎬 Video</li>
        <li class="hover:border-b-2 hover:border-black pb-1 cursor-pointer">Cửa Hàng</li>
      </ul>
      <div class="flex items-center space-x-4">
        <!-- Chưa đăng nhập -->
        <template v-if="!user">
          <button @click="store.showAuth = true" class="font-medium text-sm hover:text-gray-500">Đăng Nhập</button>
          <button @click="store.showAuth = true" class="bg-black text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-gray-800 transition">Nâng cấp Pro</button>
        </template>

        <!-- Đã đăng nhập -->
        <template v-else>
          <span v-if="store.credits !== null"
            class="text-xs font-black bg-black text-white px-3 py-1.5 rounded-full"
            title="Số credit còn lại (mỗi video tốn 1 credit)">
            ⚡ {{ store.credits }} credit
          </span>
          <span class="text-sm font-medium text-gray-600 hidden md:block">{{ user.email }}</span>
          <button @click="logout" class="font-medium text-sm text-red-500 hover:text-red-700">Đăng Xuất</button>
        </template>
      </div>
    </nav>

    <!-- Modal đăng nhập -->
    <AuthModal v-if="store.showAuth" @close="store.showAuth = false" />

    <!-- Components -->
    <main>
      <template v-if="store.view === 'home'">
        <Hero />
        <TrendingHooks />
        <ScriptGenerator />
      </template>
      <VideoStudio v-else-if="store.view === 'video'" />
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { auth } from './firebase'
import { onAuthStateChanged, signOut, getRedirectResult } from 'firebase/auth'
import Hero from './components/Hero.vue'
import TrendingHooks from './components/TrendingHooks.vue'
import ScriptGenerator from './components/ScriptGenerator.vue'
import VideoStudio from './components/VideoStudio.vue'
import AuthModal from './components/AuthModal.vue'
import { store } from './store'
import { refreshCredits } from './api'

const user = ref(null)

onMounted(() => {
  onAuthStateChanged(auth, (u) => {
    user.value = u
    store.user = u
    if (u) {
      store.showAuth = false   // đăng nhập xong thì đóng modal
      refreshCredits()         // nạp số credit hiển thị
    } else {
      store.credits = null
    }
  })
  getRedirectResult(auth).catch(() => {})
})

const logout = async () => {
  await signOut(auth)
}
</script>
