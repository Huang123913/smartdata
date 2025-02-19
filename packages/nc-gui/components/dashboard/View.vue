<script lang="ts" setup>
import 'splitpanes/dist/splitpanes.css'

import { Pane, Splitpanes } from 'splitpanes'

import { useaiAnalyticsStore } from '../../store/aiAnalytics'

const router = useRouter()
const route = router.currentRoute
const { activeTable } = storeToRefs(useTablesStore())
const { isIntelligentQuestionOpen, mobileNormalizedIntelligentQuestionSize, intelligentQuestionWidth, intelligentQuestionSize } =
  storeToRefs(useaiAnalyticsStore())
const { isMobileMode } = storeToRefs(useConfigStore())

const {
  isLeftSidebarOpen,
  leftSidebarWidthPercent,
  leftSideBarSize: sideBarSize,
  leftSidebarState: sidebarState,
  mobileNormalizedSidebarSize,
} = storeToRefs(useSidebarStore())

const wrapperRef = ref<HTMLDivElement>()

const animationDuration = 250
const viewportWidth = ref(window.innerWidth)

const currentSidebarSize = computed({
  get: () => sideBarSize.value.current,
  set: (val) => {
    sideBarSize.value.current = val
    sideBarSize.value.old = val
  },
})

const { handleSidebarOpenOnMobileForNonViews } = useConfigStore()

const contentSize = computed(() => 100 - sideBarSize.value.current - intelligentQuestionSize.value)

const mobileNormalizedContentSize = computed(() => {
  if (isMobileMode.value) {
    return isLeftSidebarOpen.value ? 0 : 100
  }

  return contentSize.value
})

const sidebarWidth = computed(() =>
  isMobileMode.value ? viewportWidth.value : (sideBarSize.value.old * viewportWidth.value) / 100,
)

watch(currentSidebarSize, () => {
  leftSidebarWidthPercent.value = currentSidebarSize.value
})

watch(isLeftSidebarOpen, () => {
  sideBarSize.value.current = sideBarSize.value.old

  if (isLeftSidebarOpen.value) {
    setTimeout(() => (sidebarState.value = 'openStart'), 0)

    setTimeout(() => (sidebarState.value = 'openEnd'), animationDuration)
  } else {
    sideBarSize.value.old = sideBarSize.value.current
    sideBarSize.value.current = 0

    sidebarState.value = 'hiddenStart'

    setTimeout(() => {
      sidebarState.value = 'hiddenEnd'
    }, animationDuration)
  }
})

function handleMouseMove(e: MouseEvent) {
  if (isMobileMode.value) return
  if (!wrapperRef.value) return
  if (sidebarState.value === 'openEnd') return

  if (e.clientX < 4 && ['hiddenEnd', 'peekCloseEnd'].includes(sidebarState.value)) {
    sidebarState.value = 'peekOpenStart'

    setTimeout(() => {
      sidebarState.value = 'peekOpenEnd'
    }, animationDuration)
  } else if (e.clientX > sidebarWidth.value + 10 && sidebarState.value === 'peekOpenEnd') {
    sidebarState.value = 'peekCloseOpen'

    setTimeout(() => {
      sidebarState.value = 'peekCloseEnd'
    }, animationDuration)
  }
}

function onWindowResize() {
  viewportWidth.value = window.innerWidth

  onResize(currentSidebarSize.value)
}

onMounted(() => {
  document.addEventListener('mousemove', handleMouseMove)
  window.addEventListener('resize', onWindowResize)
})

onBeforeUnmount(() => {
  document.removeEventListener('mousemove', handleMouseMove)
  window.removeEventListener('resize', onWindowResize)
})

watch(route, () => {
  if (route.value.name === 'index-index') {
    isLeftSidebarOpen.value = true
  }
  if (
    route.value.name === 'index-typeOrId-baseId-index-index-viewId-viewTitle-slugs' &&
    route.value.params.slugs.includes('field')
  ) {
    isIntelligentQuestionOpen.value = false
    return
  }
  if (route.value.name !== 'index-typeOrId-baseId-index-index-viewId-viewTitle') {
    isIntelligentQuestionOpen.value = false
  }
})

watch(isMobileMode, () => {
  isLeftSidebarOpen.value = !isMobileMode.value
})

watch(sidebarState, () => {
  if (sidebarState.value === 'peekCloseEnd') {
    setTimeout(() => {
      sidebarState.value = 'hiddenEnd'
    }, animationDuration)
  }
})

watch(
  () => activeTable.value?.id,
  async () => {
    isIntelligentQuestionOpen.value = false
  },
  {
    immediate: true,
  },
)

onMounted(() => {
  handleSidebarOpenOnMobileForNonViews()
})

const remToPx = (rem: number) => {
  const fontSize = parseFloat(getComputedStyle(document.documentElement).fontSize)
  return rem * fontSize
}

