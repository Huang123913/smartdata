<script lang="ts" setup>
import { UITypes } from 'nocodb-sdk';

const props = defineProps<{
  value: any
  isVisibleDefaultValueInput: boolean
}>()
const emits = defineEmits(['update:value', 'update:isVisibleDefaultValueInput'])

provide(EditColumnInj, ref(true))

const vModel = useVModel(props, 'value', emits)

const isVisibleDefaultValueInput = useVModel(props, 'isVisibleDefaultValueInput', emits)

const rowRef = ref({
  row: {},
  oldRow: {},
  rowMeta: {
    isUpdatedFromCopyNPaste: [vModel.value?.title],
  },
})

useProvideSmartsheetRowStore(rowRef)

const cdfValue = ref<string | null>(null)

const editEnabled = ref(false)

const updateCdfValue = (cdf: string | null) => {
  vModel.value = { ...vModel.value, cdf }
  cdfValue.value = cdf
}

onMounted(() => {
  updateCdfValue(vModel.value?.cdf ?? null)
})

watch(
  () => vModel.value.cdf,
  (newValue) => {
    cdfValue.value = newValue
  },
)
</script>

<template>
  <div v-if="!isVisibleDefaultValueInput">
    <NcButton
      size="small"
      type="text"
      class="!text-gray-500 !hover:text-gray-700"
      data-testid="nc-show-default-value-btn"
      @click.stop="isVisibleDefaultValueInput = true"
    >
      <div class="flex items-center gap-2">
        <span>{{ $t('general.set') }} {{ $t('placeholder.defaultValue').toLowerCase() }}</span>
        <GeneralIcon icon="plus" class="flex-none h-4 w-4" />
      </div>
    </NcButton>
  </div>

  <div v-else>
    <div class="w-full flex items-center gap-2 mb-2">
      <div class="text-small leading-[18px] flex-1 text-gray-700">{{ $t('placeholder.defaultValue') }}</div>
    </div>
    <div class="flex flex-row gap-2">
      <div
        class="nc-default-value-wrapper border-1 flex items-center w-full px-3 border-gray-300 rounded-lg sm:min-h-[32px] xs:min-h-13 flex items-center focus-within:(border-brand-500 shadow-selected ring-0) transition-all duration-0.3s"
      >
        <LazySmartsheetCell
          :edit-enabled="true"
          :model-value="cdfValue"
          :column="vModel"
          class="!border-none h-auto my-auto"
          @update:cdf="updateCdfValue"
          @update:edit-enabled="editEnabled = $event"
          @click="editEnabled = true"
        />
        <component
          :is="iconMap.close"
          v-if="
            ![UITypes.Year, UITypes.Date, UITypes.Time, UITypes.DateTime, UITypes.SingleSelect, UITypes.MultiSelect].includes(
              vModel.uidt,
            )
          "
          class="w-4 h-4 cursor-pointer rounded-full !text-black-500 text-gray-500 cursor-pointer hover:bg-gray-50"
          @click="updateCdfValue(null)"
        />
      </div>
    </div>
  </div>
</template>
