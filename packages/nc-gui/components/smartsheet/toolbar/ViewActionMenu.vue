<script lang="ts" setup>
import { LockType } from '#imports'
import type { TableType, ViewType } from 'nocodb-sdk'
import { ViewTypes } from 'nocodb-sdk'

import Icon from '@ant-design/icons-vue'

const props = withDefaults(
  defineProps<{
    view: ViewType
    table: TableType
    inSidebar?: boolean
    intelligentImport?: () => void
    dataMigration?: () => void
  }>(),
  {
    inSidebar: false,
  },
)

const emits = defineEmits(['rename', 'closeModal', 'delete'])

const { isUIAllowed, isDataReadOnly } = useRoles()

const isPublicView = inject(IsPublicInj, ref(false))

const { $api, $e } = useNuxtApp()

const { t } = useI18n()

const view = computed(() => props.view)

const table = computed(() => props.table)

const { viewsByTable } = storeToRefs(useViewsStore())
const { loadViews, navigateToView } = useViewsStore()

const { base } = storeToRefs(useBase())

const { refreshCommandPalette } = useCommandPalette()

const lockType = computed(() => (view.value?.lock_type as LockType) || LockType.Collaborative)

const views = computed(() => viewsByTable.value.get(table.value.id!))

const isViewIdCopied = ref(false)

const currentBaseId = computed(() => table.value?.source_id)

const onRenameMenuClick = () => {
  emits('rename')
}

const quickImportDialogTypes: QuickImportDialogType[] = ['csv', 'excel']

const quickImportDialogs: Record<(typeof quickImportDialogTypes)[number], Ref<boolean>> = quickImportDialogTypes.reduce(
  (acc: any, curr) => {
    acc[curr] = ref(false)
    return acc
  },
  {},
) as Record<QuickImportDialogType, Ref<boolean>>

const onImportClick = (dialog: any) => {
  if (lockType.value === LockType.Locked) return

  emits('closeModal')
  dialog.value = true
}

async function changeLockType(type: LockType) {
  $e('a:grid:lockmenu', { lockType: type, sidebar: props.inSidebar })

  if (!view.value) return

  if (type === 'personal') {
    // Coming soon
    return message.info(t('msg.toast.futureRelease'))
  }
  try {
    view.value.lock_type = type
    await $api.dbView.update(view.value.id as string, {
      lock_type: type,
    })

    message.success(`Successfully Switched to ${type} view`)
  } catch (e: any) {
    message.error(await extractSdkResponseErrorMsg(e))
  }

  emits('closeModal')
}

/** Duplicate a view */
// todo: This is not really a duplication, maybe we need to implement a true duplication?
function onDuplicate() {
  emits('closeModal')

  const isOpen = ref(true)

  const { close } = useDialog(resolveComponent('DlgViewCreate'), {
    'modelValue': isOpen,
    'title': view.value!.title,
    'type': view.value!.type as ViewTypes,
    'tableId': table.value!.id,
    'selectedViewId': view.value!.id,
    'groupingFieldColumnId': view.value!.view!.fk_grp_col_id,
    'views': views,
    'calendarRange': view.value!.view!.calendar_range,
    'coverImageColumnId': view.value!.view!.fk_cover_image_col_id,
    'onUpdate:modelValue': closeDialog,
    'onCreated': async (view: ViewType) => {
      closeDialog()

      refreshCommandPalette()

      await loadViews({
        force: true,
        tableId: table.value!.id!,
      })

      navigateToView({
        view,
        tableId: table.value!.id!,
        baseId: base.value.id!,
        hardReload: view.type === ViewTypes.FORM,
      })

      $e('a:view:create', { view: view.type, sidebar: props.inSidebar })
    },
  })

  function closeDialog() {
    isOpen.value = false

    close(1000)
  }
}

const { copy } = useCopy()

const onViewIdCopy = async () => {
  await copy(view.value!.id!)
  isViewIdCopied.value = true
}

const onDelete = async () => {
  emits('delete')
}

const isImporting = ref(false)
const handleIntelligentImport = async () => {
  try {
    isImporting.value = true
    await props.intelligentImport()
  } catch (error) {
    console.error(error)
  } finally {
    emits('closeModal')
    isImporting.value = false
  }
}

//数据迁移
const handleDataMigration = async () => {
  emits('closeModal')
  props.dataMigration()
}
</script>

