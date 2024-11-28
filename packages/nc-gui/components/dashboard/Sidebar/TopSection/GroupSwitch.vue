<script lang="ts" setup>
/**
 * 企业切换
 */
import { ref } from '#imports'

const store = useGroupList()
const { group } = storeToRefs(store)
const { switchGroup } = store
const clicked = ref<boolean>(false)

const handleClickChange = (visible: boolean) => {
  if (!visible) clicked.value = visible
}
</script>
<template>
  <NcDropdown
    :trigger="['click']"
    class="switch-group-btn"
    :class="{ show: clicked }"
    :visible="clicked"
    @visibleChange="handleClickChange"
    :overlayClassName="'group-list'"
  >
    <GeneralBaseIcon
      :onClick="
        () => {
          clicked = true
        }
      "
      class="switch-group-icon min-w-5.75 min-h-5.75 mt-0.2 mr-0.25 px-0.5 !text-gray-600 transition-opacity group-hover:opacity-100 nc-tbl-context-menu outline-0 rounded-md hover:(bg-gray-500 bg-opacity-15 !text-black)"
    >
      <svg
        t="1732774785991"
        class="icon"
        viewBox="0 0 1024 1024"
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
        p-id="8525"
        width="16"
        height="16"
      >
        <path
          d="M96 416h832c0.32 0 0.576-0.192 0.896-0.192a30.656 30.656 0 0 0 30.976-30.976C959.808 384.576 960 384.32 960 384a31.424 31.424 0 0 0-14.912-26.368l-188.48-188.48a30.72 30.72 0 1 0-43.456 43.456L852.544 352H96a32 32 0 0 0 0 64zM928 608h-832c-0.32 0-0.576 0.192-0.896 0.192a30.528 30.528 0 0 0-30.976 30.976C64.192 639.424 64 639.68 64 640c0 11.264 6.144 20.672 14.912 26.368l188.48 188.48a30.72 30.72 0 1 0 43.456-43.456L171.456 672H928a32 32 0 0 0 0-64z"
          fill=""
          p-id="8526"
        ></path>
      </svg>
    </GeneralBaseIcon>

    <template #overlay>
      <NcMenu>
        <NcMenuItem
          :class="{ selected: group.currentGroup.id === item.id }"
          v-for="item in group.groupList"
          @click="switchGroup(item.id)"
        >
          <div class="flex gap-2 items-center">
            {{ item.groupName_cn }}
          </div>
        </NcMenuItem>
      </NcMenu>
    </template>
  </NcDropdown>
</template>

<style lang="scss">
.group-list {
  .ant-dropdown-menu {
    min-width: 200px;
  }
  .selected {
    background-color: #eaeefc !important;
  }
}
</style>

<style lang="scss" scoped>
.switch-group-icon {
  margin: 0 !important;
  position: relative;
  right: -4px;
  display: flex;
  align-items: center;
}
</style>
