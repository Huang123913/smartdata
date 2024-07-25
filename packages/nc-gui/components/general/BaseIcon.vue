<script lang="ts" setup>
import { defineProps } from 'vue'

import Icon from '@ant-design/icons-vue'

const props = defineProps<{
  onClick?: () => void
}>()

function handleClick(event: MouseEvent) {
  if (props.onClick) {
    props.onClick()
  }
}
</script>
<template>
  <icon @click="handleClick">
    <template #component>
      <slot></slot>
    </template>
  </icon>
</template>

<style scoped></style>