function onResize(widthPercent: any) {
  if (isMobileMode.value) return

  const width = (widthPercent * viewportWidth.value) / 100

  const fontSize = parseFloat(getComputedStyle(document.documentElement).fontSize)

  // If the viewport width is less than 1560px, the max sidebar width should be 20rem

  if (viewportWidth.value <= 1560) {
    if (width > remToPx(20)) {
      sideBarSize.value.old = ((20 * fontSize) / viewportWidth.value) * 100
      if (isLeftSidebarOpen.value) sideBarSize.value.current = sideBarSize.value.old
      return
    }
  }

  const widthRem = width / fontSize

  if (widthRem < 16) {
    sideBarSize.value.old = ((16 * fontSize) / viewportWidth.value) * 100
    if (isLeftSidebarOpen.value) sideBarSize.value.current = sideBarSize.value.old
    return
  } else if (widthRem > 35) {
    sideBarSize.value.old = ((35 * fontSize) / viewportWidth.value) * 100
    if (isLeftSidebarOpen.value) sideBarSize.value.current = sideBarSize.value.old

    return
  }

  sideBarSize.value.old = widthPercent
  sideBarSize.value.current = sideBarSize.value.old
}

const normalizedWidth = computed(() => {
  const maxSize = remToPx(35)
  const minSize = remToPx(16)
  if (sidebarWidth.value > maxSize) {
    return maxSize
  } else if (sidebarWidth.value < minSize) {
    return minSize
  } else {
    return sidebarWidth.value
  }
})
</script>

<template>
  <Splitpanes
    class="nc-sidebar-content-resizable-wrapper !w-screen h-full"
    :class="{
      'hide-resize-bar': !isLeftSidebarOpen || sidebarState === 'openStart',
    }"
    @ready="() => onWindowResize()"
    @resize="(event: any) => onResize(event[0].size)"
  >
    <Pane
      min-size="15%"
      :size="mobileNormalizedSidebarSize"
      max-size="60%"
      class="nc-sidebar-splitpane !sm:max-w-140 relative !overflow-visible flex"
      :style="{
        width: `${mobileNormalizedSidebarSize}%`,
      }"
    >
      <div
        ref="wrapperRef"
        class="nc-sidebar-wrapper relative flex flex-col h-full justify-center !sm:(max-w-140) absolute overflow-visible"
        :class="{
          'mobile': isMobileMode,
          'minimized-height': !isLeftSidebarOpen,
          'hide-sidebar': ['hiddenStart', 'hiddenEnd', 'peekCloseEnd'].includes(sidebarState),
        }"
        :style="{
          width: sidebarState === 'hiddenEnd' ? '0px' : `${sidebarWidth}px`,
          minWidth: sidebarState === 'hiddenEnd' ? '0px' : `${normalizedWidth}px`,
        }"
      >
        <slot name="sidebar" />
      </div>
    </Pane>
    <Pane
      :size="mobileNormalizedContentSize"
      class="flex-grow"
      :style="{
        'min-width': `${100 - mobileNormalizedSidebarSize - mobileNormalizedIntelligentQuestionSize}%`,
      }"
    >
      <slot name="content" />
    </Pane>

    <Pane
      :size="mobileNormalizedIntelligentQuestionSize"
      :style="{
        width: `${mobileNormalizedIntelligentQuestionSize}%`,
      }"
    >
      <div
        ref="intelligentQuestionRef"
        :style="{
          width: `${intelligentQuestionWidth}px`,
        }"
      >
        <slot name="aiAnalytics" />
      </div>
    </Pane>
  </Splitpanes>
</template>

<style lang="scss">
.nc-sidebar-wrapper.minimized-height > * {
  @apply h-4/5 pb-2 !(rounded-r-lg border-1 border-gray-200 shadow-lg);
  width: calc(100% + 4px);
}

.mobile.nc-sidebar-wrapper.minimized-height > * {
  @apply !h-full;
}

.nc-sidebar-wrapper > * {
  transition: all 0.2s ease-in-out;
  @apply z-10 absolute;
}

.nc-sidebar-wrapper.hide-sidebar {
  @apply !min-w-0;

  > * {
    @apply opacity-0;
    z-index: -1 !important;
    transform: translateX(-100%);
  }
}

/** Split pane CSS */

.nc-sidebar-content-resizable-wrapper > {
  .splitpanes__splitter {
    @apply !w-0 relative overflow-visible;
  }
  .splitpanes__splitter:before {
    @apply bg-gray-200 w-0.25 absolute left-0 top-0 h-full z-40;
    content: '';
  }

  .splitpanes__splitter:hover:before {
    @apply bg-scrollbar;
    width: 3px !important;
    left: 0px;
  }

  .splitpanes--dragging .splitpanes__splitter:before {
    @apply bg-scrollbar;
    width: 3px !important;
    left: 0px;
  }

  .splitpanes--dragging .splitpanes__splitter {
    @apply w-1 mr-0;
  }
}

.nc-sidebar-content-resizable-wrapper.hide-resize-bar > {
  .splitpanes__splitter {
    cursor: default !important;
    opacity: 0 !important;
    background-color: transparent !important;
  }
}

.splitpanes__pane {
  transition: width 0.15s ease-in-out !important;
}

.splitpanes--dragging {
  cursor: col-resize;

  > .splitpanes__pane {
    transition: none !important;
  }
}
</style>
