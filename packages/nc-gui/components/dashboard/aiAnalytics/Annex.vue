<script lang="ts" setup>
import docx from '../../../assets/img/docx.png'
import txt from '../../../assets/img/txt.png'
import xlsx from '../../../assets/img/xlsx.png'

const props = defineProps<{
  item: any
  download: (item: any, isAll: boolean, index: number) => void
}>()

const fileLogos = {
  doc: docx,
  docx: docx,
  xls: xlsx,
  xlsx: xlsx,
  txt: txt,
}
</script>

<template>
  <div class="annex">
    <div class="annex-item border-1 border-gray-200" v-for="(annex, index) in item.data">
      <div class="left">
        <div class="logo">
          <img :src="fileLogos[annex.type]" />
        </div>
        <div class="info">
          <div class="name">
            <NcTooltip class="truncate max-w-full" show-on-truncate-only>
              <template #title>
                {{ annex.name }}
              </template>
              <span
                class="text-ellipsis overflow-hidden"
                :style="{
                  wordBreak: 'keep-all',
                  whiteSpace: 'nowrap',
                  display: 'inline',
                }"
              >
                {{ annex.name }}
              </span>
            </NcTooltip>
          </div>
          <div class="size">{{ annex?.size }}</div>
        </div>
      </div>
      <div class="right">
        <GeneralIcon icon="download" @click="download(item, false, index)" />
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.annex {
  width: 70%;
  .annex-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px;
    margin-top: 10px;
    border-radius: 10px;

    .left {
      display: flex;
      align-items: center;
      width: calc(100% - 35px);
      .logo {
        margin-right: 10px;
        width: 32px;
        height: 32px;
        img {
          width: 100%;
          height: 100%;
        }
      }
      .info {
        width: calc(100% - 42px);
      }
    }
    .right {
      margin-left: 20px;
    }
  }
}
</style>
