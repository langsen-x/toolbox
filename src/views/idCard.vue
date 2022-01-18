<template>
  <div class="page">
    <div class="idCard-content">
      <h1 class="title">身份证在线生成器</h1>
      <div class="select">
        <div class="select__row">
          <p class="select__row-p">省市区：</p>
          <area-select ref="areaRef" @clear="clearResultData"></area-select>
        </div>
        <div class="select__row">
          <p class="select__row-p">出生日期：</p>
          <birthday-select ref="birthdayRef" @clear="clearResultData"></birthday-select>
        </div>
        <div class="select__row">
          <div class="select__row-multi">
            <p class="select__row-p">性别：</p>
            <gender-select ref="genderRef" @clear="clearResultData"></gender-select>
          </div>
          <div class="select__row-multi">
            <p class="select__row-p">个数：</p>
            <count-select ref="countRef" @clear="clearResultData"></count-select>
          </div>
          <el-button style="margin-left: 20px" type="primary" round size="large" @click="genResultData">生成</el-button>
        </div>
      </div>
      <div class="result">
        <el-table :data="resultData" border style="width: 1000px" header-cell-class-name="table-th" empty-text="暂无数据">
          <el-table-column type=index label="序号" width="80"/>
          <el-table-column prop="name" label="姓名" width="140">
            <template #header>
              <div style="display: flex; align-items: center">
                <p>姓名</p>
                <el-switch v-model="switchName"/>
              </div>
            </template>
            <template #default="scope">
              <el-input class="modify-name" :disabled="!switchName" v-model="scope.row.name" clearable maxLength="10"/>
            </template>
          </el-table-column>
          <el-table-column prop="age" label="年龄" width="80"></el-table-column>
          <el-table-column prop="cardNo" label="身份证号"/>
          <el-table-column label="其他" width="380">
            <el-input class="extra-card" v-model="cardAddressDetail" placeholder="详细地址" clearable maxLength="20"/>
            <el-input class="extra-card" v-model="cardDepartment" placeholder="签发机关" clearable maxLength="20"/>
            <div class="extra-card extra-period">
              <el-date-picker v-model="cardPeriodFront" type="date" placeholder="有效起期" value-format="YYYY/MM/DD"
                              format="YYYY-MM-DD" clearable>
              </el-date-picker>
              <el-date-picker v-model="cardPeriodEnd" type="date" placeholder="有效止期" value-format="YYYY/MM/DD"
                              format="YYYY-MM-DD" clearable>
              </el-date-picker>
            </div>
          </el-table-column>
          <el-table-column label="操作" width="130">
            <template #default="scope">
              <el-button
                type="text"
                size="small"
                @click="copyCardNo(scope.row.cardNo)"
              >
                复制
              </el-button>
              <el-button
                type="text"
                size="small"
                @click="genIdCardPicture(scope.row)"
              >
                生成图片
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <el-backtop/>
    </div>
    <div class="modal">
      <img id="emptyBg" src="../components/id-card/assets/empty.png" alt="" style="display: none">
      <img id="avatarImg" src="../components/id-card/assets/avatar.png" alt="" style="display: none">
      <el-dialog
        v-model="idCardDialogVisible"
        title="身份证图片"
        width="40%">
        <img id="idCardImg" class="idCardImg" src="" alt=""/>
      </el-dialog>
    </div>
  </div>
</template>

<script>
import { getCurrentInstance, reactive, ref, toRefs, watch } from 'vue'
import AreaSelect from '@components/id-card/area-select'
import BirthdaySelect from '@components/id-card/birthday-select'
import GenderSelect from '@components/id-card/gender-select'
import CountSelect from '@components/id-card/count-select'
import clipboard from 'copy-text-to-clipboard'
import { genImg } from '@components/id-card/js'
import { areaList } from '@config/area'

const {
  // eslint-disable-next-line camelcase
  province_list,
  // eslint-disable-next-line camelcase
  city_list,
  // eslint-disable-next-line camelcase
  county_list,
} = areaList
const prefixArr = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2] // 前17位计算系数
const lastCodeArr = [1, 0, 'X', 9, 8, 7, 6, 5, 4, 3, 2]
const firstNames = (
  '王 李 张 刘 陈 杨 赵 黄 周 吴 ' +
  '徐 孙 胡 朱 高 林 何 郭 马 罗 ' +
  '梁 宋 郑 谢 韩 唐 冯 于 董 萧 ' +
  '程 曹 袁 邓 许 傅 沈 曾 彭 吕 ' +
  '苏 卢 蒋 蔡 贾 丁 魏 薛 叶 阎 ' +
  '余 潘 杜 戴 夏 锺 汪 田 任 姜 ' +
  '范 方 石 姚 谭 廖 邹 熊 金 陆 ' +
  '郝 孔 白 崔 康 毛 邱 秦 江 史 ' +
  '顾 侯 邵 孟 龙 万 段 雷 钱 汤 ' +
  '尹 黎 易 常 武 乔 贺 赖 龚 文'
).split(' ')
const lastNames = (
  '伟 芳 娜 秀英 敏 静 丽 强 磊 军 ' +
  '洋 勇 艳 杰 娟 涛 明 超 秀兰 霞 ' +
  '平 刚 桂英'
).split(' ')

