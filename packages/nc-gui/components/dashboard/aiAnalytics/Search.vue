<script lang="ts" setup>
import Icon, { CloseOutlined } from '@ant-design/icons-vue'

const store1 = useaiAnalyticsStore()
const { isCurentDataForChart } = storeToRefs(store1)
const { setTableForChart, setTableDataForChart } = store1
const store = useChataiStore()
const { isOpenTableTree } = storeToRefs(store)
const searchValue = ref('')
const input = ref<HTMLInputElement>()

const route = useRoute()

const props = defineProps<{
  handleSend: (value: string, isAdd: boolean, isGenerateCharts: boolean, callback: () => void) => void
  isSending: boolean
  isOverSession: boolean
  clearAllSession: (value: boolean) => void
}>()

const show = ref(false)
const isGenerateCharts = ref(false)
const selectedTableForChart = ref<any>(null)
const placeholder = ref(`${isGenerateCharts.value ? '描述要生成的图表' : '发送消息、输入@选择表格'}`)

const setSearch = () => {
  searchValue.value = ''
}

const handleselectedTableForChart = (item: any) => {
  selectedTableForChart.value = item
  placeholder.value = `选择了${selectedTableForChart.value.name}表数据生成图表`
  setTableForChart(item)
  isCurentDataForChart.value = false
}

const handleSend = () => {
  if (isGenerateCharts.value && !selectedTableForChart.value && !isCurentDataForChart.value) {
    message.warn('请先选择注入图表的数据')
    return
  }
  console.log('发送前', isGenerateCharts.value)
  if (!props.isSending && searchValue.value.trim()) props.handleSend(searchValue.value, true, isGenerateCharts.value, setSearch)
}

const handleSelect = () => {
  isOpenTableTree.value = true
}
const handleSelectExistingModel = (item: any) => {
  show.value = false
  console.log('item', item)
  const atIndex = searchValue.value.indexOf('@')
  searchValue.value = searchValue.value.substring(0, atIndex) + item.name + searchValue.value.substring(atIndex + 1)
}

watch(searchValue, () => {
  if (searchValue.value.includes('@')) {
    show.value = true
  } else {
    show.value = false
  }
})

//isGenerateCharts
watch(isGenerateCharts, () => {
  placeholder.value = `${isGenerateCharts.value ? '描述要生成的图表' : '发送消息、输入@选择表格'}`
  if (isGenerateCharts.value) {
    nextTick(() => {
      input.value?.focus()
    })
  }
})

watch(isCurentDataForChart, () => {
  if (isCurentDataForChart.value) {
    isGenerateCharts.value = true
    placeholder.value = `${isGenerateCharts.value ? '描述要生成的图表' : '发送消息、输入@选择表格'}`
  }
})

const handlegenerateCharts = () => {
  isGenerateCharts.value = true
}
const handleCloseGenerate = () => {
  isGenerateCharts.value = false
  selectedTableForChart.value = null
  setTableForChart(null)
  isCurentDataForChart.value = false
  setTableDataForChart([])
}

// async getPersonalizedInfo(ipValue:string,ownerId:string) {
//     return await axios.get(`${ipValue}/webapi/vbase_prd_united_login_api/API_GetPersonalizedInfo?ownerId=${ownerId}`).then((r) => {
//       return r.data;
//     });
//   }
</script>

