export function revertStrToHtml(strRegArr = []) {
  for (const srItem of strRegArr) {
    let matchArr = []
    for (const reg of srItem.regArr) {
      matchArr = matchArr.concat(srItem.handleStr.match(reg) || [])
    }
    srItem.matchArr = matchArr
    getHtml(srItem)
  }
}

function getHtml(strRegItem) {
  const {
    matchArr,
    handleStr,
    strSlot,
    highlightSlot,
  } = strRegItem
  let idxArr = []
  let strHtml = ''
  let strDiv = ''
  for (const i of matchArr) {
    const idx = handleStr.indexOf(i)
    const lastIdx = handleStr.lastIndexOf(i)
    idxArr.push(idx)
    idxArr.push(idx + i.length)
    if (idx !== lastIdx) {
      idxArr.push(lastIdx)
      idxArr.push(lastIdx + i.length)
    }
  }
  idxArr = Array.from(new Set(idxArr)).sort(function(a, b) {
    return a - b
  })
  const boldStrArr = splitArray(idxArr)
  idxArr.unshift(0)
  idxArr.push(handleStr.length)
  const allStrArr = composeArray(Array.from(new Set(idxArr)))
  const typeData = allStrArr.map(i => {
    if (boldStrArr.includes(i)) {
      return {
        type: 'bold',
        pos: JSON.parse(i),
      }
    } else {
      return {
        type: 'normal',
        pos: JSON.parse(i),
      }
    }
  })
  for (const i of typeData) {
    const subHandleStr = handleStr.slice(...i.pos)
    if (i.type === 'normal') {
      strHtml += subHandleStr
    } else if (i.type === 'bold') {
      if (highlightSlot) {
        strHtml += highlightSlot.replace('__body__', subHandleStr)
      } else {
        strHtml += `<span>${subHandleStr}</span>`
      }
    }
  }
  if (strSlot) {
    strDiv = strSlot.replace('__body__', strHtml)
  } else {
    strDiv = strHtml
  }
  console.log(strDiv)

  function splitArray(arr, size = 2) {
    const result = []
    for (let i = 0; i < Math.ceil(arr.length / size); i++) {
      const start = i * size
      result.push(JSON.stringify(arr.slice(start, start + size)))
    }
    return result
  }

  function composeArray(arr, size = 2) {
    const result = []
    arr.forEach((i, idx) => {
      if (idx !== arr.length - 1) {
        for (let j = 1; j < size; j++) {
          result.push(JSON.stringify([i, arr[idx + j]]))
        }
      }
    })
    return result
  }
}

export const demo = '[\n' +
  '    {\n' +
  '        handleStr: \'已累计：1/2，90天：0/1，180天：1/2；案件累计赔付金额 18900元\',\n' +
  '        regArr: [/\\d+((\\/\\d+)|元)/g],\n' +
  '        strSlot: \'<p>__body__</p>\',\n' +
  '        highlightSlot: \'<span class="bold-tip">__body__</span>\',\n' +
  '    },\n' +
  '    {\n' +
  '        handleStr: \'出险后，28小时18分 后报案，超过24小时，中风险\',\n' +
  '        regArr: [/\\d+小时(\\d+分)?/g],\n' +
  '        strSlot: \'<p>__body__</p>\',\n' +
  '        highlightSlot: \'<span class="tip">__body__</span>\',\n' +
  '    },\n' +
  ']'
