<template>
  <div class="page">
    <div class="idCard-content">
      <h1 class="title">身份证在线生成器</h1>
      <div class="select">
        <div class="select__row">
          <p class="select__row-p">省市区：</p>
          <AreaSelect ref="areaRef" @clear="clearResultData"></AreaSelect>
        </div>
        <div class="select__row">
          <p class="select__row-p">出生日期：</p>
          <BirthdaySelect ref="birthdayRef" @clear="clearResultData"></BirthdaySelect>
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
            <GenderSelect ref="genderRef" @clear="clearResultData"></GenderSelect>
          </div>
          <div class="select__row-multi">
            <p class="select__row-p">个数：</p>
            <CountSelect ref="countRef" @clear="clearResultData"></CountSelect>
          </div>
        </div>
      </div>
      <div id="id-card-list" class="result">
        <div class="result-top">
          <el-pagination background layout="prev, pager, next" :total="resultData.length" :current-page="currentPage"
                         :page-size="pageSize" @current-change="changeCurrentPage"/>
          <el-button type="primary" round size="large"
                     :loading="genDataLoading" @click="genResultData">生成
          </el-button>
        </div>
        <el-table :data="tableData" border style="width: 1000px" header-cell-class-name="table-th" empty-text="暂无数据"
                  v-loading="tableLoading">
          <el-table-column prop="idx" label="序号" width="60"/>
          <el-table-column prop="name" label="姓名" width="130">
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
          <el-table-column prop="cardNo" label="身份证号" min-width="230">
            <template #default="scope">
              <p class="cardNo-p">
                <span>{{ (scope.row.cardNo + '').slice(0, 6) }}&nbsp;</span>
                <span>{{ (scope.row.cardNo + '').slice(6, 14) }}&nbsp;</span>
                <span>{{ (scope.row.cardNo + '').slice(14, 18) }}</span>
              </p>
            </template>
          </el-table-column>
          <el-table-column label="其他" min-width="300" v-if="switchExtra">
            <template #default="scope">
              <el-input class="extra-card" v-model="scope.row.cardAddressDetail" placeholder="详细地址" clearable
                        maxlength="20"/>
              <el-input class="extra-card" v-model="scope.row.cardDepartment" placeholder="签发机关" clearable
                        maxlength="20"/>
              <div class="extra-card extra-period">
                <el-date-picker v-model="scope.row.cardPeriodFront" type="date" placeholder="有效起期"
                                value-format="YYYY/MM/DD"
                                format="YYYY-MM-DD" clearable>
                </el-date-picker>
                <el-date-picker v-model="scope.row.cardPeriodEnd" type="date" placeholder="有效止期"
                                value-format="YYYY/MM/DD"
                                format="YYYY-MM-DD" clearable>
                </el-date-picker>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200">
            <template #default="scope">
              <div class="operation-col">
                <el-button
                  text
                  type="primary"
                  @click="copyCardNo(scope.row.cardNo)">复制
                </el-button>
                <el-button
                  text
                  type="primary"
                  @click="genIdCardPicture(scope.row)">生成图片
                </el-button>
                <el-button
                  style="margin-left: unset;"
                  text
                  type="primary"
                  @click="changeAvatarImg(scope.row.idx)">更换头像
                </el-button>
                <el-button
                  text
                  type="primary"
                  @click="operateExtra">
                  {{ switchExtra ? '关闭其他' : '开启其他' }}
                </el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <el-backtop/>
    </div>
    <div class="modal">
      <img id="emptyBg" src="./_assets/empty.png" alt="" style="display: none">
      <el-dialog
        v-model="idCardDialogVisible"
        title="身份证图片"
        width="40%">
        <img id="idCardImg" class="idCardImg" src="" alt=""/>
      </el-dialog>
    </div>

    <div class="modal">
      <img id="avatarImg" :src="defaultAvatar" alt="" style="display: none">
      <el-dialog
        v-model="avatarVisible"
        title="更换头像"
        width="20%">
        <div class="avatar-uploader">
          <div class="avatar el-upload" @click="uploadAvatar">
            <img class="avatar" :src="curAvatar" alt=""/>
            <el-icon class="avatar-uploader-icon">
              <Plus/>
            </el-icon>
          </div>
        </div>
      </el-dialog>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, reactive, ref, watch } from 'vue'
