import axios from 'axios'

const request = axios.create({
  timeout: 10000, // 可选：设置请求超时时间，单位为毫秒
  baseURL: 'http://databoard-test.yindangu.com',
})

// 设置请求拦截
request.interceptors.request.use((config) => {
  return config
})

// 设置响应拦截
request.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    return Promise.reject(error)
  },
)

export default request
