import { fileToUrl, updateElementStyle } from './file'
import { imageCompress } from '@utils/imageUtil'

let imageInput = null

const _createInput = function(options) {
  const inputEl = document.createElement('input')
  inputEl.type = 'file'
  updateElementStyle(inputEl, {
    position: 'absolute',
    visibility: 'hidden',
    'z-index': -999,
    width: 0,
    height: 0,
    top: 0,
    left: 0,
  })
  inputEl.accept = 'image/*'
  if (options.count > 1) {
    inputEl.multiple = 'multiple'
  }
  // 经过测试，仅能限制只通过相机拍摄，不能限制只允许从相册选择。
  if (options.sourceType.length === 1 && options.sourceType[0] === 'camera') {
    inputEl.capture = 'camera'

    // 兼容部分安卓手机 (安卓手机可能这两个都需要才行)
    // inputEl.accept = 'image/*, album/*'
    // inputEl.capture = 'camera'
  }
  if (options.sourceType.includes('album')) {
    inputEl.accept = 'image/*, album/*'
  }

  return inputEl
}

/**
 * 选择图片
 * @param count
 * @param sourceType
 * @returns {Promise<unknown>}
 */
export function chooseImage({
  count = 1,
  sourceType = ['camera', 'album'],
} = {}) {
  return new Promise((resolve, reject) => {
    if (imageInput) {
      // 删除之前创建的 input 元素，每次都需要重新创建
      imageInput.removeEventListener('change', inputChangeHandler)
      document.body.removeChild(imageInput)
      imageInput = null
    }

    imageInput = _createInput({
      count: count,
      sourceType: sourceType,
    })
    document.body.appendChild(imageInput)

    imageInput.addEventListener('change', inputChangeHandler)
    imageInput.click()

    async function inputChangeHandler(event) {
      const files = []
      const fileCount = event.target.files.length
      for (let i = 0; i < fileCount; i++) {
        const file = event.target.files[i]

        // 判断file类型
        console.log('文件格式: ', file.type)
        if (!file.type || !file.type.startsWith('image/')) {
          reject(new Error('请选择图片文件'))
          return
        }

        console.log('压缩前: ', file)
        const compressFile = await imageCompress({
          file,
          quality: 0.5,
        })
        console.log('压缩后: ', compressFile)

        // fileUrls.push(fileToUrl(compressFile))
        files.push({
          name: compressFile.name,
          size: compressFile.size,
          type: compressFile.type,
          url: fileToUrl(compressFile),
        })
      }
      resolve(files)
    }
  })
}
