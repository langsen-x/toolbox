export const monthBig = Array(31).fill(0).map((i, idx) => {
  i = idx + 1
  return i
})
export const monthSmall = Array(30).fill(0).map((i, idx) => {
  i = idx + 1
  return i
})
export const monthLeap = Array(29).fill(0).map((i, idx) => {
  i = idx + 1
  return i
})
export const monthNoLeap = Array(28).fill(0).map((i, idx) => {
  i = idx + 1
  return i
})
export const dayList = [
  {
    label: 1,
    value: monthBig,
  },
  {
    label: 2,
    value: monthNoLeap,
  },
  {
    label: 3,
    value: monthBig,
  },
  {
    label: 4,
    value: monthSmall,
  },
  {
    label: 5,
    value: monthBig,
  },
  {
    label: 6,
    value: monthSmall,
  },
  {
    label: 7,
    value: monthBig,
  },
  {
    label: 8,
    value: monthBig,
  },
  {
    label: 9,
    value: monthSmall,
  },
  {
    label: 10,
    value: monthBig,
  },
  {
    label: 11,
    value: monthSmall,
  },
  {
    label: 12,
    value: monthBig,
  },
]

export const prefixArr = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2] // 前17位计算系数
export const lastCodeArr = [1, 0, 'X', 9, 8, 7, 6, 5, 4, 3, 2]
export const firstNames = (
  '王 李 张 刘 陈 杨 赵 黄 周 吴 ' +
  '徐 孙 胡 朱 高 林 何 郭 马 罗 ' +
  '梁 宋 郑 谢 韩 唐 冯 于 董 萧 ' +
  '程 曹 袁 邓 许 傅 沈 曾 彭 吕 ' +
  '苏 卢 蒋 蔡 贾 丁 魏 薛 叶 阎 ' +
  '余 潘 杜 戴 夏 锺 汪 田 任 姜 ' +
  '范 方 石 姚 谭 廖 邹 熊 金 陆 ' +
  '郝 孔 白 崔 康 毛 邱 秦 江 史 ' +
  '顾 侯 邵 孟 龙 万 段 雷 钱 汤 ' +
  '尹 黎 易 常 武 乔 贺 赖 龚 文'
).split(' ')
export const lastNames = (
  '伟 芳 娜 秀英 敏 静 丽 强 磊 军 ' +
  '洋 勇 艳 杰 娟 涛 明 超 秀兰 霞 ' +
  '平 刚 桂英'
).split(' ')