export default {
  name: 'idCard',
  components: {
    AreaSelect,
    BirthdaySelect,
    GenderSelect,
    CountSelect,
  },
  setup() {
    const internalInstance = getCurrentInstance()
    const globalProperties = internalInstance.appContext.config.globalProperties
    const genderObj = {
      male: 'male',
      female: 'female',
    }
    const areaRef = ref(null)
    const birthdayRef = ref(null)
    const genderRef = ref(null)
    const countRef = ref(null)
    const resultData = ref([])
    const idCardDialogVisible = ref(false)
    const switchName = ref(false)
    const extra = reactive({
      cardAddressDetail: '',
      cardDepartment: '',
      cardPeriodFront: '',
      cardPeriodEnd: '',
    })
    const areaAddress = reactive({
      code: '',
      text: '',
    })
    // watch
    watch(areaAddress, (newVal, oldVal) => {
      if (areaRef.value) {
        getAddressText()
      }
    }, { deep: true })
    // methods
    const addZero = (data) => {
      if (data >= 1 && data < 10) {
        return `0${data}`
      }
      return data.toString()
    }
    const getAddressText = () => {
      const {
        provinceVal,
        cityVal,
        countryVal,
      } = areaRef.value
      areaAddress.text = province_list[provinceVal] + city_list[cityVal] + county_list[countryVal]
    }
    // 计算年龄
    const calculateAge = (data) => {
      if (!data) return -1
      const {
        yearVal,
        monthVal,
        dayVal,
      } = data
      const birthday = yearVal.toString() + '/' + addZero(monthVal) + '/' + addZero(dayVal)
      let returnAge
      const strBirthdayArr = new Date(birthday)
      const birthYear = strBirthdayArr.getFullYear()
      const birthMonth = strBirthdayArr.getMonth() + 1
      const birthDay = strBirthdayArr.getDate()

      const now = new Date()
      const nowYear = now.getFullYear()
      const nowMonth = now.getMonth() + 1
      const nowDay = now.getDate()

      if (nowYear === birthYear) {
        if (nowMonth < birthMonth) {
          returnAge = -1
        } else {
          if (nowDay < birthDay) {
            returnAge = -1
          } else {
            returnAge = 0// 同年 则为0岁
          }
        }
      } else {
        const ageDiff = nowYear - birthYear // 年之差
        if (ageDiff > 0) {
          if (nowMonth === birthMonth) {
            const dayDiff = nowDay - birthDay// 日之差
            if (dayDiff < 0) {
              returnAge = ageDiff - 1
            } else {
              returnAge = ageDiff
            }
          } else {
            const monthDiff = nowMonth - birthMonth// 月之差
            if (monthDiff < 0) {
              returnAge = ageDiff - 1
            } else {
              returnAge = ageDiff
            }
          }
        } else {
          returnAge = -1// 返回-1 表示出生日期输入错误 晚于今天
        }
      }
      return returnAge
    }
    // 获取指定范围内的随机数
    const randomAccess = (min, max) => {
      return Math.floor(Math.random() * (min - max) + max)
    }
    // 生成随机姓名
    const getRandomName = () => {
      return firstNames[randomAccess(0, firstNames.length)] + lastNames[randomAccess(0, lastNames.length)]
    }
    // 生成15-17位顺序码
    const getCodeList = (gender, count, list = []) => {
      const len = list.length
      if (gender === genderObj.female) {
        for (let i = 0; i < count - len; i++) {
          const code = Math.floor(Math.random() * 999 + 1)
          if (code % 2 === 0) {
            list.push(code)
          }
        }
      } else {
        for (let i = 0; i < count - len; i++) {
          const code = Math.floor(Math.random() * 999 + 1)
          if (code % 2 !== 0) {
            list.push(code)
          }
        }
      }
      list = Array.from(new Set(list))
      if (len !== count) {
        list = getCodeList(gender, count, list)
      }
      return list
    }
    // 生成18位身份证
    const getCardNoList = (obj) => {
      const cardNoList = []
      const [
        area,
        birthday,
        gender,
        count,
      ] = obj
      const age = calculateAge(birthdayRef.value)
      const codeList = getCodeList(gender, count)
      codeList.forEach((code) => {
        if (code.toString().length < 3) {
          code = ('0'.repeat(3) + code).slice(-3)
        }
        const frontCode = `${area}${birthday}${code}`
        const frontArr = [...frontCode]
        let lastCode = ''
        let sum = 0
        for (let j = 0; j < frontCode.length; j++) {
          sum = sum + Number(frontArr[j]) * prefixArr[j]
        }
        lastCode = lastCodeArr[sum % 11]
        cardNoList.push({
          name: getRandomName(),
          cardNo: `${frontCode}${lastCode}`,
          age: age,
        })
      })
      return cardNoList
    }
    // 生成表格数据
    const genResultData = () => {
      const { countryVal } = areaRef.value
      const {
        yearVal,
        monthVal,
        dayVal,
      } = birthdayRef.value
      const birthdayVal = yearVal.toString() + addZero(monthVal) + addZero(dayVal)
      const { genderVal } = genderRef.value
      const { countVal } = countRef.value
      // console.log('areaRef:', areaRef.value)
      // console.log('birthdayRef:', birthdayRef.value)
      // console.log('genderRef:', genderRef.value)
      // console.log('countRef:', countRef.value)
      // console.log('countryVal:', countryVal)
      // console.log('birthdayVal:', birthdayVal)
      // console.log('genderVal:', genderVal)
      // console.log('countVal:', countVal)
      resultData.value = getCardNoList([countryVal, birthdayVal, genderVal, countVal])
    }
    const copyCardNo = (cardNo) => {
      if (clipboard(cardNo)) {
        globalProperties.$message.success('复制成功')
      } else {
        globalProperties.$message.error('复制失败')
      }
    }
    const genIdCardPicture = (data) => {
      if (!areaAddress.text) {
        console.log('gen address')
        getAddressText()
      }
      const gender = genderRef?.value?.genderVal
      idCardDialogVisible.value = true
      const birthday = data?.cardNo.slice(6, 14)
      const config = {
        // avatar: '', 废弃
        name: data.name,
        cardNo: data.cardNo,
        gender: gender === genderObj.male ? '男' : '女',
        nation: '汉',
        address: areaAddress.text + (extra.cardAddressDetail || '江场三路288号'),
        issuingAuthority: extra.cardDepartment || '上海市公安局静安分局',
        validityStart: extra.cardPeriodFront || `${birthday.slice(0, 4)}/${birthday.slice(4, 6)}/${birthday.slice(6, 8)}`,
        validityEnd: extra.cardPeriodEnd || '长期',
      }
      setTimeout(() => {
        genImg(config)
      }, 10)
    }
    const clearResultData = (e) => {
      resultData.value = []
      areaAddress.code = e
    }
    return {
      resultData,
      areaRef,
      birthdayRef,
      genderRef,
      countRef,
      genResultData,
      copyCardNo,
      genIdCardPicture,
      clearResultData,
      idCardDialogVisible,
      switchName,
      ...toRefs(extra),
    }
  },
}
</script>

