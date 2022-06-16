import html2canvas from 'html2canvas'

/**
 * 判断是否为函数
 * @param fn
 * @returns {boolean}
 */
function isFunc(fn) {
  return typeof fn === 'function'
}

/**
 * 将用户从 <input type="file" /> 中选择的 file 对象转为 data URL 字符串(base64编码)
 * @param {File} file
 * @returns {Promise<string>}
 */
export function file2DataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = function() {
      resolve(reader.result)
    }
    reader.onerror = function(e) {
      reject(e)
    }
    reader.readAsDataURL(file)
  })
}

/**
 * 将用户从 <input type="file" /> 中选择的 file 对象转为 imgUrl 返回
 * 内部优先选择 ObjectURL 进行引用，好处是不需要把文件内容读取到js，而是直接使用文件内容
 * @param {File} file
 */
export function file2ImageURL(file) {
  const URL = window.URL || window.webkitURL

  return URL && URL.createObjectURL(file)
}

/**
 * 撤销url，撤销之后该url将不再可用
 * @param url
 */
export function revokeImageURL(url) {
  const URL = window.URL || window.webkitURL

  return URL.revokeObjectURL(url)
}

/**
 * 将图片链接 url 转为 Image 对象
 * @param {String} url
 * @returns {Promise<Image>}
 */
export function url2Image(url) {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = function() {
      resolve(image)
    }
    image.onerror = function(err) {
      reject(err)
    }
    image.src = url
  })
}

/**
 * 把 image 对象绘制在 canvas 上并返回
 * @param {File} image
 * @param {Number} width
 * @param {Number} height
 * @param {Function} beforeDraw 在图片绘制之前的回调函数
 * @param {Function} afterDraw 在图片绘制之后的回调函数
 * @returns {HTMLCanvasElement} canvas对象
 */
export function image2Canvas({
  image,
  width,
  height,
  beforeDraw,
  afterDraw,
} = {}) {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  // note: 需要限制 canvas 的最大尺寸
  let w = width || image.naturalWidth
  let h = height || image.naturalHeight
  if (w > 4000 || h > 4000) {
    if (w > h) {
      h = Math.floor(4000 * h / w)
      w = 4000
    } else {
      w = Math.floor(4000 * w / h)
      h = 4000
    }
  }

  canvas.width = w
  canvas.height = h

  if (isFunc(beforeDraw)) {
    beforeDraw(ctx, canvas)
  }

  ctx.save()
  ctx.fillStyle = 'transparent'
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height)
  ctx.restore()

  if (isFunc(afterDraw)) {
    afterDraw(ctx, canvas)
  }

  return canvas
}

/**
 *
 * @param {HTMLCanvasElement} canvas canvas对象
 * @param {Number} quality 输出质量比例(默认: 0.8)
 * @param {String} type data url 的类型字符串(默认为: image/jpeg)
 * @returns {string}
 */
export function canvas2DataUrl(canvas, quality, type) {
  return canvas.toDataURL(type || 'image/jpeg', quality || 0.8)
}

/**
 * data URL 转化为 Blob 对象
 * @param {String} dataUrl data URL 字符串
 * @param {String} type mime 类型
 * @returns {Blob}
 */
export function dataUrl2Blob(dataUrl, type) {
  const data = dataUrl.split(',')[1]
  const mimePattern = /^data:(.*?)(;base64)?,/
  const mime = dataUrl.match(mimePattern)[1]
  const binStr = atob(data)
  const len = binStr.length
  const arr = new Uint8Array(len)

  for (let i = 0; i < len; i++) {
    arr[i] = binStr.charCodeAt(i)
  }
  return new Blob([arr], { type: type || mime })
}

/**
 *
 * @param {HTMLCanvasElement} canvas canvas 对象
 * @param {Number} quality 输出质量(默认: 0.8)
 * @param {String} type mime 类型(默认: image/jpeg)
 * @returns {Promise<Blob>}
 */
export function canvas2Blob(canvas, quality, type) {
  // polyfill
  if (!HTMLCanvasElement.prototype.toBlob) {
    Object.defineProperty(HTMLCanvasElement.prototype, 'toBlob', {
      value: function(callback, type, quality) {
        const dataUrl = this.toDataURL(type, quality)
        callback(dataUrl2Blob(dataUrl))
      },
    })
  }

  return new Promise((resolve, reject) => {
    canvas.toBlob(resolve, type || 'image/jpeg', quality || 0.8)
  })
}

/**
 * 图片压缩
 * @param file 图片文件对象
 * @param minLimit 最小尺寸，默认2M
 * @param quality 压缩质量，默认为0.7
 * @returns {Promise<unknown>}
 */
export function imageCompress({
  file,
  minLimit = 2 * 1024 * 1024,
  quality = 0.7,
} = {}) {
  return new Promise((resolve, reject) => {
    if (file.size <= minLimit) {
      resolve(file)
      return
    }

    file2DataUrl(file).then(url2Image).then(image => {
      const canvas = image2Canvas({ image })
      return canvas2DataUrl(canvas, quality, 'image/jpeg')
    }).then(dataUrl => {
      resolve(dataUrl2Blob(dataUrl))
    })
  })
}

/**
 * 对 Dom 节点进行一次快照
 * @param domes 节点数组
 * @return {Promise<HTMLCanvasElement>}
 */
export function snapshot(...domes) {
  return Promise.all(domes.filter(dom => !!dom).map(dom => html2canvas(dom, {
    logging: false, // 关闭日志输出
    allowTaint: false, // 不允许跨域的图片污染canvas(taint canvas是不允许提取出数据的)
    removeContainer: true, // 清理拷贝的文档
    useCORS: false, // 尝试用cors加载域外图片
    scale: window.devicePixelRatio,
    ignoreElements: (node) => {
      // 忽略宽或高为0的元素，这些元素在android下面会报 InvalidStateError: CanvasRenderingContext2D.createPattern: Passed-in
      // canvas has width 0
      const styles = window.getComputedStyle(node)
      const width = parseInt(styles.width)
      const height = parseInt(styles.height)
      return width === 0 || height === 0
    },
  }))).then(canvases => {
    // 创建一个新的canvas
    const canvas = document.createElement('canvas')

    // 宽度求最大值
    canvas.width = canvases.reduce((max, canvas) => Math.max(max, canvas.width), 0)
    // 高度求总和
    canvas.height = canvases.reduce((total, canvas) => total + canvas.height, 0)

    const context = canvas.getContext('2d')
    let y = 0
    canvases.forEach(canvas => {
      context.drawImage(canvas, 0, y, canvas.width, canvas.height)
      y += canvas.height
    })
    return canvas
  })
}
