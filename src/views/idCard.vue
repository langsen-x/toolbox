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
          <div class="select__row-multi" style="margin-right: 20px !important;">
            <p class="select__row-p">指定年龄：</p>
            <el-input class="unique-age" :disabled="!uniqueAge" v-model="uniqueAgeVal" clearable
                      maxlength="2"/>
          </div>
          <el-switch v-model="uniqueAge"/>
          <div class="select__row-multi" style="margin-right: 20px !important;">
            <p class="select__row-p">年龄段：</p>
            <el-input class="unique-age" :disabled="!uniqueAgeRange" v-model="uniqueAgeRangeStartVal" clearable
                      maxlength="2"/>
            <p>&nbsp;-&nbsp;</p>
            <el-input class="unique-age" :disabled="!uniqueAgeRange" v-model="uniqueAgeRangeEndVal" clearable
                      maxlength="2"/>
          </div>
          <el-switch v-model="uniqueAgeRange"/>
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
          <el-table-column type=index label="序号" width="70"/>
          <el-table-column prop="name" label="姓名" width="140">
            <template #header>
              <div style="display: flex; align-items: center">
                <p>姓名</p>
                <el-switch v-model="switchName"/>
              </div>
            </template>
            <template #default="scope">
              <el-input class="modify-name" :disabled="!switchName" v-model="scope.row.name" clearable maxlength="10"/>
            </template>
          </el-table-column>
          <el-table-column prop="age" label="年龄" width="70"></el-table-column>
          <el-table-column prop="cardNo" label="身份证号">
            <template #default="scope">
              <p class="cardNo-p">{{ scope.row.cardNo }}</p>
            </template>
          </el-table-column>
          <el-table-column label="其他" width="380">
            <el-input class="extra-card" v-model="cardAddressDetail" placeholder="详细地址" clearable maxlength="20"/>
            <el-input class="extra-card" v-model="cardDepartment" placeholder="签发机关" clearable maxlength="20"/>
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
import { firstNames, lastCodeArr, lastNames, monthBig, monthLeap, monthNoLeap, monthSmall, prefixArr } from '@config'
import { DateUtil } from 'sn-js-utils'

