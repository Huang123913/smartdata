<script lang="ts" setup>
const props = defineProps<{
  item: any
  downloadImage: (base64data: string[]) => void
}>()
const locale = {
  Image: {
    preview: '预览',
  },
}
</script>

<template>
  <div class="img">
    <div class="img-item border-1 border-gray-200" v-for="(image, index) in item.data">
      <div class="left">
        <a-config-provider :locale="locale">
          <a-image :width="80" :src="image?.content || image" />
        </a-config-provider>
        <div v-if="image?.name" class="name">
          <NcTooltip class="truncate max-w-full" show-on-truncate-only>
            <template #title>
              {{ image.name }}
            </template>
            <span
              class="text-ellipsis overflow-hidden"
              :style="{
                wordBreak: 'keep-all',
                whiteSpace: 'nowrap',
                display: 'inline',
              }"
            >
              {{ image.name }}
            </span>
          </NcTooltip>
        </div>
      </div>
      <div class="right"><GeneralIcon icon="download" @click="downloadImage([image?.content || image])" /></div>
    </div>
  </div>
</template>

<style lang="scss">
.img {
  width: 100%;
  .img-item {
    width: 70%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 10px;
    padding: 8px;
    border-radius: 10px;
    .left {
      display: flex;
      align-items: center;
      width: calc(100% - 35px);
      .name {
        width: calc(100% - 90px);
      }
    }
  }
  .ant-image {
    margin-right: 10px;
  }
  .ant-image-img {
    height: 100%;
  }
  .ant-image-mask-info {
    display: flex;
    align-items: center;
  }
}

.ant-image-preview-img-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
