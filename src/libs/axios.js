import axios from 'axios'

const instance = axios.create({
  withCredentials: true
})
// Response Interceptor
instance.interceptors.response.use((response) => {
  return response
}, (error) => {
  return Promise.reject(error.response)
})

export default instance
