/**
 * @name: 字体精简工具
 * @description: 用户提取字体，并生成对应的css代码
 * @author: champ
 * @time: 2022-05-18 17:24:32
 */

const path = require('path')
const fs = require('fs')
const mkdirp = require('mkdirp')
const fontCarrier = require('font-carrier')

/* ======================= 配置 ======================= */
// 源字体路径
// const originFontFile = '../src/views/idCard/_fonts/fzzdxjw-gb1-0.ttf'
const originFontFile = '../src/views/idCard/_fonts/hei.ttf'
// const originFontFile = '../src/views/idCard/_fonts/ocrb10bt.ttf'

// 提取的文字
// const text = '1234567890'

// 输出的字体路径
// const outputFontFile = '../src/views/idCard/_buildFonts/fzzdxjw-gb1-0'
const outputFontFile = '../src/views/idCard/_buildFonts/hei'
// const outputFontFile = '../src/views/idCard/_buildFonts/ocrb10bt'

// 输出的字体Family
// const fontFamily = 'fzzdxjw-gb1-0'
const fontFamily = 'hei'
// const fontFamily = 'ocrb10bt'

/* ^^^^^^^^^^^^^^^^^^^^^^^ 配置 ^^^^^^^^^^^^^^^^^^^^^^^ */

function writeFileSync(filePath, contents) {
  mkdirp(path.dirname(filePath)).then(() =>
    fs.writeFileSync(filePath, contents),
  )
}

const transFont = fontCarrier.transfer(
  path.resolve(__dirname, originFontFile),
  {},
)
// transFont.min(text)
const out = transFont.output()
Object.keys(out).forEach((key) => {
  const fontPath = path.resolve(__dirname, `${outputFontFile}.${key}`)
  writeFileSync(fontPath, out[key])
})
const filename = path.basename(outputFontFile)

// 生成 css 代码
const css = `@font-face {
    font-family: '${fontFamily}';
    src: url('${filename}.eot'); /* 兼容IE9 */
    src: url('${filename}.eot?#iefix') format('embedded-opentype'), /* IE6-IE8 */
        url('${filename}.woff2') format('woff2'), /* 最新浏览器 */
        url('${filename}.woff') format('woff'), /* 较新浏览器 */
        url('${filename}.ttf')  format('truetype'), /* Safari、Android、iOS */
        url('${filename}.svg#svgFontName') format('svg'); /* 早期iOS */
}`
const cssPath = path.resolve(__dirname, `${outputFontFile}.css`)
writeFileSync(cssPath, css)
console.log('generate css file', cssPath)
