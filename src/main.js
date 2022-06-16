import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import ElementPlus from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

const app = createApp(App)
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.config.globalProperties.$px2vw = function(px) {
  return 100 * px / 1920 + 'vw'
}

app.config.globalProperties.$logGlobal = function(data) {
  console.log(`${data}:`, data)
}

app.use(store).use(router).use(ElementPlus, { locale: zhCn }).mount('#app')
