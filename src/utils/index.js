// 获取随机值
export const randomAccess = (min, max) => {
  return Math.floor(Math.random() * (max - min)) + min
}
