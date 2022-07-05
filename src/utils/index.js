// 获取随机值
export const randomAccess = (min, max) => {
  return Math.floor(Math.random() * (max - min)) + min
}

function _createTypeOf(type) {
  return function(obj) {
    return Object.prototype.toString.call(obj) === '[object ' + type + ']'
  }
}

export const isEmpty = (obj) => {
  const isString = _createTypeOf('String')

  if (isString(obj)) {
    obj = obj.trim()
  }
  for (const key in obj) {
    return false
  }
  return true
}

export const isEmptyFunction = (func) => {
  if (typeof func !== 'function') {
    return true
  }
  let str = func.toString().replace(/\s+/g, '')
  str = str.match(/{.*}/g)[0]
  return str === '{}'
}

export const downloadFileUrlNotOpen = (url, fileName = '') => {
  const splitUrl = (url || '').split('/')
  const filename = fileName || splitUrl[splitUrl.length - 1]
  fetch(url, {
    method: 'get',
    responseType: 'arraybuffer',
  }).then(function(res) {
    if (res.status !== 200) {
      return res.json()
    }
    return res.arrayBuffer()
  }).then((blobRes) => {
    // console.log('blobRes:', blobRes);
    // 生成 Blob 对象，设置 type 等信息
    const e = new Blob([blobRes], {
      type: 'application/octet-stream',
      'Content-Disposition': 'attachment',
    })
    // 将 Blob 对象转为 url
    const link = window.URL.createObjectURL(e)
    const a = document.createElement('a')
    a.href = link
    a.download = filename
    a.click()
  }).catch(err => {
    console.error(err)
  })
}

export const createAndDownloadFile = (fileName, fileContent) => {
  if (!fileName) {
    throw new Error('文件名称为空')
  }
  if (typeof fileName !== 'string') {
    throw new Error('文件名类型错误')
  }
  if (!fileContent) {
    throw new Error('文件内容为空')
  }
  if (typeof fileContent !== 'string') {
    fileContent = JSON.stringify(fileContent)
  }
  const blob = new Blob([fileContent])
  const aTag = document.createElement('a')
  aTag.href = URL.createObjectURL(blob)
  aTag.download = fileName
  aTag.click()
  URL.revokeObjectURL(blob)
}
