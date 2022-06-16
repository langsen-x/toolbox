import { getCurrentInstance } from 'vue'

export function globalProperties() {
  const { appContext } = getCurrentInstance()
  const global = appContext.config.globalProperties
  return {
    global,
  }
}
