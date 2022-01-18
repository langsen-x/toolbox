import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import ElementPlus from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import 'element-plus/dist/index.css'

const app = createApp(App)

app.config.globalProperties.$px2vw = function(px) {
  return 100 * px / 1920 + 'vw'
}

app.config.globalProperties.$logGlobal = function(data) {
  console.log(`${data}:`, data)
}

app.use(store).use(router).use(ElementPlus, { locale: zhCn }).mount('#app')
