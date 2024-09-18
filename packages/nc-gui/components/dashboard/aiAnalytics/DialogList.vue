<script lang="ts" setup>
import { v4 as uuidv4 } from 'uuid'

import { ArrowRightOutlined } from '@ant-design/icons-vue'

const props = defineProps<{
  handleSend: (value: string, isAdd: boolean, callback: () => void) => void
  isSending: boolean
  rephrasequestion: (value: string, callback: () => void) => void
  deleteMessage: (item: any) => void
  dialogList: any[]
  contentWidth?: number
}>()

const { t } = useI18n()

const { copy } = useCopy()

const isShowLoading = ref(false)

const showAction = ref(false)

//优化问题后提问
const rephrasequestion = async (message: string) => {
  if (props.isSending) return
  isShowLoading.value = true
  props.rephrasequestion(message, () => {
    isShowLoading.value = false
  })
}

//复制
const onCopyToClipboard = async (text: string) => {
  try {
    await copy(text)
    message.info(t('msg.info.copiedToClipboard'))
  } catch (e: any) {
    message.error(e.message)
  }
}

//下载
const download = (item: any, isAll: boolean, index: number) => {
  console.log('item', item)
  item.type === 'img' && downloadImage(item.data)
  // let fileIds = 'ff80818190bfd6f90190bffc353f23ba'
  // let isDownLoadFile = true
  // const host = window.location.host
  // const token = {
  //   data: {
  //     dataId: fileIds,
  //     isMulti: false,
  //   },
  // }
  // const url = `module-operation!executeOperation?operation=${isDownLoadFile ? 'FileDown' : 'PreviewFileIcon'}`
  // const uploadURL = `${baseUrl.value}/${url}&token=${encodeURI(JSON.stringify(token))}`
  // let link = document.createElement('a')
  // link.download = 'fileName'
  // link.href = uploadURL
  // link.style.display = 'none'
  // document.body.appendChild(link)
  // link.click()
  // link.remove()
}

const downloadImage = (base64Data: string[] | object[]) => {
  base64Data.map((item) => {
    let imgData = typeof item === 'string' ? item : item.content
    // 提取图片类型
    const fileType = imgData.split(';')[0].split('/')[1]
    // 提取Base64数据部分
    const base64 = imgData.split(',')[1]
    // 创建一个 Blob 对象
    const blob = new Blob([Uint8Array.from(atob(base64), (c) => c.charCodeAt(0))], { type: `image/${fileType}` })
    const link1 = document.createElement('a')
    link1.href = URL.createObjectURL(blob)
    link1.download = `${uuidv4()}.${fileType}`
    link1.click()
    // 清理 URL 对象
    URL.revokeObjectURL(link1.href)
  })
}

const handleConfirm = (item: any) => {
  console.log('item', item)
  props.handleSend('正确', true, () => {})
}

const handleFixed = (item: any) => {
  const parts = item.tableRes.content.split('[')
  const lastContent = parts.pop().replace(']', '')
  props.handleSend(`不正确,${lastContent}`, false, () => {})
}
</script>

