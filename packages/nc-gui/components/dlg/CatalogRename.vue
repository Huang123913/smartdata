<script setup lang="ts">
import type { ComponentPublicInstance } from '@vue/runtime-core'

interface Props {
  catalogMeta: any
  dialogShow: boolean
  setDialogShow: (value: boolean) => void
}
const { catalogMeta, dialogShow, setDialogShow } = defineProps<Props>()
const { addUndo, defineProjectScope } = useUndoRedo()
const inputEl = ref<ComponentPublicInstance>()
const loading = ref(false)
const useForm = Form.useForm
const { $api } = useNuxtApp()
const store = useChatPlaygroundViewStore()
const { chataiData } = storeToRefs(store)
const { updateCatalogName } = store
const formState = reactive({
  title: '',
})
const validators = computed(() => {
  return {
    title: [validateCatalogName],
  }
})
const { validateInfos } = useForm(formState, validators)

watchEffect(
  () => {
    if (catalogMeta?.title) formState.title = `${catalogMeta.title}`
    nextTick(() => {
      const input = inputEl.value?.$el as HTMLInputElement
      if (input) {
        input.setSelectionRange(0, formState.title.length)
        input.focus()
      }
    })
  },
  { flush: 'post' },
)

const renameCatalog = async (undo = false, disableTitleDiffCheck?: boolean | undefined) => {
  if (!catalogMeta) return
  if (formState.title) {
    formState.title = formState.title.trim()
  }
  if (formState.title === catalogMeta.title && !disableTitleDiffCheck) return
  loading.value = true
  try {
    updateCatalogName(catalogMeta, formState.title)
    await await $api.smartData.renameCatalogCustom({ id: catalogMeta.id, name: formState.title, name_cn: formState.title })
    if (!undo) {
      addUndo({
        redo: {
          fn: (t: string) => {
            formState.title = t
            renameCatalog(true, true)
          },
          args: [formState.title],
        },
        undo: {
          fn: (t: string) => {
            formState.title = t
            renameCatalog(true, true)
          },
          args: [catalogMeta.title],
        },
        scope: defineProjectScope({ model: catalogMeta }),
      })
    }
  } catch (e: any) {
    message.error(await extractSdkResponseErrorMsg(e))
  } finally {
    loading.value = false
    onCancel()
  }
}

const onCancel = () => {
  setDialogShow(false)
  formState.title = `${catalogMeta.title}`
}
</script>

<template>
  <NcModal :visible="dialogShow" size="small">
    <template #header>
      <div class="flex flex-row items-center gap-x-2">
        <GeneralIcon icon="rename" />
        {{ '重命名' }}
      </div>
    </template>
    <div class="mt-2">
      <a-form :model="formState">
        <a-form-item v-bind="validateInfos.title">
          <a-input
            ref="inputEl"
            v-model:value="formState.title"
            class="nc-input-md"
            hide-details
            size="large"
            :placeholder="'输入目录名'"
            @keydown.enter="() => renameCatalog()"
          />
        </a-form-item>
      </a-form>
      <div class="flex flex-row justify-end gap-x-2 mt-6">
        <NcButton type="secondary" @click="onCancel">{{ $t('general.cancel') }}</NcButton>
        <NcButton
          key="submit"
          type="primary"
          :disabled="validateInfos.title.validateStatus === 'error' || formState.title?.trim() === catalogMeta.title"
          label="Rename Catalog"
          loading-label="Renaming Catalog"
          :loading="loading"
          @click="() => renameCatalog()"
        >
          {{ '重命名' }}
          <template #loading> {{ '重命名' }}</template>
        </NcButton>
      </div>
    </div>
  </NcModal>
</template>
