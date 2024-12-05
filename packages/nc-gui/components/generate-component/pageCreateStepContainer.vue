<script lang="ts" setup>
/**
 * 创建构件页面
 * 创建页面步骤条的内容
 */
const props = defineProps<{
  current: number
  nextStep: () => void
  handlePrev: () => void
  heightData: number
  selectedType: string
  isNewSelected: boolean
  setisNewSelected: (value: boolean) => void
}>()
const { $api } = useNuxtApp()

const isShowLoading = ref(false)

watch(
  () => props.isNewSelected,
  (newVisible) => {
    if (newVisible) {
    }
  },
)
</script>

<template>
  <div class="page-type-step-container" v-if="selectedType === 'page'">
    <div v-if="current === 1" class="page-steps-two-content">
      <div class="flex flex-col items-center justify-center gap-6">
        <img src="~assets/img/placeholder/api-tokens.png" class="!w-[22rem] flex-none" />
        <div class="text-2xl text-gray-800 font-bold">建设中</div>
        <div class="text-sm text-gray-700">该模块建议中，敬请期待</div>
        <NcButton class="!rounded-lg !py-3 !h-10" type="primary" @click="handlePrev"> 返回 </NcButton>
      </div>
    </div>
  </div>
  <SmartdataChatPlaygroundViewCommonLoading :isShow="isShowLoading" />
</template>

<style lang="scss" scoped>
.page-type-step-container {
  height: 100%;
  widht: 100%;
  .page-steps-two-content {
  }
}
</style>
