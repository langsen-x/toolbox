/**
 * 创建一个自定义的 typeof 函数
 * @param {String} type 类型
 * @returns {Function} 返回一个可判断特定类型的谓词函数
 */
function _createTypeOf(type) {
  return function(obj) {
    return Object.prototype.toString.call(obj) === '[object ' + type + ']'
  }
}

const isString = _createTypeOf('String')

function isEmpty(obj) {
  if (isString(obj)) {
    obj = obj.trim()
  }
  for (const key in obj) {
    return false
  }
  return true
}

const checkCardNo = (value, errorMsg) => {
  function _checkCardNo(code) {
    // eslint-disable-next-line no-unused-vars
    const city = {
      11: '北京',
      12: '天津',
      13: '河北',
      14: '山西',
      15: '内蒙古',
      21: '辽宁',
      22: '吉林',
      23: '黑龙江 ',
      31: '上海',
      32: '江苏',
      33: '浙江',
      34: '安徽',
      35: '福建',
      36: '江西',
      37: '山东',
      41: '河南',
      42: '湖北 ',
      43: '湖南',
      44: '广东',
      45: '广西',
      46: '海南',
      50: '重庆',
      51: '四川',
      52: '贵州',
      53: '云南',
      54: '西藏 ',
      61: '陕西',
      62: '甘肃',
      63: '青海',
      64: '宁夏',
      65: '新疆',
      71: '台湾',
      81: '香港',
      82: '澳门',
      91: '国外 ',
    }
    let pass = true
    // 验证身份证格式（6个地区编码，8位出生日期，3位顺序号，1位校验位）
    if (isEmpty(code)) {
      pass = false
    } else if (!code || !/^\d{6}(18|19|20)?\d{2}(0[1-9]|1[012])(0[1-9]|[12]\d|3[01])\d{3}(\d|X)$/i.test(code)) {
      pass = false
      pass = false
    } else {
      // 18位身份证需要验证最后一位校验位
      if (code.length === 18) {
        code = code.split('')
        // ∑(ai×Wi)(mod 11)
        // 加权因子
        const factor = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2]
        // 校验位
        const parity = [1, 0, 'X', 9, 8, 7, 6, 5, 4, 3, 2]
        let sum = 0
        let ai = 0
        let wi = 0
        for (let i = 0; i < 17; i++) {
          ai = code[i]
          wi = factor[i]
          sum += ai * wi
        }
        // eslint-disable-next-line
        if (parity[sum % 11] != code[17]) {
          pass = false
        }
      }
    }
    return pass
  }

  if (!_checkCardNo(value)) {
    throw new Error(errorMsg)
  }
}

const checkName = (value, errorMsg) => {
  const reg = /^[\u4E00-\u9FA5\uf900-\ufa2d·s]+$/
  if (!reg.test(value) || value.length < 2) {
    throw new Error(errorMsg)
  }
}

const checkGender = (value, errorMsg) => {
  if (value !== '男' && value !== '女') {
    throw new Error(errorMsg)
  }
}

const checkNation = (value, errorMsg) => {
  const reg = /^[\u4e00-\u9fa5\uf900-\ufa2d]+$/
  if (!reg.test(value) || value.includes('族')) {
    throw new Error(errorMsg)
  }
}

const checkIssuingAuthority = (value, errorMsg) => {
  const reg = /^[\u4e00-\u9fa5\uf900-\ufa2d]+$/
  if (!reg.test(value)) {
    throw new Error(errorMsg)
  }
}

const checkAddress = (value, errorMsg) => {
  const reg = /^([\u4e00-\u9fa5\uf900-\ufa2d]+[0-9]+[\u4e00-\u9fa5\uf900-\ufa2d]*[0-9]*)*/
  if (!reg.test(value)) {
    throw new Error(errorMsg)
  }
}

const checkValidity = (value, errorMsg, type) => {
  const reg1 = /^([1-9]{1}[0-9]{3})(0{1}[1-9]{1}|1{1}[0-2]{1})(0{1}[1-9]{1}|[1-2]{1}[0-9]{1}|3[0-1]{1})$/
  const reg2 = /^([1-9]{1}[0-9]{3}).(0{1}[1-9]{1}|1{1}[0-2]{1}).(0{1}[1-9]{1}|[1-2]{1}[0-9]{1}|3[0-1]{1})$/
  const reg3 = /^([1-9]{1}[0-9]{3})\/(0{1}[1-9]{1}|1{1}[0-2]{1})\/(0{1}[1-9]{1}|[1-2]{1}[0-9]{1}|3[0-1]{1})$/
  const reg4 = /^([1-9]{1}[0-9]{3})-(0{1}[1-9]{1}|1{1}[0-2]{1})-(0{1}[1-9]{1}|[1-2]{1}[0-9]{1}|3[0-1]{1})$/

  const bol = !reg1.test(value) && !reg2.test(value) && !reg3.test(value) && !reg4.test(value)
  if (type === 'validityStart') {
    if (bol) {
      throw new Error(errorMsg)
    }
  } else if (type === 'validityEnd') {
    if (bol && value !== '长期') {
      throw new Error(errorMsg)
    }
  }
}

