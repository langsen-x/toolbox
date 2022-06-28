import { createRouter, createWebHashHistory } from 'vue-router'
import toolRouters from './tool'

const routes = [
  {
    path: '/',
    redirect: '/index',
  },
  {
    path: '/index',
    name: 'Index',
    component: () => import(/* webpackChunkName: "index" */ '@views/index'),
    meta: {
      keepAlive: true,
    },
  },
  ...toolRouters,
]

const router = createRouter({
  history: createWebHashHistory(process.env.VUE_APP_PUBLIC_PATH || '/toolbox/'),
  routes,
})

// 路由导航成功钩子，在这里可以做一些操作，比如修改页面标题、调用统计接口等
router.afterEach((to, from) => {
  // 修改页面title
  if (to.meta?.title) {
    document.title = to.meta.title
  }
})

export default router
