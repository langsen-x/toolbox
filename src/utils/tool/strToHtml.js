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
  console.log('strDiv:', strDiv)

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

export const docContent = [
  {
    label: '需求',
    value: '' +
      '在项目中，经常会遇到一段长字符串个别字符需要高亮显示；\n' +
      '而后台数据仅仅是返回字符串，当然后台也可实现返回html代码直接使用v-html渲染到页面；\n' +
      '不过这样不够灵活性，如果高亮显示的字符需要不同的css，仍需要后台改代码；\n' +
      '为了实现这样的需求，并且具有灵活性，做了这个小工具。\n\n' +
      '字段解释\n' +
      'handleStr：需要处理的字符串\n' +
      'regArr：正则匹配数组\n' +
      'strSlot：字符串css插槽\n' +
      'highlightSlot：高亮字符css插槽',
  },
  {
    label: '流程',
    value: '' +
      '仅需要在代码面板上按照示例配置好json，点击运行。就可以得到处理之后的html代码。\n' +
      '怎么实现高亮字符不同的样式？\n' +
      '示例highlightSlot指定相同的class，但是可以通过父元素strSlot的class指定nth-of-type实现不同高亮效果',
  },
  {
    label: '思路',
    value: '' +
      '1. 根据需要高亮的字符使用用正则匹配出 matchArr；\n' +
      '2. 从字符串中循环 matchArr 数组找出字符出现的索引（可能会有相同字符，索引不一样）\n' +
      '2.1 相同字符索引根据 indexOf 和 lastIndexOf 全部找出，然后去重，排序，生成一个待高亮字符索引数组 idxArr\n' +
      '2.2 然后按照长度为2的方式两两分割 idxArr 数组，得到待高亮字符索引的数组 boldStrArr\n' +
      '3. idxArr 数组 unshift 索引0，push 索引数组的长度索引，再次去重\n' +
      '4. 然后按照长度为2的方式左右分割 idxArr 数组，得到包含待高亮字符索引的数组 allStrArr\n' +
      '5. allStrArr 数组和 boldStrArr 数组循环生成 typeData 数组，type为 bold 是待高亮字符\n' +
      '6. typeData 对数组循环放入 highlightSlot 和 strSlot 中，得到 html 代码',
  },
]

export const sourceCodePath = 'strToHtml'
