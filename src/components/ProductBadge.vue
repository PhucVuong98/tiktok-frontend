<template>
  <div class="flex items-center space-x-4 bg-[#111] p-4 rounded-xl border border-gray-700">
    <img v-if="image" :src="image" alt="Product" class="w-16 h-16 object-cover rounded-lg shrink-0">
    <div>
      <p class="text-xs text-gray-400 font-bold uppercase tracking-wider">Đã nhận diện sản phẩm</p>
      <p class="text-sm font-medium text-white line-clamp-2">{{ name }}</p>
    </div>
  </div>
</template>

<script setup>
defineProps({ image: String, name: String })
</script>