const {
  // eslint-disable-next-line camelcase
  province_list,
  // eslint-disable-next-line camelcase
  city_list,
  // eslint-disable-next-line camelcase
  county_list,
} = areaList

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
    const uniqueAge = ref(false)
    const uniqueAgeVal = ref('')
    const uniqueAgeRange = ref(false)
    const uniqueAgeRangeStartVal = ref('')
    const uniqueAgeRangeEndVal = ref('')
    // watch
    watch(areaAddress, (newVal, oldVal) => {
      if (areaRef.value) {
        getAddressText()
      }
    }, { deep: true })
    watch(uniqueAge, (newVal, oldVal) => {
      if (newVal) {
        uniqueAgeRange.value = false
      }
    })
    watch(uniqueAgeRange, (newVal, oldVal) => {
      if (newVal) {
        uniqueAge.value = false
      }
    })
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
      const birthday = data.slice(0, 4) + '/' + data.slice(4, 6) + '/' + data.slice(6, 8)
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
      return Math.floor(Math.random() * (max - min)) + min
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
      const age = calculateAge(birthday)
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
    // 得到可以选择的天数
    const getDateDayList = (year, month, type, day) => {
      // 条件:能被4整除并且不能被100整除，或者被400整除的
      if ([1, 3, 5, 7, 8, 10, 12].includes(month)) {
        if (day) {
          if (type === 'before') {
            return monthBig.slice(day - 1, monthBig.length)
          } else if (type === 'after') {
            return monthBig.slice(0, day - 1)
          }
        }
        return monthBig
      } else if ([4, 6, 9, 11].includes(month)) {
        if (day) {
          if (type === 'before') {
            return monthSmall.slice(day - 1, monthSmall.length)
          } else if (type === 'after') {
            return monthSmall.slice(0, day - 1)
          }
        }
        return monthSmall
      } else { // 2
        let flag = false
        if ((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0) {
          flag = true
        }
        if (flag) {
          if (day) {
            if (type === 'before') {
              return monthLeap.slice(day - 1, monthLeap.length)
            } else if (type === 'after') {
              return monthLeap.slice(0, day - 1)
            }
          }
          return monthLeap
        } else {
          if (day) {
            if (type === 'before') {
              return monthNoLeap.slice(day - 1, monthNoLeap.length)
            } else if (type === 'after') {
              return monthNoLeap.slice(0, day - 1)
            }
          }
          return monthNoLeap
        }
      }
    }
    // 生成某个日期到某个日期（指定年龄）之间指定数量的所有日期list（生成18位身份证）
    const getDateDiffList = (ageDiff, obj) => {
      const [
        diffStartYear,
        diffEndYear,
      ] = ageDiff
      const nowStr = DateUtil.formatDate(new Date(), 'yyyy-MM-dd')
      const startDate = DateUtil.dateBefore(nowStr, {
        year: diffStartYear + 1,
        day: -1,
      })
      const endDate = DateUtil.dateBefore(nowStr, {
        year: diffEndYear,
      })
      const beforeYear = startDate.getFullYear()
      const beforeMonth = startDate.getMonth() + 1
      const beforeDay = startDate.getDate()
      const afterYear = endDate.getFullYear()
      const afterMonth = endDate.getMonth() + 1
      const afterDay = endDate.getDate()
      let yearList = []
      for (let i = beforeYear; i < afterYear; i++) {
        yearList.push(i)
      }
      const startDateObj = {
        type: 'before',
        year: beforeYear,
        yearList: yearList,
        month: beforeMonth,
        monthList: Array(12 - beforeMonth + 1).fill(0).map((i, idx) => {
          i = idx + beforeMonth
          return i
        }),
        day: beforeDay,
      }
      const endDateObj = {
        type: 'after',
        year: afterYear,
        yearList: [afterYear],
        month: afterMonth,
        monthList: Array(afterMonth).fill(0).map((i, idx) => {
          i = idx + 1
          return i
        }),
        day: afterDay,
      }
      // console.log('startDateObj:', startDateObj)
      // console.log('endDateObj:', endDateObj)
      const dateObjList = [
        startDateObj,
        endDateObj,
      ]
      yearList = startDateObj.yearList.concat(endDateObj.yearList)
      // console.log('dateObjList:', dateObjList)
      // console.log('yearList:', yearList)
      const [
        area,
        gender,
        count,
      ] = obj
      const isSame = diffStartYear === diffEndYear
      const birthdayList = []
      const cardNoList = []
      for (let i = 0; i < count; i++) {
        const randomYear = yearList[randomAccess(0, yearList.length)]
        const obj = dateObjList.find(i => i.yearList.includes(randomYear))
        const randomMonth = obj.monthList[randomAccess(0, obj.monthList.length)]
        let randomDayList
        if (randomMonth === beforeMonth && [diffStartYear, diffEndYear].includes(randomYear)) {
          randomDayList = getDateDayList(randomYear, randomMonth, obj.type, beforeDay)
        } else {
          randomDayList = getDateDayList(randomYear, randomMonth)
        }
        const randomDay = randomDayList[randomAccess(0, randomDayList.length)]
        birthdayList.push(randomYear + addZero(randomMonth) + addZero(randomDay))
      }
      const codeList = getCodeList(gender, count)
      // console.log('codeList:', codeList)
      codeList.forEach((code, idx) => {
        const curBirthDay = birthdayList?.[idx] || ''
        if (code.toString().length < 3) {
          code = ('0'.repeat(3) + code).slice(-3)
        }
        const frontCode = `${area}${curBirthDay}${code}`
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
          age: isSame ? diffStartYear : calculateAge(curBirthDay),
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
      if (uniqueAge.value) {
        if (!uniqueAgeVal.value.trim()) {
          globalProperties.$message.warning('请输入指定年龄')
          return
        }
        const age = parseInt(uniqueAgeVal.value)
        if (isNaN(age)) {
          globalProperties.$message.warning('请输入正确的年龄')
          return
        }
        resultData.value = getDateDiffList([age, age], [countryVal, genderVal, countVal])
        return
      }
      if (uniqueAgeRange.value) {
        const ageStart = parseInt(uniqueAgeRangeStartVal.value)
        const ageEnd = parseInt(uniqueAgeRangeEndVal.value)
        if (isNaN(ageStart) || isNaN(ageEnd)) {
          globalProperties.$message.warning('请输入正确的年龄段')
          return
        }
        if (ageStart >= ageEnd) {
          return globalProperties.$message.warning('截止年龄应大于起始年龄')
        }
        // console.log(ageStart, ageEnd)
        resultData.value = getDateDiffList([ageEnd, ageStart], [countryVal, genderVal, countVal])
        return
      }
      resultData.value = getCardNoList([countryVal, birthdayVal, genderVal, countVal])
    }
    // 复制身份证号
    const copyCardNo = (cardNo) => {
      if (clipboard(cardNo)) {
        globalProperties.$message.success('复制成功')
      } else {
        globalProperties.$message.error('复制失败')
      }
    }
    // 生成身份证图片
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
      uniqueAge,
      uniqueAgeVal,
      uniqueAgeRange,
      uniqueAgeRangeStartVal,
      uniqueAgeRangeEndVal,
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

      .el-switch {
        margin-right: 63px;
      }

      &-multi {
        display: flex;
        justify-content: flex-start;
        align-items: center;
        margin-right: 140px;
      }

      .unique-age {
        width: 120px;
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
      color: #333333;

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

      .cardNo-p {
        font-weight: bold;
        letter-spacing: 0.5px;
        font-size: 15px;
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
