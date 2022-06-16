import { fileToUrl, updateElementStyle } from './file'

let _fileInput = null

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
  inputEl.accept = options.accept || '*/*'
  if (options.count > 1) {
    inputEl.multiple = 'multiple'
  }

  return inputEl
}

/**
 * 选择图片
 * @param count
 * @param sourceType
 * @returns {Promise<unknown>}
 */
export function chooseFile({
  count = 1,
  accept = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
} = {}) {
  return new Promise((resolve, reject) => {
    if (_fileInput) {
      // 删除之前创建的 input 元素，每次都需要重新创建
      _fileInput.removeEventListener('change', inputChangeHandler)
      document.body.removeChild(_fileInput)
      _fileInput = null
    }

    _fileInput = _createInput({
      count: count,
      accept: accept,
    })
    document.body.appendChild(_fileInput)

    _fileInput.addEventListener('change', inputChangeHandler)
    _fileInput.click()

    async function inputChangeHandler(event) {
      const files = []
      const fileCount = event.target.files.length
      for (let i = 0; i < fileCount; i++) {
        const file = event.target.files[i]

        // 判断file类型
        // console.log('文件格式: ', file)

        files.push({
          name: file.name,
          size: file.size,
          type: file.type,
          url: fileToUrl(file),
        })
      }

      resolve(files)
    }
  })
}
