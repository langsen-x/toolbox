export default [
  {
    path: '/idCard',
    name: 'IdCard',
    component: () => import(/* webpackChunkName: "tool" */ '@views/idCard.vue'),
    meta: {
      title: '身份证在线生成器',
    },
  },
]
