const deepClone = (obj: any) => {
  if (obj === null || typeof obj !== 'object') {
    return obj
  }
  // 创建一个新的对象或数组
  const clone: any = Array.isArray(obj) ? [] : {}
  // 遍历原始对象的所有属性/元素，并递归地进行深拷贝
  for (let key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      clone[key] = deepClone(obj[key])
    }
  }

  return clone
}

export { deepClone }
