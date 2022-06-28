export default [
  {
    path: '/idCard',
    name: 'IdCard',
    component: () => import(/* webpackChunkName: "tool" */ '@views/idCard.vue'),
    meta: {
      title: '身份证在线生成器',
    },
  },
  {
    path: '/jsRun',
    name: 'JsRun',
    component: () => import(/* webpackChunkName: "tool" */ '@views/jsRun.vue'),
    meta: {
      title: 'js代码在线运行',
    },
  },
  {
    path: '/strToHtml',
    name: 'StrToHtml',
    component: () => import(/* webpackChunkName: "tool" */ '@views/strToHtml.vue'),
    meta: {
      title: '字符串提取转html',
    },
  },
]
