<script lang="ts" setup>
const { isMobileMode } = useGlobal()
const { baseUrl } = useBase()

const { base, isSharedBase } = storeToRefs(useBase())

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
    class="flex flex-row pl-2 pr-2 gap-1 border-b-1 border-gray-200 justify-between w-full"
    :class="{ 'nc-table-toolbar-mobile': isMobileMode, 'h-[var(--topbar-height)]': !isMobileMode }"
  >
    <div class="flex flex-row items-center gap-x-3">
      <GeneralOpenLeftSidebarBtn />
      <div class="ml-0.25 flex flex-row font-medium items-center border-gray-50 transition-all duration-100">
        <template v-if="!isMobileMode">
          <NuxtLink class="!hover:(text-black underline-gray-600) !underline-transparent ml-0.75 max-w-1/4" :to="openedBaseUrl">
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
                <div class="hidden !2xl:(flex truncate ml-1)">
                  <span class="truncate !text-inherit capitalize">
                    {{ base?.title }}
                  </span>
                </div>
              </div>
            </NcTooltip>
          </NuxtLink>
          <div class="px-1.75 text-gray-500">/</div>
        </template>
        <template v-if="!isMobileMode">
          <NcTooltip class="truncate nc-active-table-title max-w-full" show-on-truncate-only>
            <template #title>
              {{ $t('placeholder.createTableLabel') }}
            </template>
            <span class="text-ellipsis overflow-hidden text-gray-500 xs:ml-2 text-gray-500">
              {{ $t('title.creatingTable') }}
            </span>
          </NcTooltip>
        </template>
      </div>
    </div>
  </div>
</template>
