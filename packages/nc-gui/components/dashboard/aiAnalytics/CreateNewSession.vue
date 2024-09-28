<script lang="ts" setup>
const props = defineProps<{
  clearAllSession: (value: boolean) => void
}>()

const { activeTableId } = storeToRefs(useTablesStore())
const { conversationId } = storeToRefs(useaiAnalyticsStore())

const { $api } = useNuxtApp()
const isShowLoading = ref(false)
const handleClick = async () => {
  try {
    isShowLoading.value = true
    let createSessionRes = await $api.smartData.createSession({
      entityId: activeTableId.value,
      datafiles: JSON.stringify([]),
      isUpdateSession: true,
    })
    if (createSessionRes?.conversation_id) {
      conversationId.value = { key: activeTableId.value, value: createSessionRes.conversation_id }
    }
    props.clearAllSession(true)
  } catch (error) {
    throw error
  } finally {
    isShowLoading.value = false
  }
}
</script>

<template>
  <div class="new-session" @click="handleClick">
    <svg
      t="1727234488099"
      class="icon"
      viewBox="0 0 1024 1024"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      p-id="6971"
      width="18"
      height="18"
    >
      <path
        d="M512 136c-208 0-376 144-376 320 0 108.8 64 209.6 172.8 268.8 11.2 6.4 25.6 1.6 32-9.6 6.4-11.2 1.6-25.6-9.6-32-92.8-51.2-147.2-136-147.2-227.2 0-150.4 147.2-272 328-272s328 121.6 328 272-147.2 272-328 272c-6.4 0-12.8 3.2-17.6 6.4l-86.4 86.4V752c0-12.8-11.2-24-24-24s-24 11.2-24 24v128c0 9.6 6.4 19.2 14.4 22.4 3.2 1.6 6.4 1.6 9.6 1.6 6.4 0 12.8-3.2 17.6-6.4l121.6-121.6c203.2-4.8 366.4-145.6 366.4-320-1.6-176-169.6-320-377.6-320z"
        p-id="6972"
      ></path>
      <path
        d="M312 424h400c12.8 0 24-11.2 24-24s-11.2-24-24-24h-400c-12.8 0-24 11.2-24 24s11.2 24 24 24zM312 568H624c12.8 0 24-11.2 24-24s-11.2-24-24-24H312c-12.8 0-24 11.2-24 24s11.2 24 24 24z"
        p-id="6973"
      ></path>
    </svg>
    开启新对话
  </div>
  <SmartdataChatPlaygroundViewCommonLoading :isShow="isShowLoading" />
</template>

<style lang="scss" scoped>
.new-session {
  position: absolute;
  top: -26px;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgb(255, 255, 255);
  line-height: 1;
  box-shadow: inset 0 0 0 1px #e2e2e3;
  border-radius: 1e3px;
  display: flex;
  align-items: center;
  padding: 8px 16px;
  cursor: pointer;
  margin-right: 8px;
  white-space: nowrap;
  box-sizing: border-box;
}
</style>