<template>
  <div v-for="item in dialogList" class="dialog-list-item" :style="{ alignItems: item.isQuestion ? 'flex-end' : 'flex-start' }">
    <div v-if="item.isQuestion" class="question">{{ item.messages }}</div>
    <div v-else class="answer">
      <DashboardAiAnalyticsImage v-if="item.type === 'img'" :item="item" :downloadImage="downloadImage" />
      <DashboardAiAnalyticsTable v-else-if="item.type === 'table'" :item="item" :contentWidth="contentWidth" />
      <DashboardAiAnalyticsText v-else-if="item.type === 'md'" :data="item.data" />
      <DashboardAiAnalyticsAnnex v-else-if="item.type === 'annex'" :item="item" :download="download" />
      <DashboardAiAnalyticsAnswer v-else :item="item" :contentWidth="contentWidth" />
    </div>
    <div class="all-action">
      <div
        v-if="!item.isQuestion && (item.data.indexOf('？') > -1 || item.data.indexOf('确认是否') > -1)"
        class="confirm-results"
        @click="handleConfirm(item)"
      >
        <NcTooltip>
          <template #title>确认回答信息</template>
          <GeneralBaseIcon>
            <svg
              t="1726620561989"
              class="icon"
              viewBox="0 0 1024 1024"
              version="1.1"
              xmlns="http://www.w3.org/2000/svg"
              p-id="19950"
              width="16"
              height="16"
            >
              <path
                d="M512 64C264.8 64 64 264.8 64 512s200.8 448 448 448 448-200.8 448-448S759.2 64 512 64z m0 832c-212 0-384-172-384-384s172-384 384-384 384 172 384 384-172 384-384 384z"
                p-id="19951"
                fill="#272636"
              ></path>
              <path
                d="M750.4 305.6L383.2 672.8 265.6 556l-44.8 44.8 116.8 117.6 45.6 44.8 44.8-44.8 367.2-367.2z"
                p-id="19952"
                fill="#272636"
              ></path>
            </svg>
          </GeneralBaseIcon>
        </NcTooltip>
      </div>
      <div
        class="action"
        :class="{ 'show-action': showAction }"
        :style="{ justifyContent: item.isQuestion ? 'flex-end' : 'flex-start' }"
      >
        <NcTooltip v-if="item.isQuestion && false">
          <template #title>优化问题后提问</template>
          <div
            :style="{
              cursor: isSending ? 'not-allowed' : 'pointer',
            }"
            @click="rephrasequestion(item.messages)"
            v-if="item.isQuestion"
            class="rephrasequestion"
          >
            <GeneralBaseIcon :style="{ marginRight: '2px', marginTop: '1px' }">
              <svg
                t="1721720815426"
                class="icon"
                viewBox="0 0 1024 1024"
                version="1.1"
                xmlns="http://www.w3.org/2000/svg"
                p-id="2739"
                width="16"
                height="16"
              >
                <path
                  d="M850.367451 513.489934c4.208858-5.538133 8.271384-11.088546 12.139481-16.651238 55.695486-80.095199 69.303412-153.764036 38.315654-207.435423-30.986735-53.671387-101.583606-78.719876-198.802812-70.535473-6.750751 0.568958-13.588483 1.310855-20.488637 2.187829-2.691295-6.414083-5.467525-12.70844-8.350179-18.838044-41.517579-88.280626-98.512664-136.898927-160.487158-136.898927-61.974493 0-118.969579 48.618301-160.485111 136.898927-2.883677 6.130627-5.658883 12.423961-8.350179 18.839067-6.901177-0.876973-13.739932-1.61887-20.490683-2.187829-97.209996-8.18645-167.813007 16.865109-198.800765 70.535473-30.987758 53.671387-17.380856 127.340223 38.314631 207.435423 3.867074 5.561669 7.9296 11.113105 12.139481 16.651238-4.209882 5.538133-8.271384 11.088546-12.139481 16.651238-55.694463 80.095199-69.301366 153.764036-38.314631 207.434399 27.13808 47.004547 84.658122 72.055083 163.830299 72.055083 11.228739 0 22.897499-0.50449 34.970466-1.51961 6.750751-0.568958 13.589506-1.310855 20.490683-2.187829 2.691295 6.414083 5.467525 12.70844 8.351202 18.839067 41.515532 88.281649 98.510618 136.89995 160.485111 136.89995 61.974493 0 118.969579-48.618301 160.487158-136.89995 2.883677-6.130627 5.658883-12.423961 8.350179-18.839067 6.900154 0.876973 13.737886 1.61887 20.488637 2.187829 12.081153 1.01819 23.737634 1.51961 34.972513 1.51961 79.162968 0 136.693242-25.052582 163.830299-72.055083 30.986735-53.670363 17.379832-127.3392-38.315654-207.434399C858.639858 524.579503 854.577333 519.028067 850.367451 513.489934zM705.378266 258.742972c79.704296-6.715959 138.322345 11.755742 160.790056 50.669006 22.467711 38.914288 9.157567 98.901521-36.513612 164.583452-1.775436 2.554172-3.603061 5.106298-5.459339 7.656377-27.969005-31.598672-61.164035-62.346977-98.369402-91.212398-6.39464-46.653553-16.426111-90.774423-29.806863-130.796952C699.155541 259.309884 702.278671 259.003915 705.378266 258.742972zM603.368964 670.542876c-30.015617 17.32969-60.426231 32.621978-90.675162 45.690622-30.248931-13.068643-60.659545-28.360931-90.675162-45.690622-30.015617-17.32969-58.46353-36.019355-84.905762-55.680137-3.805676-32.730449-5.767354-66.712401-5.767354-101.371782 0-34.659381 1.961678-68.64338 5.768377-101.373829 26.442232-19.660782 54.890144-38.350446 84.904739-55.680137 30.015617-17.32969 60.427254-32.621978 90.675162-45.690622 30.248931 13.068643 60.658522 28.360931 90.675162 45.690622 30.016641 17.32969 58.464553 36.020378 84.907809 55.68116 3.805676 32.730449 5.768377 66.713424 5.768377 101.372805 0 34.659381-1.961678 68.641333-5.767354 101.370759C661.833517 634.522498 633.385605 653.213185 603.368964 670.542876zM679.918407 669.814282c-6.14393 32.457226-14.217816 63.196321-24.11728 91.542926-29.498848-5.600555-60.157101-13.977339-91.338265-24.885783 19.729344-9.582239 39.413662-20.017916 58.912761-31.275307C642.875746 693.938726 661.755746 682.109306 679.918407 669.814282zM460.924741 736.471424c-31.181163 10.908444-61.839417 19.285229-91.337241 24.885783-9.898441-28.346605-17.972327-59.0857-24.116257-91.541903 18.162662 12.295024 37.041638 24.12342 56.539714 35.380812C421.510056 716.454532 441.194374 726.889185 460.924741 736.471424zM293.701159 580.147076c-25.037233-21.548782-47.620577-43.911092-67.219961-66.657142 19.599384-22.74605 42.183751-45.108361 67.219961-66.658166-1.566682 21.877263-2.371 44.142359-2.371 66.658166C291.330158 536.00574 292.134477 558.269813 293.701159 580.147076zM345.471242 357.163539c6.14393-32.457226 14.217816-63.195298 24.116257-91.541903 29.497824 5.600555 60.156078 13.977339 91.336218 24.885783-19.729344 9.582239-39.413662 20.016893-58.912761 31.275307C382.511857 333.040119 363.633904 344.868515 345.471242 357.163539zM564.463885 290.50742c31.18014-10.907421 61.838394-19.284205 91.337241-24.885783 9.898441 28.346605 17.97335 59.0857 24.11728 91.542926-18.162662-12.295024-37.042661-24.124444-56.541761-35.381835C603.877547 310.524313 584.193229 300.088636 564.463885 290.50742zM731.688491 446.832791c25.036209 21.548782 47.620577 43.911092 67.219961 66.657142-19.599384 22.745027-42.182728 45.107337-67.219961 66.656119 1.566682-21.87624 2.371-44.141336 2.371-66.656119C734.059492 490.974128 733.255173 468.710055 731.688491 446.832791zM388.417357 219.247446c34.046421-72.393797 79.343069-113.913423 124.276445-113.913423s90.230024 41.519626 124.275421 113.913423c1.324158 2.815115 2.619664 5.67321 3.900843 8.55484-41.349757 8.422833-84.576257 21.796422-128.176264 39.584554-43.600007-17.788132-86.826508-31.16172-128.176264-39.584554C385.798716 224.919632 387.094222 222.061538 388.417357 219.247446zM195.73494 473.994408c-45.672202-65.680908-58.980299-125.669164-36.513612-164.583452 19.435655-33.662681 65.900919-52.022841 129.693828-52.022841 9.952676 0 20.338211 0.447185 31.096229 1.353834 3.099594 0.260943 6.222725 0.567935 9.359158 0.899486-13.379729 40.021505-23.411199 84.142375-29.806863 130.794905-37.205367 28.865421-70.400397 59.613726-98.370425 91.213421C199.338001 479.099682 197.510376 476.54858 195.73494 473.994408zM320.010361 768.235872c-79.70839 6.711865-138.322345-11.754718-160.790056-50.667983-22.466688-38.913265-9.157567-98.902544 36.513612-164.582429 1.775436-2.554172 3.603061-5.105275 5.458315-7.655354 27.970028 31.598672 61.165058 62.346977 98.370425 91.211375 6.39464 46.65253 16.426111 90.7734 29.806863 130.794905C326.234109 767.667937 323.109955 767.974929 320.010361 768.235872zM636.969223 807.733445c-34.046421 72.392774-79.343069 113.912399-124.275421 113.912399s-90.230024-41.519626-124.276445-113.912399c-1.324158-2.815115-2.620687-5.674233-3.900843-8.556886 41.35078-8.422833 84.577281-21.797445 128.177288-39.585577 43.601031 17.788132 86.827531 31.16172 128.177288 39.584554C639.58991 802.059212 638.293381 804.918329 636.969223 807.733445zM866.168322 717.567889c-22.467711 38.913265-81.075527 57.387012-160.790056 50.667983-3.099594-0.260943-6.222725-0.567935-9.359158-0.899486 13.380752-40.021505 23.412223-84.143399 29.806863-130.795928 37.205367-28.864398 70.399373-59.612703 98.369402-91.210351 1.855254 2.550079 3.682879 5.102205 5.459339 7.656377C875.325889 618.667392 888.633986 678.654624 866.168322 717.567889z"
                  fill="#272636"
                  p-id="2740"
                ></path>
              </svg>
            </GeneralBaseIcon>
            <span>优化提问</span>
          </div>
        </NcTooltip>
        <div v-if="item.isQuestion" class="copy" @click="onCopyToClipboard(item.messages)">
          <GeneralIcon icon="duplicate" class="text-gray-700" />
          {{ $t('general.duplicate') }}
        </div>
        <div
          v-if="!item.isQuestion && ['img', 'annex'].includes(item.type)"
          :style="{ marginRight: '20px', display: 'flex', alignItems: 'center' }"
        >
          <GeneralIcon icon="download" @click="download(item, true, 1)" />
          {{ '下载' }}
        </div>
        <div v-if="item.isShowSaveBtn" class="copy">
          <DashboardAiAnalyticsSaveData :item="item" v-model:showAction="showAction" />
        </div>

        <div @click="deleteMessage(item)">
          <NcTooltip>
            <template #title>
              {{ '删除信息' }}
            </template>
            <GeneralIcon icon="delete" class="text-gray-700 deleteicon" /> {{ '删除' }}
          </NcTooltip>
        </div>

        <div
          v-if="item.hasSqlRes && !item?.isExeSuccess && item?.isRepair"
          @click="handleFixed(item)"
          :style="{ marginLeft: '18px' }"
        >
          <GeneralBaseIcon :style="{ marginRight: '-3px', position: 'relative', top: '-3px' }">
            <svg
              t="1726210164276"
              class="icon"
              viewBox="0 0 1024 1024"
              version="1.1"
              xmlns="http://www.w3.org/2000/svg"
              p-id="11563"
              width="16"
              height="16"
            >
              <path
                d="M824.018851 478.68115c54.894238-54.782697 66.862827-136.315642 39.917128-201.324238l-96.733135 96.55201c-26.318412 26.27748-71.417563 24.243147-97.735975-2.033309-26.305109-26.27748-28.338419-71.250764-2.034333-97.527221l96.747461-96.553033c-65.12116-26.91807-147.057287-15.186887-201.938222 39.59581-54.349839 54.224995-67.210751 134.225027-39.122019 201.045899l-67.237357 67.098187L284.108175 314.082348l11.716856-25.524327-91.480504-60.82839-58.112536 57.986669 60.940954 91.341335 27.655873-13.793144 171.773202 171.480536L207.144292 733.811852c-12.720719 12.707416-12.720719 33.271778 0 45.949518l61.373813 61.275575c12.706393 12.678764 33.326013 12.678764 46.032406 0l199.456704-199.096501 28.200272 28.14399-7.817036 7.829316c-11.632945 11.592013-14.280238 26.305109-3.162016 37.422308l135.214565 134.978181c11.104919 11.090593 31.375591 13.904685 43.00956 2.312672l62.863746-62.751183c11.618619-11.592013 10.839883-33.912367-0.278339-44.974307L636.809075 609.924263c-11.118222-11.090593-27.92091-6.381337-39.554878 5.210675l-5.754051 5.768377-28.212552-28.14399 71.181179-71.056336C698.892039 543.522947 773.012154 529.590634 824.018851 478.68115L824.018851 478.68115 824.018851 478.68115zM308.79646 774.021645c-13.779841 13.765515-36.099173 13.765515-49.877991 0-13.765515-13.737886-13.765515-36.029588 0-49.795103 13.778818-13.736862 36.098149-13.736862 49.877991 0C322.575278 737.992057 322.575278 760.28376 308.79646 774.021645L308.79646 774.021645 308.79646 774.021645zM308.79646 774.021645"
                fill="#272636"
                p-id="11564"
              ></path>
            </svg>
          </GeneralBaseIcon>
          {{ '修复' }}
        </div>
      </div>
    </div>

    <div class="recommend" v-if="item.questions">
      <div class="recommend-list" @click="handleSend(recommend, true, () => {})" v-for="recommend in item.questions">
        <div class="text">
          {{ recommend }}
        </div>
        <arrow-right-outlined />
      </div>
    </div>
  </div>
  <DashboardAiAnalyticsLoading :isSending="isSending" />
  <SmartdataChatPlaygroundViewCommonLoading :isShow="isShowLoading" />
