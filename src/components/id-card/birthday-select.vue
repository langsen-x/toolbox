<template>
  <div class="sub-select">
    <div class="sub-select__row">
      <el-select v-model="yearVal" placeholder="请选择" size="large" @change="changeYear">
        <el-option
          v-for="item in yearOptions"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        >
        </el-option>
      </el-select>
      <el-select v-model="monthVal" placeholder="请选择" size="large" @change="changeMonth">
        <el-option
          v-for="item in monthOptions"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        >
        </el-option>
      </el-select>
      <el-select v-model="dayVal" placeholder="请选择" size="large" @change="changeDay">
        <el-option
          v-for="item in dayOptions"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        >
        </el-option>
      </el-select>
    </div>
    <el-button class="sub-select__btn" type="primary" round size="large" @click="randomBirthday">随机</el-button>
  </div>
</template>

<script>
import { onBeforeMount, ref } from 'vue'
import { dayList, monthLeap, monthNoLeap } from '@config/idCard'

export default {
  name: 'birthday-select',
  emits: ['clear'],
  setup(props, context) {
    // 出生日期
    const yearVal = ref(0)
    const monthVal = ref(0)
    const dayVal = ref(0)
    const yearOptions = []
    const monthOptions = []
    const dayOptions = ref([])
    // onMount
    onBeforeMount(() => {
      initDate()
    })
    // methods
    const emitDate = () => {
      context.emit('clear')
    }

    const initDate = () => {
      const now = new Date()
      const nowYear = now.getFullYear()
      const nowMonth = now.getMonth() + 1
      const nowDay = now.getDate()
      for (let i = 1900; i <= nowYear; i++) {
        yearOptions.unshift({
          label: `${i}年`,
          value: i,
        })
      }
      for (let i = 1; i <= 12; i++) {
        monthOptions.push({
          label: `${i}月`,
          value: i,
        })
      }
      getDayOptions(nowYear, nowMonth)
      yearVal.value = nowYear
      monthVal.value = nowMonth
      dayVal.value = nowDay
    }

    const getDayOptions = (year, month) => {
      const tempDayList = dayList.find(i => i.label === month)?.value
      if (tempDayList) {
        if (month !== 2) {
          dayOptions.value = tempDayList.map((i) => {
            return {
              label: `${i}日`,
              value: i,
            }
          })
        } else {
          if (isLeapYear(year)) {
            dayOptions.value = monthLeap.map((i) => {
              return {
                label: `${i}日`,
                value: i,
              }
            })
          } else {
            dayOptions.value = monthNoLeap.map((i) => {
              return {
                label: `${i}日`,
                value: i,
              }
            })
          }
        }
      }
    }

    const isLeapYear = (year) => {
      // 条件:能被4整除并且不能被100整除，或者被400整除的
      let flag = false
      if ((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0) {
        flag = true
      }
      return flag
    }

    const changeYear = () => {
      console.log('yearVal:', yearVal.value)
      if (monthVal.value === 2) {
        getDayOptions(yearVal.value, monthVal.value)
      }
      emitDate()
    }
    const changeMonth = () => {
      console.log('monthVal:', monthVal.value)
      getDayOptions(yearVal.value, monthVal.value)
      emitDate()
    }
    const changeDay = () => {
      console.log('dayVal:', dayVal.value)
      emitDate()
    }
    const getRandomVal = (data) => {
      return data[randomLen(data.length)]?.value || 0
    }
    const randomLen = (len) => {
      return Math.floor(Math.random() * len)
    }
    const randomBirthday = () => {
      yearVal.value = getRandomVal(yearOptions)
      monthVal.value = getRandomVal(monthOptions)
      getDayOptions(yearVal.value, monthVal.value)
      dayVal.value = getRandomVal(dayOptions.value)
    }
    return {
      yearVal,
      monthVal,
      dayVal,
      yearOptions,
      monthOptions,
      dayOptions,
      changeYear,
      changeMonth,
      changeDay,
      randomBirthday,
    }
  },
}
</script>

<style scoped lang="scss">
@import "sub-select";
</style>