/**
 * @description 验证字段
 * @author langsen-x
 * @date 2021/4/25
 * @param {String} type 类型
 * @param {Object} params value 数据, emptyMsg 为空时提示语, errorMsg 验证不通过提示语
 */
const validate = (type, params) => {
  const {
    value,
    emptyMsg,
    errorMsg,
    checkEmpty,
  } = params
  if (checkEmpty && isEmpty(value)) {
    throw new Error(emptyMsg)
  }
  if (type === 'name') { // 姓名
    checkName(value, errorMsg)
  } else if (type === 'cardNo') { // 身份证
    checkCardNo(value, errorMsg)
  } else if (type === 'gender') { // 性别
    checkGender(value, errorMsg)
  } else if (type === 'nation') { // 民族
    checkNation(value, errorMsg)
  } else if (type === 'address') { // 住址
    checkAddress(value, errorMsg)
  } else if (type === 'issuingAuthority') { // 签发机关
    checkIssuingAuthority(value, errorMsg)
  } else if (type === 'validityStart' || type === 'validityEnd') { // 有效期
    checkValidity(value, errorMsg, type)
  }
}

function isFunc(fn) {
  return typeof fn === 'function'
}

function validateConfig(config) {
  for (const [key, value] of Object.entries(config)) {
    const params = {
      value: value,
      emptyMsg: `${key}参数为空`,
      errorMsg: `请检查${key}是否正确`,
      checkEmpty: key !== 'avatar',
    }
    validate(key.toString(), params)
  }
}

function handleCardNo(cardNo) {
  const year = cardNo.slice(6, 10)
  const month = cardNo.slice(10, 12)
  const day = cardNo.slice(12, 14)
  return {
    year: year,
    month: month.includes('0') ? month.slice(-1) : month,
    day: day.includes('0') ? day.slice(-1) : day,
  }
}

function getAddressText(text, ctx) {
  let brNum = 0
  const textArr = []
  text.split('').forEach(t => {
    brNum += isNaN(parseInt(t)) ? 1 : 0.5
  })
  const n = Math.ceil(brNum / 11)
  for (let i = 0; i < n; i++) {
    textArr[i] = text.slice(i * 11, 11 * (i + 1))
  }
  textArr.map((t, i) => {
    ctx.fillText(t, 330, 573 + 48 * i)
  })
}

function handleValidityPeriod(validity) {
  let str
  const conStr = '.'
  if (validity.length === 8) {
    str = validity(0, 4).concat(conStr, validity(4, 6), conStr, validity(6, 8))
  } else {
    str = validity.replace(/(-)|(\/)|(\.)/g, '.')
  }
  return str
}

export function genImg(config) {
  try {
    validateConfig(config)
  } catch (e) {
    alert(e.message)
    return
  }
  const DOMelement = document.getElementById('emptyBg')
  const img = new Image()
  img.src = DOMelement.src
  const DOMelement2 = document.getElementById('avatarImg')
  const avatarImg = new Image()
  avatarImg.src = DOMelement2.src

  image2Canvas({
    image: img,
    avatar: avatarImg,
  }, config)
}

function image2Canvas({
  image,
  avatar,
  width,
  height,
  beforeDraw,
  afterDraw,
} = {}, config) {
  const {
    cardNo,
    validityStart,
    validityEnd,
  } = config
  const {
    year,
    month,
    day,
  } = handleCardNo(cardNo)
  const validityPeriod = handleValidityPeriod(validityStart).concat('-', handleValidityPeriod(validityEnd))
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
  // 绘制头像
  ctx.drawImage(avatar, 750, 335, 270, 330)

  ctx.fillStyle = 'black'
  ctx.font = '36px hei'
  ctx.fillText(config.name, 330, 355) // +45

  ctx.textBaseline = 'bottom'

  // 第二行
  ctx.font = '33px hei'
  ctx.fillText(config.gender, 330, 437)
  ctx.fillText('汉', 520, 437)
  // 第四行 住址
  getAddressText(config.address, ctx)
  // 背面第一行 签发机关
  ctx.fillText(config.issuingAuthority, 525, 1410)
  // 第三行
  ctx.font = '33px fzzdxjw-gb1-0'
  ctx.fillText(year, 330, 508)
  if (month.length === 2) {
    ctx.fillText(month, 475, 508)
  } else {
    ctx.fillText(month, 485, 508)
  }
  if (day.length === 2) {
    ctx.fillText(day, 580, 508)
  } else {
    ctx.fillText(day, 590, 508)
  }
  // 背面第二行 有效期限
  ctx.fillText(validityPeriod, 525, 1483)

  // 第五行 身份证
  ctx.font = '44px ocrb10bt'
  ctx.fillText(config.cardNo, 475, 762)

  ctx.fillStyle = 'transport'

  ctx.restore()

  if (isFunc(afterDraw)) {
    afterDraw(ctx, canvas)
  }

  // return canvas
  canvas2DataUrl(canvas)
}

function canvas2DataUrl(canvas, quality, type) {
  const base64 = canvas.toDataURL(type || 'image/jpeg', quality || 0.8)
  const DOMelement = document.getElementById('idCardImg')
  DOMelement.src = base64
  // return canvas.toDataURL(type || 'image/jpeg', quality || 0.8)
}