</template>

<style lang="scss" scoped>
.dialog-list-item {
  display: flex;
  flex-direction: column;
  margin-bottom: 30px;
  width: 100%;
  cursor: pointer;
  .confirm-results {
    margin-top: 15px;
    margin-right: 20px;
  }
  .question {
    width: fit-content;
    padding: 10px;
    background-color: #0b6bcb;
    border-bottom-left-radius: 12px;
    border-bottom-right-radius: 12px;
    border-top-left-radius: 12px;
    color: #fff;
  }
  .answer {
    width: 100%;
  }
  .action {
    width: 100%;
    display: flex;
    align-items: center;
    padding: 0 8px 0 0;
    margin-top: 18px;
    opacity: 0;
    .copy {
      margin-right: 20px;
    }
    .rephrasequestion {
      display: flex;
      align-items: center;
      margin-right: 20px;
    }
    .saveicon {
      position: relative;
      top: 3px;
      margin-right: -2px;
    }
    .deleteicon {
      position: relative;
      top: -2px;
      right: -2px;
    }
  }
  &:hover .action {
    opacity: 1;
  }
  .recommend {
    max-width: 100%;
    margin-top: 30px;
    .recommend-list {
      width: fit-content;
      display: flex;
      align-items: center;
      justify-content: space-between;
      background-color: #f5f5f5;
      padding: 8px 16px;
      margin-bottom: 8px;
      border-radius: 10px;
      .text {
        max-width: calc(100% - 14px);
        overflow-wrap: break-word;
        margin-right: 8px;
      }
    }
  }
}
.show-action {
  opacity: 1 !important;
}
.all-action {
  display: flex;
}
</style>
