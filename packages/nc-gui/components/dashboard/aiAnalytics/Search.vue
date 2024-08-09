<script lang="ts" setup>
import Icon from '@ant-design/icons-vue'

const store = useChataiStore()
const { isOpenTableTree } = storeToRefs(store)
const searchValue = ref('')

const route = useRoute()

const props = defineProps<{
  handleSend: (value: string, callback: () => void) => void
  isSending: boolean
}>()

const setSearch = () => {
  searchValue.value = ''
}

const handleSend = () => {
  if (!props.isSending && searchValue.value.trim()) props.handleSend(searchValue.value, setSearch)
}

const handleSelect = () => {
  isOpenTableTree.value = true
}
</script>

<template>
  <div class="search-content">
    <a-card style="width: 100%">
      <template #title>
        <a-textarea :auto-size="{ minRows: 1 }" v-model:value="searchValue" :bordered="false" placeholder="请输入内容" />
      </template>
      <SmartdataChatPlaygroundViewLeftIndexPopover
        v-if="route.name === 'chat-ai'"
        :isChatai="true"
        :isSending="props.isSending"
      />
      <div class="btn-right">
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
    </a-card>
  </div>
</template>

<style lang="scss" scoped>
.search-content {
  padding: 16px;
  .ant-card {
    border-radius: 20px !important;
    border-color: rgb(205, 215, 225) !important;
    padding: 0 6px;
    &:focus-within {
      outline: 2px solid #0b6bcb;
    }
    &:focus-visible {
      outline: 2px solid #0b6bcb;
    }
    ::v-deep .ant-card-head {
      padding: 0 !important;
      border: none;
    }
    ::v-deep .ant-card-head-title {
      padding: 0px !important;
    }
    ::v-deep .ant-input {
      padding: 8px 6px;
      font-size: 16px !important;
      color: #32383e;
    }
    ::v-deep .ant-input::placeholder {
      font-size: 16px !important;
    }
    ::v-deep .ant-card-body {
      display: flex;
      justify-content: space-between;
      padding: 11px 8px;
    }
    .btn-right {
      display: flex;
      flex: 1;
      justify-content: flex-end;
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
