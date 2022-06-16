/**
 * 暂存的文件对象
 */
const fileMap = new Map()
const urlMap = new Map()

// todo: 增加lru缓存，防止

/**
 * 从url读取File
 * @param {string} url
 */
export function urlToFile(url) {
  if (urlMap.has(url)) {
    return urlMap.get(url)
  }
  throw new Error(`file ${url} not found`)
}

/**
 * base64转File
 * @param {string} base64
 * @return {File}
 */
export function base64ToFile(base64 = '') {
  base64 = base64.split(',')
  var type = base64[0].match(/:(.*?);/)[1]
  var str = atob(base64[1])
  var n = str.length
  var array = new Uint8Array(n)
  while (n--) {
    array[n] = str.charCodeAt(n)
  }
  var filename = `${Date.now()}.${type.split('/')[1]}`
  return new File([array], filename, { type: type })
}

/**
 * 从本地file或者blob对象创建url
 * @param {Blob|File} file
 * @return {string}
 */
export function fileToUrl(file) {
  if (fileMap.has(file)) {
    return fileMap.get(file)
  }

  var url = (window.URL || window.webkitURL).createObjectURL(file)
  fileMap.set(file, url)
  urlMap.set(url, file)
  return url
}

export function updateElementStyle(element, styles) {
  Object.keys(styles).forEach(attr => {
    element.style[attr] = styles[attr]
  })
}

export function resolveFileName(filename, filetype) {
  let extension = ''
  if (filetype) {
    const matched = filetype.match(/^image\/(?<extension>[a-z]+)$/)
    if (matched) {
      extension = matched.groups.extension
    }
  }

  let name = ''
  if (filename) {
    name = filename
  } else {
    name = `file-${Date.now()}.jpg`
  }

  return name.replace(/\.[a-z]+?$/i, '.' + extension)
}

export function downloadFile(res, filename, type = 'application/msword') {
  const blob = new Blob([res.data], { type: type })
  const a = document.createElement('a')
  a.href = window.URL.createObjectURL(blob)
  console.log('downloadFile res:', res)
  const matchRes = res.headers['content-disposition'].match(/filename=(.*)$/)
  if (matchRes !== null) {
    a.download = decodeURIComponent(matchRes[1])
  }
  if (filename) {
    a.download = filename
  }
  a.click()
  window.URL.revokeObjectURL(a.href)
}
