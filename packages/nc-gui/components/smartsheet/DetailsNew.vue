<script setup lang="ts">
import Icon from '@ant-design/icons-vue'

const route = useRoute()
const { $api } = useNuxtApp()
const sqlValue = ref('')
const { isLeftSidebarOpen } = storeToRefs(useSidebarStore())
const openedSubTab = ref('')
const isShowLoading = ref(false)
const isUpdateFrequency = ref(false)
onMounted(() => {
  init()
})

const init = async () => {
  try {
    if (route && route?.params && route.params?.viewId) {
      isShowLoading.value = true
      let entities = await $api.smartData.entity({
        entityId: route.params?.viewId,
      })
      const entity = entities[0]
      const entityProps = entity?.props
      let dataTypeProp = entityProps.findLast((p) => p.code == 'belongSQL')
      let intelligentImportProp = entityProps.findLast((p) => p.code == 'belongIntelligentImportSQLId')
      if (dataTypeProp) {
        sqlValue.value = JSON.parse(dataTypeProp.jsonValue).sql
        isUpdateFrequency.value = true
      } else {
        isUpdateFrequency.value = !!intelligentImportProp
      }
    }
  } catch (error) {
  } finally {
    openedSubTab.value = 'sql'
    isShowLoading.value = false
  }
}
</script>