import AreaSelect from './_components/AreaSelect'
import BirthdaySelect from './_components/BirthdaySelect'
import GenderSelect from './_components/GenderSelect'
import CountSelect from './_components/CountSelect'
import clipboard from 'copy-text-to-clipboard'
import { genImg } from '@utils/tool/idCard'
import { areaList } from '@assets/data/area'
import {
  firstNames,
  lastCodeArr,
  lastNames,
  monthBig,
  monthLeap,
  monthNoLeap,
  monthSmall,
  prefixArr,
} from '@config/idCard'
import { DateUtil } from 'sn-js-utils'
import { chooseImage } from '@utils/choose-file/choose-image'
import { globalProperties } from '@utils/globalProperties'
import { Plus } from '@element-plus/icons-vue'
import defaultAvatar from './_assets/avatar.png'

const {
  // eslint-disable-next-line camelcase
  province_list,
  // eslint-disable-next-line camelcase
  city_list,
  // eslint-disable-next-line camelcase
  county_list,
} = areaList

const { global } = globalProperties()
const genderObj = {
  male: 'male',
  female: 'female',
}
const currentPage = ref(1)
const pageSize = ref(10)
const genDataLoading = ref(false)
const tableLoading = ref(false)
const areaRef = ref(null)
const birthdayRef = ref(null)
const genderRef = ref(null)
const countRef = ref(null)
const resultData = ref([])
const idCardDialogVisible = ref(false)
const switchName = ref(false)
const switchExtra = ref(false)
const avatarVisible = ref(false)
const avatarImgUrlId = ref(-1)
const areaAddress = reactive({
  code: '',
  text: '',
})
const uniqueAge = ref(false)
const uniqueAgeVal = ref('')
const uniqueAgeRange = ref(false)
const uniqueAgeRangeStartVal = ref('')
const uniqueAgeRangeEndVal = ref('')
// computed
const tableData = computed(() => {
  const tempData = JSON.parse(JSON.stringify(resultData.value))
  return tempData.slice((currentPage.value - 1) * pageSize.value, (currentPage.value) * pageSize.value)
})

const curAvatar = computed(() => {
  return (tableData.value[avatarImgUrlId.value - 1] || '').avatar || defaultAvatar
})
// watch
watch(areaAddress, () => {
  if (areaRef.value) {
    getAddressText()
  }
}, { deep: true })
watch(uniqueAge, (newVal) => {
  if (newVal) {
    uniqueAgeRange.value = false
  }
})
watch(uniqueAgeRange, (newVal) => {
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
  codeList.forEach((code, idx) => {
    if (code.toString().length < 3) {
      code = ('0'.repeat(3) + code).slice(-3)
    }
    const frontCode = `${area}${birthday}${code}`
    const frontArr = [...frontCode]
    let sum = 0
    for (let j = 0; j < frontCode.length; j++) {
      sum = sum + Number(frontArr[j]) * prefixArr[j]
    }
    const lastCode = lastCodeArr[sum % 11]
    cardNoList.push({
      idx: idx + 1,
      name: getRandomName(),
      cardNo: `${frontCode}${lastCode}`,
      age: age,
    })
  })
  return cardNoList
}
// 得到可以选择的天数
const getDateDayList = (year, month, day, type) => {
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
    const dtObj = dateObjList.find(i => i.yearList.includes(randomYear))
    const randomMonth = dtObj.monthList[randomAccess(0, dtObj.monthList.length)]
    let randomDayList
    if (randomMonth === dtObj.month) {
      randomDayList = getDateDayList(randomYear, randomMonth, dtObj.day, dtObj.type)
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
    let sum = 0
    for (let j = 0; j < frontCode.length; j++) {
      sum = sum + Number(frontArr[j]) * prefixArr[j]
    }
    const lastCode = lastCodeArr[sum % 11]
    cardNoList.push({
      idx: idx + 1,
      name: getRandomName(),
      cardNo: `${frontCode}${lastCode}`,
      age: isSame ? diffStartYear : calculateAge(curBirthDay),
    })
  })
  return cardNoList
}
const _checkUniqueAge = (age) => {
  if (!uniqueAgeVal.value.trim()) {
    throw new Error('请输入指定年龄')
  }
  if (isNaN(age)) {
    throw new Error('请输入正确的年龄')
  }
}
const _checkUniqueAgeRange = (ageStart, ageEnd) => {
  if (isNaN(ageStart) || isNaN(ageEnd)) {
    throw Error('请输入正确的年龄段')
  }
  if (ageStart >= ageEnd) {
    throw Error('截止年龄应大于起始年龄')
  }
}
// 生成表格数据
const genResultData = () => {
  genDataLoading.value = true
  tableLoading.value = true
  setTimeout(() => {
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
    try {
      if (uniqueAge.value) {
        const age = parseInt(uniqueAgeVal.value)
        _checkUniqueAge(age)
        resultData.value = getDateDiffList([age, age], [countryVal, genderVal, countVal])
      } else if (uniqueAgeRange.value) {
        const ageStart = parseInt(uniqueAgeRangeStartVal.value)
        const ageEnd = parseInt(uniqueAgeRangeEndVal.value)
        // console.log(ageStart, ageEnd)
        _checkUniqueAgeRange(ageStart, ageEnd)
        resultData.value = getDateDiffList([ageEnd, ageStart], [countryVal, genderVal, countVal])
      } else {
        resultData.value = getCardNoList([countryVal, birthdayVal, genderVal, countVal])
      }
    } catch (e) {
      global.$message.warning(e.message)
      genDataLoading.value = false
      tableLoading.value = false
      return
    }
    genDataLoading.value = false
    tableLoading.value = false
    nextTick(() => {
      document.getElementById('id-card-list').scrollIntoView({
        block: 'start',
        behavior: 'smooth',
      })
    })
  }, 100)
}
// 复制身份证号
const copyCardNo = (cardNo) => {
  if (clipboard(cardNo)) {
    global.$message.success('复制成功')
  } else {
    global.$message.error('复制失败')
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
    avatar: data.avatar || defaultAvatar,
    name: data.name,
    cardNo: data.cardNo,
    gender: gender === genderObj.male ? '男' : '女',
    nation: '汉',
    address: areaAddress.text + (data.cardAddressDetail || '江场三路288号'),
    issuingAuthority: data.cardDepartment || '上海市公安局静安分局',
    validityStart: data.cardPeriodFront || `${birthday.slice(0, 4)}/${birthday.slice(4, 6)}/${birthday.slice(6, 8)}`,
    validityEnd: data.cardPeriodEnd || '长期',
  }
  setTimeout(() => {
    genImg(config)
  }, 10)
}
const changeAvatarImg = (id) => {
  avatarVisible.value = true
  avatarImgUrlId.value = id
}
const uploadAvatar = () => {
  chooseImage().then(files => {
    const [file] = files
    resultData.value[avatarImgUrlId.value - 1].avatar = file.url
    avatarVisible.value = false
    global.$message.success('上传图片成功')
  })
}
const operateExtra = () => {
  tableLoading.value = true
  setTimeout(() => {
    switchExtra.value = !switchExtra.value
    tableLoading.value = false
  }, 100)
}
const clearResultData = (e) => {
  resultData.value = []
  areaAddress.code = e
}
const changeCurrentPage = (e) => {
  currentPage.value = e
}
</script>