<style scoped lang="scss">
.idCard-content {
  width: 1200px;
  margin: 0 auto 30px;
  padding: 30px 0;
  box-sizing: border-box;

  .title {
    width: 100%;
    text-align: center;
    font-family: 'ocrb10bt';
  }

  .select {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    margin: 30px auto 0;

    &__row {
      display: flex;
      justify-content: flex-start;
      align-items: center;
      min-width: 1000px;
      border: 1px #EFEFEF solid;
      padding: 20px 0 20px 50px;
      box-sizing: border-box;
      margin-bottom: 20px;

      &-multi {
        display: flex;
        justify-content: flex-start;
        align-items: center;
        margin-right: 140px;
      }

      &-p {
        min-width: 100px;
        font-size: 18px;
        font-weight: bold;
        line-height: 18px;
      }
    }
  }

  .result {
    font-family: 'hei';

    .el-table {
      margin: 0 auto;

      ::v-deep(.table-th) {
        color: #333333;
        font-family: 'fzzdxjw-gb1-0';
      }

      .modify-name.is-disabled {
        ::v-deep(.el-input__inner) {
          border: unset;
          background-color: #FFFFFF;
          color: #606266;
          cursor: default;
        }
      }
    }

    .extra-card {
      margin: 5px 0;
    }

    .extra-period {
      display: flex;

      ::v-deep(.el-input) {
        margin-right: 5px;

        &:last-child {
          margin-right: unset;
        }
      }
    }
  }
}

.idCardImg {
  width: 100%;
  height: 100%;
}
</style>
