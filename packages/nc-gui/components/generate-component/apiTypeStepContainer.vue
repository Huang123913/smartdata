<script lang="ts" setup>
/**
 * 创建构件页面
 * 创建api步骤条的内容
 */
const props = defineProps<{
  current: number
  nextStep: () => void
  handlePrev: () => void
  heightData: number
  selectedType: string
  isNewSelected: boolean
  setisNewSelected: (value: boolean) => void
}>()
const { $api } = useNuxtApp()
const formState = reactive<any>({
  name: '',
  code: '',
  description: '',
  limit: 50,
})
const isShowLoading = ref(false)
const columns = ref([])
const tableData = ref([])
const handleConfirm = async () => {
  if (!formState.name || !formState.code) {
    message.error(`请输入${formState.name ? '编码' : '名称'}`)
    return
  }
  let sql = 'select * from QueryAllProjects LIMIT 20'
  try {
    isShowLoading.value = true
    let result = await $api.smartData.exeSql({ sql })
    if (result?.success && result?.data.success) {
      let fields = result?.data?.fields ?? []
      let datas = result?.data?.datas ?? []
      if (fields.length) {
        columns.value = fields
        tableData.value = datas
      }
    } else {
      console.error(result)
    }
  } catch (error) {
  } finally {
    isShowLoading.value = false
    props.nextStep()
  }
}
watch(
  () => props.isNewSelected,
  (newVisible) => {
    if (newVisible) {
      formState.name = ''
      formState.code = ''
      formState.description = ''
      formState.limit = 50
      props.setisNewSelected(false)
    }
  },
)
</script>

<template>
  <div class="api-type-step-container" v-if="selectedType === 'api'">
    <div v-if="current === 1" class="api-steps-two-content">
      <a-form :model="formState" name="basic" :label-col="{ span: 4 }" autocomplete="off">
        <a-form-item label="名称" name="name" :rules="[{ required: true, message: '请输入名称' }]">
          <a-input v-model:value="formState.name" />
        </a-form-item>
        <a-form-item label="编码" name="code" :rules="[{ required: true, message: '请输入编码' }]">
          <a-input v-model:value="formState.code" />
        </a-form-item>
        <a-form-item label="描述" name="description">
          <a-input v-model:value="formState.description" />
        </a-form-item>
        <a-form-item label="条数" name="description">
          <a-select ref="select" v-model:value="formState.limit" style="width: 120px">
            <a-select-option value="25">25条/页</a-select-option>
            <a-select-option value="50">50条/页</a-select-option>
            <a-select-option value="75">75条/页</a-select-option>
            <a-select-option value="100">100条/页</a-select-option>
          </a-select>
        </a-form-item>
      </a-form>
      <div class="btn-content">
        <NcButton key="submit" type="primary" @click="handleConfirm">创建 </NcButton>
      </div>
    </div>
    <div v-if="current === 2" class="api-steps-three-content">
      <LazyGenerateComponentApiCreateResultPreive
        :propsColumns="columns"
        :propsTableData="tableData"
        :handleOk="nextStep"
        :handleCancel="handlePrev"
        :heightData="heightData"
      />
    </div>
    <div v-if="current === 3" class="api-steps-four-content">
      <a-result status="success" title="创建成功">
        <template #extra>
          <NcButton type="primary">下载</NcButton>
        </template>
      </a-result>
    </div>
  </div>
  <SmartdataChatPlaygroundViewCommonLoading :isShow="isShowLoading" />
</template>

<style lang="scss" scoped>
.api-type-step-container {
  height: 100%;
  widht: 100%;
  .steps-one-content {
    display: flex;
    margin-top: 1.5rem;
    padding: 0 2px;
    .hover-card-content {
      outline: 2px solid #171717;
    }
    .card-content {
      width: 210px;
      border-radius: 0.5rem;
      background-color: rgba(244, 244, 245, var(--tw-bg-opacity));
      padding: 1rem;
      &:hover {
        background-color: #e7e7e9;
      }
      .icon-content {
        width: 100%;
        display: flex;
        border-top-left-radius: 0.5rem;
        border-top-right-radius: 0.5rem;
        margin-bottom: 1.5rem;
      }
      .name {
        color: #4a5268;
        font-weight: 600;
      }
    }
  }
  .api-steps-two-content {
    .btn-content {
      width: 100%;
      display: flex;
      justify-content: end;
    }
  }
  .api-steps-three-content {
    width: 100%;
    height: 100%;
  }
}
</style>
