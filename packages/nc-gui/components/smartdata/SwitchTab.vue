<script lang="ts" setup>
const activeKey = ref('consoleDesk')
const router = useRouter()
const { isLeftSidebarOpen } = storeToRefs(useSidebarStore())
const showName = ['index-typeOrId-baseId-index-index', 'index-typeOrId-baseId-tab-tabView', 'index-typeOrId-baseId-playground']
const route = router.currentRoute

const switchTab = (tab: string) => {
  activeKey.value = tab
  router.push({
    name: 'index-typeOrId-baseId-tab-tabView',
    params: {
      typeOrId: route.value.params.typeOrId,
      baseId: route.value.params.baseId,
      tabView: tab,
    },
  })
}

watch(
  () => route.value,
  () => {
    if (route.value?.name && showName.includes(route.value?.name)) {
      activeKey.value = route.value.fullPath.indexOf('playground') > -1 ? 'playground' : 'consoleDesk'
    } else {
      activeKey.value = ''
    }
  },
  { immediate: true, deep: true },
)
</script>

<template>
  <div class="switch-tab-main h-[var(--topbar-height)]" :class="{ 'left-sidebar-open-class': isLeftSidebarOpen }">
    <div class="switch-tab flex flex-row p-1 mx-3 bg-gray-100 rounded-lg gap-x-0.5 nc-view-sidebar-tab">
      <div
        class="tab"
        :class="{
          active: activeKey === 'consoleDesk',
        }"
        @click="switchTab('consoleDesk')"
      >
        <GeneralIcon
          icon="home"
          class="tab-icon"
          :class="{}"
          :style="{
            fontWeight: 500,
          }"
        />
        <div class="tab-title nc-tab">控制台</div>
      </div>
      <div
        class="tab"
        :class="{
          active: activeKey === 'playground',
        }"
        @click="switchTab('playground')"
      >
        <GeneralIcon
          icon="magic1"
          class="tab-icon"
          :class="{}"
          :style="{
            fontWeight: 500,
          }"
        />
        <div class="tab-title nc-tab">提问建表</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.switch-tab-main {
  position: fixed;
  display: flex;
  align-items: center;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  z-index: 99;
}
.left-sidebar-open-class {
  left: 50%;
  transform: translateX(40%);
}
.switch-tab {
  display: flex;
  align-items: center;
}
.tab {
  @apply flex flex-row items-center h-7.5 justify-center px-2 py-1 bg-gray-100 rounded-lg gap-x-1.5 text-gray-500 hover:text-black cursor-pointer transition-all duration-300 select-none;
}

.tab-icon {
  font-size: 1.1rem !important;
  @apply w-4.5;
}
.tab .tab-title {
  @apply min-w-0;
  word-break: keep-all;
  white-space: nowrap;
  display: inline;
  line-height: 0.95;
}

.active {
  @apply bg-white shadow text-brand-500 hover:text-brand-500;
}
</style>
