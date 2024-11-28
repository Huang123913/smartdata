import { defineStore } from 'pinia'

/**
 * 企业数据
 */
export const useGroupList = defineStore('groupListStore', () => {
  const { $api } = useNuxtApp()
  const group = reactive<{
    groupList: any[]
    currentGroup: any
  }>({
    groupList: [],
    currentGroup: null,
  })

  const getGroupList = async () => {
    let groupList = await $api.smartData.getGroupList()
    group.groupList = groupList
    group.currentGroup = groupList[0]
  }

  const switchGroup = (switchId: string) => {
    if (switchId === group.currentGroup.id) return
    group.currentGroup = group.groupList.find((item) => item.id === switchId)
    // navigateTo('/')
  }

  return {
    getGroupList,
    switchGroup,
    group,
  }
})