<template>
  <div
    class="flex flex-col h-full w-full"
    data-testid="nc-details-wrapper"
    :class="{
      'nc-details-tab-left-sidebar-close table-detail': !isLeftSidebarOpen,
    }"
  >
    <NcTabs v-model:activeKey="openedSubTab" centered class="nc-details-tab">
      <a-tab-pane :disabled="!sqlValue" key="sql">
        <template #tab>
          <div class="tab" data-testid="nc-fields-tab">
            <GeneralIcon icon="list" class="tab-icon" />
            <div>查询sql</div>
          </div>
        </template>
        <SmartsheetDetailsSql :sqlValue="sqlValue" />
      </a-tab-pane>
      <a-tab-pane key="updateFrequency" :disabled="!isUpdateFrequency">
        <template #tab>
          <div class="tab" data-testid="nc-relations-tab">
            <icon v-if="isUpdateFrequency" class="tab-icon update-frequency-icon">
              <template #component>
                <svg
                  t="1718949455031"
                  class="icon"
                  viewBox="0 0 1024 1024"
                  version="1.1"
                  xmlns="http://www.w3.org/2000/svg"
                  p-id="4413"
                  width="16"
                  height="16"
                >
                  <path
                    d="M469.3504 341.3504v213.2992l181.2992 107.52 32.8704-54.5792-150.1696-89.1904V341.3504h-64zM896 426.6496V128l-112.64 112.64A381.2864 381.2864 0 0 0 512 128a384 384 0 1 0 384 384h-85.3504A299.008 299.008 0 0 1 512 810.6496 299.008 299.008 0 0 1 213.3504 512 299.008 299.008 0 0 1 512 213.3504c82.3296 0 157.0304 33.6896 211.2 87.4496l-125.8496 125.8496H896z"
                    fill="#4A5268"
                    p-id="4414"
                  ></path>
                </svg>
              </template>
            </icon>
            <icon v-else class="tab-icon update-frequency-icon">
              <template #component>
                <svg
                  t="1718972907166"
                  class="icon"
                  viewBox="0 0 1024 1024"
                  version="1.1"
                  xmlns="http://www.w3.org/2000/svg"
                  p-id="2393"
                  width="16"
                  height="16"
                >
                  <path
                    d="M896 432H606.506667l117.12-120.32c-116.48-115.413333-305.066667-119.68-421.546667-4.266667a293.333333 293.333333 0 0 0 0 417.706667c116.48 115.413333 305.066667 115.413333 421.546667 0 58.026667-57.6 87.04-124.373333 86.826666-208.853333H896c0 84.48-37.546667 194.133333-112.64 268.586666-149.76 148.266667-392.96 148.266667-542.72 0s-150.826667-388.693333-1.066667-536.96c149.546667-148.266667 390.186667-148.266667 539.733334 0L896 128v304zM533.333333 341.333333v181.333334l149.333334 88.746666-30.72 51.626667L469.333333 554.666667V341.333333h64z"
                    fill="#bfbfbf"
                    p-id="2394"
                  ></path>
                </svg>
              </template>
            </icon>
            <div>更新频率</div>
          </div>
        </template>
        <SmartsheetDetailsUpdateFrequency />
      </a-tab-pane>
      <a-tab-pane key="semanticRetrieval">
        <template #tab>
          <div class="tab" data-testid="nc-relations-tab">
            <icon class="tab-icon update-frequency-icon">
              <template #component>
                <svg
                  t="1719449696974"
                  class="icon"
                  viewBox="0 0 1024 1024"
                  version="1.1"
                  xmlns="http://www.w3.org/2000/svg"
                  p-id="4602"
                  width="16"
                  height="16"
                >
                  <path
                    d="M944.48 552.458667l-182.357333 330.666666a73.792 73.792 0 0 1-64.565334 38.325334h-362.133333a73.792 73.792 0 0 1-64.565333-38.325334l-182.357334-330.666666a75.338667 75.338667 0 0 1 0-72.682667l182.357334-330.666667a73.792 73.792 0 0 1 64.565333-38.325333h362.133333a73.792 73.792 0 0 1 64.565334 38.325333l182.357333 330.666667a75.338667 75.338667 0 0 1 0 72.682667z m-55.989333-31.146667a10.773333 10.773333 0 0 0 0-10.378667l-182.037334-330.666666a10.517333 10.517333 0 0 0-9.205333-5.482667H335.733333a10.517333 10.517333 0 0 0-9.205333 5.482667l-182.037333 330.666666a10.773333 10.773333 0 0 0 0 10.378667l182.037333 330.666667a10.517333 10.517333 0 0 0 9.205333 5.472h361.514667a10.517333 10.517333 0 0 0 9.205333-5.472l182.037334-330.666667zM513.738667 682.666667c-94.261333 0-170.666667-76.405333-170.666667-170.666667s76.405333-170.666667 170.666667-170.666667c94.250667 0 170.666667 76.405333 170.666666 170.666667s-76.416 170.666667-170.666666 170.666667z m0-64c58.912 0 106.666667-47.754667 106.666666-106.666667s-47.754667-106.666667-106.666666-106.666667-106.666667 47.754667-106.666667 106.666667 47.754667 106.666667 106.666667 106.666667z"
                    fill="#4A5268"
                    p-id="4603"
                  ></path>
                </svg>
              </template>
            </icon>
            <div>检索语义设置</div>
          </div>
        </template>
        <SmartsheetDetailsSemanticRetrieval />
      </a-tab-pane>
    </NcTabs>
  </div>
  <SmartdataChatPlaygroundViewCommonLoading :isShow="isShowLoading" />
</template>

<style lang="scss" scoped>
.tab {
  @apply flex flex-row items-center gap-x-1.5 pr-0.5;
}

::v-deep .nc-tabs {
  .ant-tabs-nav-list {
    .ant-tabs-tab-disabled {
      .ant-tabs-tab-btn {
        color: rgba(0, 0, 0, 0.25) !important;
      }
    }
  }
}

:deep(.ant-tabs-nav) {
  min-height: calc(var(--topbar-height) - 1.75px);
}
.update-frequency-icon {
  margin-right: 0 !important;
}
</style>

<style lang="scss">
.nc-details-tab.nc-tabs.centered {
  > .ant-tabs-nav {
    .ant-tabs-nav-wrap {
      @apply absolute mx-auto -left-9.5;
    }
  }
}

.nc-details-tab-left-sidebar-close > .nc-details-tab.nc-tabs.centered {
  > .ant-tabs-nav {
    .ant-tabs-nav-wrap {
      @apply absolute mx-auto left-0;
    }
  }
}
</style>
