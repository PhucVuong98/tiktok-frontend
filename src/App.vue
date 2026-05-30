<template>
  <div class="min-h-screen bg-white text-nikeDark font-sans">
    <!-- Navbar phong cách Nike -->
    <nav class="flex items-center justify-between px-8 py-4 border-b border-gray-200 bg-white sticky top-0 z-50">
      <div class="text-2xl font-black tracking-tighter cursor-pointer">CREATOR FACTORY.</div>
      <ul class="hidden md:flex space-x-8 font-medium text-sm">
        <li class="hover:border-b-2 hover:border-black pb-1 cursor-pointer">Thịnh Hành</li>
        <li class="hover:border-b-2 hover:border-black pb-1 cursor-pointer">AI Script</li>
        <li class="hover:border-b-2 hover:border-black pb-1 cursor-pointer">Cửa Hàng</li>
      </ul>
      <div class="flex space-x-4">
        <button class="font-medium text-sm hover:text-gray-500">Đăng Nhập</button>
        <button class="bg-black text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-gray-800 transition">Nâng cấp Pro</button>
      </div>
    </nav>

    <!-- Components -->
    <main>
      <Hero />
      <TrendingHooks />
      <ScriptGenerator />
    </main>
  </div>
</template>

<script setup>
import Hero from './components/Hero.vue'
import TrendingHooks from './components/TrendingHooks.vue'
import ScriptGenerator from './components/ScriptGenerator.vue'
</script>
