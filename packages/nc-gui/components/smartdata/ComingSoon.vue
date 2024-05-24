<script setup lang="ts">
const { back } = useRouter()
</script>

<template>
  <div class="flex flex-col items-center justify-center gap-6">
    <img src="~assets/img/placeholder/api-tokens.png" class="!w-[22rem] flex-none" />

    <div class="text-2xl text-gray-800 font-bold">建设中</div>
    <div class="text-sm text-gray-700">该模块建议中，敬请期待</div>
    <NcButton class="!rounded-lg !py-3 !h-10" type="primary" @click="back"> 返回 </NcButton>
  </div>
</template>