<template>
  <NcMenu
    v-if="view"
    :data-testid="`view-sidebar-view-actions-${view!.alias || view!.title}`"
    class="!min-w-70"
    data-id="toolbar-actions"
  >
    <NcTooltip>
      <template #title> {{ $t('labels.clickToCopyViewID') }} </template>
      <div
        class="flex items-center justify-between p-2 mx-1.5 rounded-md cursor-pointer hover:bg-gray-100 group"
        @click="onViewIdCopy"
      >
        <div class="flex text-xs font-bold text-gray-500 ml-1">
          {{
            $t('labels.viewIdColon', {
              viewId: view?.id,
            })
          }}
        </div>
        <NcButton class="!group-hover:bg-gray-100" size="xsmall" type="secondary">
          <GeneralIcon v-if="isViewIdCopied" class="max-h-4 min-w-4" icon="check" />
          <GeneralIcon v-else class="max-h-4 min-w-4" else icon="copy" />
        </NcButton>
      </div>
    </NcTooltip>

    <template v-if="!view?.is_default && isUIAllowed('viewCreateOrEdit')">
      <NcDivider />
      <NcMenuItem v-if="lockType !== LockType.Locked" @click="onRenameMenuClick">
        <GeneralIcon icon="rename" />
        {{ $t('activity.renameView') }}
      </NcMenuItem>
      <NcTooltip v-else>
        <template #title> {{ $t('msg.info.disabledAsViewLocked') }} </template>
        <NcMenuItem class="!cursor-not-allowed !text-gray-400">
          <GeneralIcon icon="rename" />
          {{ $t('activity.renameView') }}
        </NcMenuItem>
      </NcTooltip>
      <NcMenuItem @click="onDuplicate">
        <GeneralIcon class="nc-view-copy-icon" icon="duplicate" />
        {{ $t('labels.duplicateView') }}
      </NcMenuItem>
    </template>

    <template v-if="view.type !== ViewTypes.FORM">
      <NcDivider />
      <NcMenuItem key="intelligentImport" @click="handleIntelligentImport">
        <div class="nc-base-menu-item group">
          <GeneralLoader v-if="isImporting" class="menu-icon" :style="{ marginRight: '2px' }" />
          <icon v-else :style="{ marginRight: '2px' }">
            <template #component>
              <svg
                t="1717567800506"
                class="icon"
                viewBox="0 0 1024 1024"
                version="1.1"
                xmlns="http://www.w3.org/2000/svg"
                p-id="5075"
                width="16"
                height="16"
              >
                <path
                  d="M819.5 107H199.3C140.7 107 93 154.7 93 213.3v356c0 17.6 14.3 31.9 31.9 31.9s31.9-14.3 31.9-31.9v-356c0-23.4 19.1-42.5 42.5-42.5h620.2c23.4 0 42.5 19.1 42.5 42.5v584.5c0 23.4-19.1 42.5-42.5 42.5h-413c-17.6 0-31.9 14.3-31.9 31.9s14.3 31.9 31.9 31.9h413c58.6 0 106.3-47.7 106.3-106.3V213.3c0-58.6-47.7-106.3-106.3-106.3z"
                  p-id="5076"
                ></path>
                <path
                  d="M531.2 671.9v61.4c-0.1 19.3 22.3 30 37.3 17.9l229.1-185.3c11.4-9.2 11.3-26.5-0.1-35.7l-228-205.1c-15-12-38.3-1.4-38.4 17.8V405c0 11.7-8 20.1-19.4 22.7C207.5 497 130.6 853.6 133.2 878.1c99-93.7 199-238.6 375.7-229.2 12.6 0.7 22.4 10.5 22.3 23z"
                  p-id="5077"
                ></path>
              </svg>
            </template>
          </icon>
          {{ $t('general.intelligentImport') }}
        </div>
      </NcMenuItem>
      <NcMenuItem key="dataMigration" @click="handleDataMigration">
        <div class="nc-base-menu-item group">
          <GeneralIcon icon="duplicate" class="text-gray-700" />
          {{ $t('general.dataMigration') }}
        </div>
      </NcMenuItem>
      <template v-if="isUIAllowed('csvTableImport') && !isPublicView">
        <NcSubMenu key="upload">
          <template #title>
            <div
              v-e="[
                'c:navdraw:preview-as',
                {
                  sidebar: props.inSidebar,
                },
              ]"
              class="nc-base-menu-item group"
            >
              <GeneralIcon icon="upload" />
              {{ $t('general.upload') }}
            </div>
          </template>

          <template #expandIcon></template>
          <div class="flex py-3 px-4 font-bold uppercase text-xs text-gray-500">{{ $t('activity.uploadData') }}</div>

          <template v-for="(dialog, type) in quickImportDialogs">
            <NcMenuItem v-if="isUIAllowed(`${type}TableImport`) && !isPublicView" :key="type" @click="onImportClick(dialog)">
              <div
                v-e="[
                  `a:upload:${type}`,
                  {
                    sidebar: props.inSidebar,
                  },
                ]"
                :class="{ disabled: lockType === LockType.Locked }"
                class="nc-base-menu-item"
              >
                <component :is="iconMap.cloudUpload" />
                {{ `${$t('general.upload')} ${type.toUpperCase()}` }}
              </div>
            </NcMenuItem>
          </template>
        </NcSubMenu>
      </template>

      <NcSubMenu key="download">
        <template #title>
          <div
            v-e="[
              'c:download',
              {
                sidebar: props.inSidebar,
              },
            ]"
            class="nc-base-menu-item group nc-view-context-download-option"
          >
            <GeneralIcon icon="download" />
            {{ $t('general.download') }}
          </div>
        </template>

        <template #expandIcon></template>

        <LazySmartsheetToolbarExportSubActions />
      </NcSubMenu>
    </template>

    <template v-if="isUIAllowed('viewCreateOrEdit')">
      <NcDivider />

      <NcSubMenu disabled key="lock-type" class="scrollbar-thin-dull max-h-90vh overflow-auto !py-0">
        <template #title>
          <div
            v-e="[
              'c:navdraw:preview-as',
              {
                sidebar: props.inSidebar,
              },
            ]"
            class="flex flex-row items-center gap-x-3"
          >
            <div>
              {{ $t('labels.viewMode') }}
            </div>
            <div class="nc-base-menu-item flex !flex-shrink group !py-1 !px-1 rounded-md bg-brand-50">
              <LazySmartsheetToolbarLockType
                :type="lockType"
                class="flex nc-view-actions-lock-type !text-brand-500 !flex-shrink"
                hide-tick
              />
            </div>
            <div class="flex flex-grow"></div>
          </div>
        </template>

        <template #expandIcon></template>
        <div class="flex py-3 px-4 font-bold uppercase text-xs text-gray-500">{{ $t('labels.viewMode') }}</div>
        <a-menu-item class="!mx-1 !py-2 !rounded-md nc-view-action-lock-subaction">
          <LazySmartsheetToolbarLockType :type="LockType.Collaborative" @click="changeLockType(LockType.Collaborative)" />
        </a-menu-item>

        <a-menu-item class="!mx-1 !py-2 !rounded-md nc-view-action-lock-subaction">
          <LazySmartsheetToolbarLockType :type="LockType.Locked" @click="changeLockType(LockType.Locked)" />
        </a-menu-item>
      </NcSubMenu>
    </template>

    <template v-if="!view.is_default && isUIAllowed('viewCreateOrEdit')">
      <NcDivider />
      <NcTooltip v-if="lockType === LockType.Locked">
        <template #title> {{ $t('msg.info.disabledAsViewLocked') }} </template>
        <NcMenuItem class="!cursor-not-allowed !text-gray-400">
          <GeneralIcon class="nc-view-delete-icon" icon="delete" />
          {{
            $t('general.deleteEntity', {
              entity: $t('objects.view'),
            })
          }}
        </NcMenuItem>
      </NcTooltip>
      <NcMenuItem v-else class="!hover:bg-red-50 !text-red-500" @click="onDelete">
        <GeneralIcon class="nc-view-delete-icon" icon="delete" />
        {{
          $t('general.deleteEntity', {
            entity: $t('objects.view'),
          })
        }}
      </NcMenuItem>
    </template>
    <template v-if="currentBaseId">
      <LazyDlgQuickImport
        v-for="tp in quickImportDialogTypes"
        :key="tp"
        v-model="quickImportDialogs[tp].value"
        :import-data-only="true"
        :import-type="tp"
        :source-id="currentBaseId"
      />
    </template>
  </NcMenu>
  <span v-else></span>
</template>

<style lang="scss" scoped>
.nc-base-menu-item {
  @apply !py-0;
}

.nc-view-actions-lock-type {
  @apply !min-w-0;
}
</style>

<style lang="scss">
.nc-view-actions-lock-type > div {
  @apply !py-0;
}

.nc-view-action-lock-subaction {
  @apply !min-w-82;
}
</style>