<style scoped lang="scss">
//@import "~@views/idCard/_buildFonts/hei/hei.css";
@import "~@views/idCard/_buildFonts/fzzdxjw-gb1-0/fzzdxjw-gb1-0.css";
@import "~@views/idCard/_buildFonts/ocrb10bt/ocrb10bt.css";

.idCard-content {
  width: 1200px;
  margin: 0 auto 30px;
  padding: 30px 0;
  box-sizing: border-box;

  .title {
    width: 100%;
    text-align: center;
    letter-spacing: 1px;
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
    width: 1000px;
    margin: -10px auto 0;
    font-family: 'fzzdxjw-gb1-0';

    .result-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 0;
    }

    .el-table {
      margin: 0 auto;
      color: #333333;

      :deep(.el-table__cell) {
        padding: 7px 0;
      }

      :deep(.table-th) {
        color: #333333;
        font-family: 'STXihei';
      }

      .modify-name.is-disabled {
        cursor: default;

        :deep(.el-input__wrapper) {
          box-shadow: unset;
          background-color: #FFFFFF;
        }

        :deep(.el-input__inner) {
          color: #606266;
          cursor: default;
        }
      }

      .cardNo-p {
        font-weight: bold;
        letter-spacing: 1px;
        font-size: 16px;
      }
    }

    .operation-col {
      display: flex;
      flex-flow: row wrap;
      justify-content: space-between;

      .el-button + .el-button {
        margin-left: unset;
      }
    }

    .extra-card {
      margin: 5px 0;
    }

    .extra-period {
      display: flex;

      :deep(.el-input) {
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

.avatar-uploader {
  display: flex;
  justify-content: center;

  .avatar {
    width: 178px;
    height: 178px;
    display: block;
  }

  .el-upload {
    border: 1px dashed var(--el-border-color);
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition: var(--el-transition-duration-fast);

    &:hover {
      border-color: var(--el-color-primary);
    }
  }
}

.el-icon.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 100%;
  height: 100%;
  text-align: center;
}
</style>