<template>
  <div class="search-content">
    <DashboardAiAnalyticsCreateNewSession v-if="isOverSession" :clearAllSession="clearAllSession" />
    <div v-if="!isGenerateCharts" class="generate-charts" @click="handlegenerateCharts">
      <svg
        t="1729147397562"
        class="icon"
        viewBox="0 0 1024 1024"
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
        p-id="9987"
        width="20"
        height="20"
      >
        <path
          d="M114.039467 830.481067h94.9248a41.361067 41.361067 0 0 0 41.3184-41.3184V222.557867a41.361067 41.361067 0 0 0-41.3184-41.3184H114.039467a41.361067 41.361067 0 0 0-41.3184 41.3184V789.162667a41.361067 41.361067 0 0 0 41.3184 41.3184z m-15.7184-607.9232c0-8.669867 7.048533-15.7184 15.7184-15.7184h94.9248c8.669867 0 15.7184 7.048533 15.7184 15.7184V789.162667a15.735467 15.735467 0 0 1-15.7184 15.7184H114.039467a15.735467 15.735467 0 0 1-15.7184-15.7184V222.557867zM352.426667 830.481067h94.9248a41.361067 41.361067 0 0 0 41.3184-41.3184V411.3152a41.361067 41.361067 0 0 0-41.3184-41.3184H352.426667a41.361067 41.361067 0 0 0-41.3184 41.3184V789.162667a41.378133 41.378133 0 0 0 41.3184 41.3184z m-15.709867-419.165867c0-8.669867 7.048533-15.7184 15.7184-15.7184h94.9248c8.669867 0 15.7184 7.048533 15.7184 15.7184V789.162667a15.735467 15.735467 0 0 1-15.7184 15.7184H352.426667a15.735467 15.735467 0 0 1-15.7184-15.7184l0.008533-377.847467zM562.312533 548.352a12.8 12.8 0 0 0-12.8 12.8v227.6608a41.6768 41.6768 0 0 0 41.6768 41.6768h94.199467a41.6768 41.6768 0 0 0 41.6768-41.6768V631.722667a12.8 12.8 0 0 0-25.6 0v157.0816c0 8.874667-7.1936 16.0768-16.0768 16.0768H591.189333a16.0768 16.0768 0 0 1-16.0768-16.0768V561.152a12.8 12.8 0 0 0-12.8-12.8zM795.7504 925.866667H89.6768a12.8 12.8 0 0 0 0 25.6h706.065067a12.8 12.8 0 0 0 0.008533-25.6zM766.7712 76.100267c-126.976 0-230.272 103.304533-230.272 230.280533s103.296 230.280533 230.272 230.280533 230.280533-103.304533 230.280533-230.280533-103.304533-230.280533-230.280533-230.280533z m0 25.6c6.818133 0 13.550933 0.349867 20.189867 1.006933l-17.911467 179.2a22.033067 22.033067 0 0 1-9.1392 15.863467 22.135467 22.135467 0 0 1-17.954133 3.677866l-174.9504-39.466666c20.334933-91.579733 102.152533-160.2816 199.765333-160.2816z m0 409.3696c-112.861867 0-204.672-91.818667-204.672-204.680534 0-6.4256 0.3328-12.782933 0.9216-19.063466l173.303467 39.0912a47.889067 47.889067 0 0 0 58.197333-41.966934l17.749333-177.5872c91.025067 20.753067 159.1808 102.2976 159.1808 199.5264 0 112.861867-91.810133 204.680533-204.680533 204.680534z"
          fill="#231815"
          p-id="9988"
        ></path>
        <path
          d="M950.0416 771.729067h-41.002667v-41.002667a12.8 12.8 0 0 0-25.6 0v41.002667h-41.002666a12.8 12.8 0 0 0 0 25.6h41.002666v41.002666a12.8 12.8 0 0 0 25.6 0v-41.002666h41.002667a12.8 12.8 0 0 0 0-25.6z"
          fill="#231815"
          p-id="9989"
        ></path>
      </svg>
      <span>图表生成</span>
    </div>
    <a-card style="width: 100%">
      <template #title>
        <div v-if="isGenerateCharts" class="generate-charts-header">
          <div class="generate-charts-header-left">
            <svg
              t="1729147397562"
              class="icon"
              viewBox="0 0 1024 1024"
              version="1.1"
              xmlns="http://www.w3.org/2000/svg"
              p-id="9987"
              width="16"
              height="16"
            >
              <path
                d="M114.039467 830.481067h94.9248a41.361067 41.361067 0 0 0 41.3184-41.3184V222.557867a41.361067 41.361067 0 0 0-41.3184-41.3184H114.039467a41.361067 41.361067 0 0 0-41.3184 41.3184V789.162667a41.361067 41.361067 0 0 0 41.3184 41.3184z m-15.7184-607.9232c0-8.669867 7.048533-15.7184 15.7184-15.7184h94.9248c8.669867 0 15.7184 7.048533 15.7184 15.7184V789.162667a15.735467 15.735467 0 0 1-15.7184 15.7184H114.039467a15.735467 15.735467 0 0 1-15.7184-15.7184V222.557867zM352.426667 830.481067h94.9248a41.361067 41.361067 0 0 0 41.3184-41.3184V411.3152a41.361067 41.361067 0 0 0-41.3184-41.3184H352.426667a41.361067 41.361067 0 0 0-41.3184 41.3184V789.162667a41.378133 41.378133 0 0 0 41.3184 41.3184z m-15.709867-419.165867c0-8.669867 7.048533-15.7184 15.7184-15.7184h94.9248c8.669867 0 15.7184 7.048533 15.7184 15.7184V789.162667a15.735467 15.735467 0 0 1-15.7184 15.7184H352.426667a15.735467 15.735467 0 0 1-15.7184-15.7184l0.008533-377.847467zM562.312533 548.352a12.8 12.8 0 0 0-12.8 12.8v227.6608a41.6768 41.6768 0 0 0 41.6768 41.6768h94.199467a41.6768 41.6768 0 0 0 41.6768-41.6768V631.722667a12.8 12.8 0 0 0-25.6 0v157.0816c0 8.874667-7.1936 16.0768-16.0768 16.0768H591.189333a16.0768 16.0768 0 0 1-16.0768-16.0768V561.152a12.8 12.8 0 0 0-12.8-12.8zM795.7504 925.866667H89.6768a12.8 12.8 0 0 0 0 25.6h706.065067a12.8 12.8 0 0 0 0.008533-25.6zM766.7712 76.100267c-126.976 0-230.272 103.304533-230.272 230.280533s103.296 230.280533 230.272 230.280533 230.280533-103.304533 230.280533-230.280533-103.304533-230.280533-230.280533-230.280533z m0 25.6c6.818133 0 13.550933 0.349867 20.189867 1.006933l-17.911467 179.2a22.033067 22.033067 0 0 1-9.1392 15.863467 22.135467 22.135467 0 0 1-17.954133 3.677866l-174.9504-39.466666c20.334933-91.579733 102.152533-160.2816 199.765333-160.2816z m0 409.3696c-112.861867 0-204.672-91.818667-204.672-204.680534 0-6.4256 0.3328-12.782933 0.9216-19.063466l173.303467 39.0912a47.889067 47.889067 0 0 0 58.197333-41.966934l17.749333-177.5872c91.025067 20.753067 159.1808 102.2976 159.1808 199.5264 0 112.861867-91.810133 204.680533-204.680533 204.680534z"
                fill="#231815"
                p-id="9988"
              ></path>
              <path
                d="M950.0416 771.729067h-41.002667v-41.002667a12.8 12.8 0 0 0-25.6 0v41.002667h-41.002666a12.8 12.8 0 0 0 0 25.6h41.002666v41.002666a12.8 12.8 0 0 0 25.6 0v-41.002666h41.002667a12.8 12.8 0 0 0 0-25.6z"
                fill="#231815"
                p-id="9989"
              ></path>
            </svg>
            <span>图表生成</span>
            <span v-if="selectedTableForChart">已选择{{ selectedTableForChart.name }}表数据</span>
          </div>
          <div class="generate-charts-header-right">
            <close-outlined class="colse-btn" @click="handleCloseGenerate" />
          </div>
        </div>
        <a-textarea
          ref="input"
          :auto-size="{ minRows: 1 }"
          v-model:value="searchValue"
          :bordered="false"
          :placeholder="placeholder"
        />
      </template>
      <SmartdataChatPlaygroundViewLeftIndexPopover
        v-if="route.name === 'chat-ai'"
        :isChatai="true"
        :isSending="props.isSending"
      />
      <div class="btn-content">
        <div class="btn-content-left">
          <template v-if="isGenerateCharts">
            <DashboardAiAnalyticsAddData :handleselectedTableForChart="handleselectedTableForChart" />
          </template>
        </div>
        <div class="btn-content-right">
          <a-button
            v-if="route.name === 'chat-ai'"
            :disabled="isSending"
            type="primary"
            size="middle"
            class="select-btn"
            @click="handleSelect()"
          >
            选择范围
          </a-button>
          <!-- <DashboardAiAnalyticsQuickPhraseList :handleSend="handleSend" /> -->
          <NcTooltip>
            <template #title>发送</template>
            <icon
              @click="handleSend()"
              :style="{
                opacity: !searchValue?.trim() || isSending ? 0.5 : 1,
                cursor: !searchValue?.trim() || isSending ? 'not-allowed' : 'pointer',
              }"
            >
              <template #component>
                <svg
                  t="1720665375740"
                  class="icon"
                  viewBox="0 0 1024 1024"
                  version="1.1"
                  xmlns="http://www.w3.org/2000/svg"
                  p-id="3943"
                  width="24"
                  height="24"
                >
                  <path
                    d="M873.8816 150.1184C973.9264 250.2656 1024 370.8928 1024 512c0 141.2096-50.0736 261.8368-150.1184 361.8816C773.7344 973.9264 653.1072 1024 512 1024c-141.1072 0-261.7344-50.0736-361.8816-150.1184C50.0736 773.8368 0 653.2096 0 512c0-141.1072 50.0736-261.7344 150.1184-361.8816C250.2656 50.0736 370.8928 0 512 0 653.1072 0 773.7344 50.0736 873.8816 150.1184zM819.712 526.7456 507.0848 211.6608 192 526.7456l56.6272 54.1696 219.0336-219.0336 0 477.4912 78.7456 0L546.4064 361.8816l219.0336 219.0336L819.712 526.7456z"
                    p-id="3944"
                    fill="#0b6bcb"
                  ></path>
                </svg>
              </template>
            </icon>
          </NcTooltip>
        </div>
      </div>
    </a-card>
    <DashboardAiAnalyticsQuickTableList
      :isGenerateEcharts="isGenerateCharts"
      :handleSelectExistingModel="handleSelectExistingModel"
      :show="show"
    />
  </div>
