<script lang="ts" setup>
import { ref } from '#imports'

const props = defineProps<{
  handleSend: (value: string, isAdd: boolean, callback: () => void) => void
}>()
const clicked = ref<boolean>(false)

const quickPhraseList = ['正确', '对', '确定', 'sql确认正确', '错误', '结束对话']
const handleClickChange = (visible: boolean) => {
  if (!visible) clicked.value = visible
}
const handleSelect = (item: any) => {
  props.handleSend(item, true, () => {})
  console.log(item)
  clicked.value = false
}
</script>
<template>
  <NcDropdown :overlayClassName="'quick-phrase-list'" :trigger="['click']" :visible="clicked" @visibleChange="handleClickChange">
    <div
      class="quick-phrase-list-icon"
      @click="
            (e:any) => {
              e.stopPropagation()
              clicked = true
            }
          "
    >
      <NcTooltip>
        <template #title>快捷回复短语</template>
        <GeneralBaseIcon>
          <svg
            t="1726303623828"
            class="icon"
            viewBox="0 0 1024 1024"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            p-id="15214"
            width="24"
            height="24"
          >
            <path
              d="M512 85.333333c235.648 0 426.666667 191.018667 426.666667 426.666667s-191.018667 426.666667-426.666667 426.666667S85.333333 747.648 85.333333 512 276.352 85.333333 512 85.333333z m0 64C311.701333 149.333333 149.333333 311.701333 149.333333 512s162.368 362.666667 362.666667 362.666667 362.666667-162.368 362.666667-362.666667S712.298667 149.333333 512 149.333333z m-202.666667 469.333334a32 32 0 1 1 0 64 32 32 0 0 1 0-64z m405.333334 0a32 32 0 0 1 0 64h-277.333334a32 32 0 0 1 0-64h277.333334z m-405.333334-149.333334a32 32 0 1 1 0 64 32 32 0 0 1 0-64z m405.333334 0a32 32 0 0 1 0 64h-277.333334a32 32 0 0 1 0-64h277.333334z m-405.333334-149.333333a32 32 0 1 1 0 64 32 32 0 0 1 0-64z m405.333334 0a32 32 0 0 1 0 64h-277.333334a32 32 0 0 1 0-64h277.333334z"
              fill="#2C2C2C"
              p-id="15215"
            ></path>
          </svg>
        </GeneralBaseIcon>
      </NcTooltip>
    </div>

    <template #overlay>
      <NcMenu>
        <NcMenuItem v-for="item in quickPhraseList" @click="handleSelect(item)">
          <div class="flex gap-2 items-center text-gray-700">
            {{ item }}
          </div>
        </NcMenuItem>
      </NcMenu>
    </template>
  </NcDropdown>
</template>

<style lang="scss">
.quick-phrase-list {
  .ant-dropdown-content {
    min-width: 170px;
  }
}
.quick-phrase-list-icon {
  margin-right: 15px;
  position: relative;
  top: 1px;

  .anticon {
    margin-right: -2px;
    vertical-align: 1px;
  }
}
.add-catalog-icon {
  width: 23px;
  height: 23px;
}
.add-catalog-dropdown {
  .ant-dropdown-menu {
    min-width: 200px;
  }
}
</style>
