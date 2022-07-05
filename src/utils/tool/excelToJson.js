export const transformArrayToEntries = (array = []) => {
  const firstObj = array[0]
  // 整个json表的表头key
  let keyArr = []
  const valuesArr = []
  if (firstObj) {
    keyArr = Object.keys(firstObj)
  }
  if (keyArr.length !== 0) {
    array.map(obj => {
      const newObj = {}
      for (const key of keyArr) {
        // eslint-disable-next-line no-prototype-builtins
        if (!obj.hasOwnProperty(key)) {
          newObj[key] = ''
        } else {
          newObj[key] = obj[key]
        }
      }
      valuesArr.push(Object.values(newObj))
    })
    return valuesArr
  } else {
    throw new Error('keyArr error!')
  }
}

export const docContent = [
  {
    label: '需求',
    value: '' +
      '在项目中，经常会使用到 树形 结构的 json数据 用于选择器使用；\n' +
      '但往往客户给到的是 excel文件，需要再转化一次；\n' +
      '基于这个麻烦的点，去市场上搜寻了一番，excel转json的工具很多，但是适配度高、合并单元格处理的工具几乎没有；\n' +
      '所以为方便excel转json并且具有高度的灵活性，做了这个工具。\n',

  },
  {
    label: '流程',
    value: '' +
      '左边的编辑器用于存放 parseExcel生成器 的配置代码\n' +
      '点击需要处理元数据 右边的编辑器 用于存放 函数体\n' +
      '示例：\n' +
      '[\n' +
      '    {\n' +
      '        oldF: Array, // 根据excel表头自定义字段，用于origin(e.g.[\'class1\', \'class2\', \'describe\', \'classValue\'])\n' +
      '        newF: Array, // 用于自定义新字段，用于handle(主要用于字段的增加和删除)\n' +
      '        finalF: {\n' +
      '            par1: String, // 最终字段1（常为label）\n' +
      '            // par2: String, // 最终字段2（常为value）\n' +
      '            group: String, // 最终分组字段（label || value）\n' +
      '        },\n' +
      '        groupJson: [ // 分组配置（从低分类往最高分类顺序）\n' +
      '            {\n' +
      '                objKey: [\'describe\'], // 对应par1, par2\n' +
      '                groupF: \'class2\', // 分组字段\n' +
      '                type: \'group\', // 分组类型（group为低分类，unique为最高分类）\n' +
      '                ext: [\'classValue\'], // 额外想要放入的字段\n' +
      '            },\n' +
      '            {\n' +
      '                objKey: [\'class2\'],\n' +
      '                groupF: \'class1\',\n' +
      '                type: \'group\',\n' +
      '                ext: [],\n' +
      '            },\n' +
      '            {\n' +
      '                objKey: [\'class1\'],\n' +
      '                groupF: \'\',\n' +
      '                type: \'unique\',\n' +
      '                ext: [],\n' +
      '            },\n' +
      '        ],\n' +
      '    }\n' +
      ']',
  },
  {
    label: '思路',
    value: '' +
      '1. 根据 excel 表头设置 oldF 和 newF，根据配置项参考完成配置 parseConfig；\n' +
      '2. 通过 XLSX 解析 excel 得到元rows数据；有合并单元格的情况需要根据每个合并的首行先进行补全，得到新的 rows 和 originJsonData；\n' +
      '3. 然后 rows 和 oldF 进行数据格式转化；\n' +
      '4. 如果需要对元数据进行处理，添加处理函数，jsonArr 与 oldF 与 newF同时进行数据处理，得到最新的 handleJsonData；\n' +
      '5. handleJsonData 与 config 共同完成 parseExcel 的功能。\n',
  },
]

export const fnDemo = '' +
  'const { oldF, newF, rows } = parseConfig\n' +
  'const originJsonData = []\n' +
  '// 重写了originJsonData 也要重写handleJsonData\n' +
  'const handleJsonData = []\n' +
  '__slot__\n' +
  'return handleJsonData'

export const configDemo = '' +
  '[\n' +
  '    {\n' +
  '        oldF: [\'class1\', \'class2\', \'describe\', \'classValue\'],\n' +
  '        newF: [\'class1\', \'class2\', \'describe\', \'classValue\'],\n' +
  '        finalF: {\n' +
  '            par1: \'text\',\n' +
  '            // par2: \'code\'\n' +
  '            group: \'text\',\n' +
  '        },\n' +
  '        groupJson: [\n' +
  '            {\n' +
  '                objKey: [\'describe\'],\n' +
  '                groupF: \'class2\',\n' +
  '                type: \'group\',\n' +
  '                ext: [\'classValue\'],\n' +
  '            },\n' +
  '            {\n' +
  '                objKey: [\'class2\'],\n' +
  '                groupF: \'class1\',\n' +
  '                type: \'group\',\n' +
  '                ext: [],\n' +
  '            },\n' +
  '            {\n' +
  '                objKey: [\'class1\'],\n' +
  '                groupF: \'\',\n' +
  '                type: \'unique\',\n' +
  '                ext: [],\n' +
  '            },\n' +
  '        ],\n' +
  '    }\n' +
  ']'