</template>

<style lang="scss" scoped>
.search-content {
  padding: 16px;
  position: relative;
  .generate-charts {
    width: 106px;
    box-shadow: inset 0 0 0 1px #e2e2e3;
    border-radius: 13px;
    display: flex;
    align-items: center;
    padding: 7px 13px;
    cursor: pointer;
    white-space: nowrap;
    box-sizing: border-box;
    margin-bottom: 8px;
    margin-left: 2px;
    justify-content: space-between;
  }
  .generate-charts-header {
    height: 40px;
    width: 100%;
    background-color: #f9fafb;
    height: 40px;
    width: 100%;
    border-top-left-radius: 19px;
    border-top-right-radius: 19px;
    margin-top: 1px;
    padding: 0 16px;
    display: flex;
    justify-content: space-between;
  }
  .generate-charts-header-left {
    display: flex;
    align-items: center;
    height: 100%;
    span {
      margin-left: 6px;
      margin-top: 2px;
      font-size: 14px;
    }
  }
  .generate-charts-header-right {
    display: flex;
    align-items: center;
    height: 100%;
  }
  .ant-card {
    border-radius: 20px !important;
    border-color: rgb(205, 215, 225) !important;
    // padding: 0 6px;
    &:focus-within {
      outline: 2px solid #0b6bcb;
    }
    &:focus-visible {
      outline: 2px solid #0b6bcb;
    }
    ::v-deep .ant-card-head {
      padding: 0 !important;
      border: none;
      position: relative;
    }
    ::v-deep .ant-card-head-title {
      padding: 0px !important;
    }
    ::v-deep .ant-input {
      padding: 8px 6px 8px 10px;
      font-size: 15px !important;
      color: #32383e;
    }
    ::v-deep .ant-input::placeholder {
      font-size: 15px !important;
    }
    ::v-deep .ant-card-body {
      display: flex;
      justify-content: space-between;
      padding: 11px 8px;
    }
    .btn-content {
      display: flex;
      flex: 1;
      justify-content: space-between;
      align-items: center;
    }
  }
  .select-btn {
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #0b6bcb;
    border-radius: 6px;
    color: white;
    font-size: 14px;
    font-weight: 600;
    margin-right: 20px;
  }
}
</style>
