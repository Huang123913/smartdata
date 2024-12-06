<script setup lang="ts">
/**
 * 创建构件页面
 */
definePageMeta({
  requiresAuth: localStorage.getItem('nocodb-gui-v2') ? JSON.parse(localStorage.getItem('nocodb-gui-v2'))?.token : false,
})

const selectedType = ref('api') //创建的构件类型
const current = ref<number>(0)
const steps = ['选择', '创建', '预览', '完成']
const divRef = ref(null)
const heightData = ref(0)
const isNewSelected = ref(false)

onMounted(async () => {
  divRef.value && resizeObserver.observe(divRef.value)
})

const handlePrev = () => {
  current.value--
}
const nextStep = () => {
  current.value++
}
const handleSelectType = (type: string) => {
  selectedType.value = type
  current.value++
  setisNewSelected(true)
}

const setisNewSelected = (value) => {
  isNewSelected.value = value
}

//监听高度变化
const resizeObserver = new ResizeObserver((entries) => {
  for (const entry of entries) {
    if (entry.target === divRef.value) {
      heightData.value = divRef.value.offsetHeight
    }
  }
})
</script>

<template>
  <div class="generate-component-container">
    <div class="generate-component-container-main p-2">
      <h5 class="title">创建构件</h5>
      <div class="back-btn" v-if="current > 0">
        <button
          type="button"
          class="cursor-pointer group text-xs text-slate-500 hover:text-primary dark:hover:text-white dark:text-slate-300 flex justify-center gap-1 items-center"
          @click="handlePrev"
        >
          <span class="relative rounded back-svg">
            <svg
              t="1733370752601"
              class="icon"
              viewBox="0 0 1024 1024"
              version="1.1"
              xmlns="http://www.w3.org/2000/svg"
              p-id="7637"
              width="16"
              height="16"
            >
              <path
                d="M624.788992 204.047974 585.205965 164.464026 219.560038 530.185011 585.205965 895.864013 624.788992 856.280986 298.663014 530.16105Z"
                p-id="7638"
              ></path>
            </svg>
          </span>
          <span>返回</span>
        </button>
      </div>
      <div class="steps-container">
        <a-steps class="steps-progress" :current="current">
          <a-step v-for="item in steps">
            <template #title>{{ item }}</template>
          </a-step>
        </a-steps>
        <div class="steps-content" ref="divRef">
          <div v-if="current === 0" class="steps-one-content">
            <div
              @click="handleSelectType('api')"
              :class="{ 'hover-card-content': selectedType === 'api' }"
              class="card-content"
              style="margin-right: 1.5rem"
            >
              <div class="icon-content">
                <svg
                  t="1733366897373"
                  class="icon"
                  viewBox="0 0 1024 1024"
                  version="1.1"
                  xmlns="http://www.w3.org/2000/svg"
                  p-id="4053"
                  width="40"
                  height="40"
                >
                  <path
                    d="M283 597.89h108.12l12.73 57.25h63.62L372 368.86h-70L200.26 655.14h63.62z m50.89-165.41L372 547h-76.31zM766.48 368.86h57.26v286.29h-57.26zM562.9 553.35h70q47.72 0 76.34-38.17 19.08-28.62 19.09-57.26c0-25.44-6.37-50.89-25.45-70-12.72-12.72-38.17-19.08-63.62-19.08H505.64v286.3h57.26z m6.36-133.6h65a36.58 36.58 0 0 1 36.57 36.57v9.57a36.58 36.58 0 0 1-36.57 36.57h-65z"
                    fill="#494949"
                    p-id="4054"
                  ></path>
                  <path
                    d="M992 256a32 32 0 0 0 32-32 32 32 0 0 0-32-32h-32V96a32 32 0 0 0-32-32h-96V32a32 32 0 0 0-64 0v32H542V32a32 32 0 0 0-64 0v32H257V32a32 32 0 0 0-64 0v32H96a32 32 0 0 0-32 32v96H32a32 32 0 0 0-32 32 32 32 0 0 0 32 32h32v224H32a32 32 0 0 0-32 32 32 32 0 0 0 32 32h32v224H32a32 32 0 0 0-32 32 32 32 0 0 0 32 32h32v96a32 32 0 0 0 32 32h97v32a32 32 0 0 0 64 0v-32h221v32a32 32 0 0 0 64 0v-32h226v32a32 32 0 0 0 64 0v-32h96a32 32 0 0 0 32-32v-96h32a32 32 0 0 0 32-32 32 32 0 0 0-32-32h-32V544h32a32 32 0 0 0 32-32 32 32 0 0 0-32-32h-32V256z m-96 640H128V128h768z"
                    fill="#494949"
                    p-id="4055"
                  ></path>
                </svg>
              </div>
              <div class="name">创建 api</div>
            </div>
            <div
              @click="handleSelectType('page')"
              :class="{ 'hover-card-content': selectedType === 'page' }"
              class="card-content"
            >
              <div class="icon-content">
                <svg
                  t="1733378078206"
                  class="icon"
                  viewBox="0 0 1024 1024"
                  version="1.1"
                  xmlns="http://www.w3.org/2000/svg"
                  p-id="12271"
                  width="40"
                  height="40"
                >
                  <path
                    d="M886.4 963.9H139.6c-42.3 0-76.7-34.4-76.7-76.7V140.4c0-42.3 34.4-76.7 76.7-76.7h746.8c42.3 0 76.7 34.4 76.7 76.7v746.8c0 42.3-34.4 76.7-76.7 76.7zM139.6 110.4c-16.5 0-30 13.5-30 30v746.8c0 16.5 13.5 30 30 30h746.8c16.5 0 30-13.5 30-30V140.4c0-16.5-13.5-30-30-30H139.6z"
                    fill="#494949"
                    p-id="12272"
                  ></path>
                  <path
                    d="M963.1 347.1H62.9v-210c0-42.3 34.4-76.7 76.7-76.7h746.8c42.3 0 76.7 34.4 76.7 76.7v210z m-853.5-46.7h806.8V137.1c0-16.5-13.5-30-30-30H139.6c-16.5 0-30 13.5-30 30v163.3z"
                    fill="#494949"
                    p-id="12273"
                  ></path>
                  <path
                    d="M349.6 963.9h-210c-42.3 0-76.7-34.4-76.7-76.7V303.8h286.7v660.1z m-240-613.5v536.8c0 16.5 13.5 30 30 30H303V350.4H109.6z"
                    fill="#494949"
                    p-id="12274"
                  ></path>
                </svg>
              </div>
              <div class="name">创建 页面</div>
            </div>
          </div>
          <LazyGenerateComponentApiTypeStepContainer
            :current="current"
            :nextStep="nextStep"
            :handlePrev="handlePrev"
            :heightData="heightData"
            :selectedType="selectedType"
            :isNewSelected="isNewSelected"
            :setisNewSelected="setisNewSelected"
          />
          <LazyGenerateComponentPageCreateStepContainer
            :current="current"
            :nextStep="nextStep"
            :handlePrev="handlePrev"
            :heightData="heightData"
            :selectedType="selectedType"
            :isNewSelected="isNewSelected"
            :setisNewSelected="setisNewSelected"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.generate-component-container {
  display: flex;
  justify-content: center;
  width: 100%;
  height: 100%;
  padding: 1rem;
  font-size: 16px;
  background-color: #f6f7f8;
  .generate-component-container-main {
    width: 100%;
    max-width: 64rem;
    height: 100%;
    display: flex;
    flex-direction: column;
    padding: 2rem 2rem 1rem 2rem;
    background-color: #fff;
    border: 1px solid rgb(229, 229, 229);
    border-radius: 0.5rem;
    box-shadow: 0 0 #0000, 0 0 #0000, 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1);
    .title {
      width: 100%;
      text-align: center;
      margin-bottom: 1rem;
      font-weight: 550;
      color: #0a0a0a;
    }
    .back-btn {
      width: 100%;
      margin: 0.5rem 0 1rem 0;
      span {
        font-size: 14px;
        font-weight: 550;
        color: #171717;
      }
      .back-svg {
        position: relative;
        top: -1px;
        right: -5px;
      }
    }
    .steps-container {
      width: 100%;
      flex: 1;
      overflow: hidden;
      box-sizing: border-box;
      .steps-progress {
        width: 100%;
        ::v-deep .ant-steps-icon {
          height: 100%;
          width: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
        }
      }
      .steps-content {
        margin: 3rem 0 0 0;
        height: calc(100% - 3rem - 32px);
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
      }
    }
  }
}
</style>
