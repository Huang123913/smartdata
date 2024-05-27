<script lang="ts" setup>
const { isMobileMode } = useGlobal()
const { baseUrl } = useBase()

const { base, isSharedBase } = storeToRefs(useBase())
const { isLeftSidebarOpen } = storeToRefs(useSidebarStore())
const { activeTable } = storeToRefs(useTablesStore())

const openedBaseUrl = computed(() => {
  if (!base.value) return ''

  return `${window.location.origin}/#${baseUrl({
    id: base.value.id!,
    type: 'database',
    isSharedBase: isSharedBase.value,
  })}`
})
</script>

<template>
  <div
    class="nc-table-topbar h-20 py-1 flex gap-2 items-center border-b border-gray-200 overflow-hidden relative max-h-[var(--topbar-height)] min-h-[var(--topbar-height)] md:(pr-2 pl-2) xs:(px-1)"
    style="z-index: 7"
  >
    <GeneralOpenLeftSidebarBtn />
    <div
      class="ml-0.25 flex flex-row font-medium items-center border-gray-50 transition-all duration-100"
      :class="{
        'min-w-36/100 max-w-36/100': !isMobileMode && isLeftSidebarOpen,
        'min-w-39/100 max-w-39/100': !isMobileMode && !isLeftSidebarOpen,
        'w-2/3 text-base ml-1.5': isMobileMode,
        '!max-w-3/4': isSharedBase && !isMobileMode,
      }"
    >
      <template v-if="!isMobileMode">
        <NuxtLink
          class="!hover:(text-black underline-gray-600) !underline-transparent ml-0.75 max-w-1/4"
          :class="{
            '!max-w-none': isSharedBase && !isMobileMode,
            '!text-gray-500': activeTable,
            '!text-gray-700': !activeTable,
          }"
          :to="openedBaseUrl"
        >
          <NcTooltip class="!text-inherit">
            <template #title>
              <span class="capitalize">
                {{ base?.title }}
              </span>
            </template>
            <div class="flex flex-row items-center gap-x-1.5">
              <GeneralProjectIcon
                :type="base?.type"
                class="!grayscale min-w-4"
                :style="{
                  filter: 'grayscale(100%) brightness(115%)',
                }"
              />
              <div
                class="!2xl:(flex truncate ml-1)"
                :class="{
                  '!flex': isSharedBase && !isMobileMode,
                }"
              >
                <span class="truncate !text-inherit capitalize">
                  {{ base?.title }}
                </span>
              </div>
            </div>
          </NcTooltip>
        </NuxtLink>
        <div class="px-1.75 text-gray-500">></div>
      </template>
      <template v-if="!isMobileMode">
        <NcTooltip class="truncate nc-active-table-title max-w-full" show-on-truncate-only>
          <template #title>
            {{ $t('placeholder.createTableLabel') }}
          </template>
          <span
            :class="{
              'max-w-28/100': !isMobileMode,
            }"
          >
            {{ $t('title.creatingTable') }}
          </span>
        </NcTooltip>
      </template>
    </div>
  </div>
</template>
