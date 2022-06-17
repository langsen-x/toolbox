<template>
  <div class="sub-select">
    <div class="sub-select__row">
      <el-select v-model="provinceVal" placeholder="请选择" size="large" @change="changeProvince">
        <el-option
          v-for="item in provinceOptions"
          :key="item.value"
          :label="item.label"
          :value="item.value"
          :disabled="areaDisabled(item.value)"
        >
        </el-option>
      </el-select>
      <el-select v-model="cityVal" placeholder="请选择" size="large" @change="changeCity">
        <el-option
          v-for="item in cityOptions"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        >
        </el-option>
      </el-select>
      <el-select v-model="countryVal" placeholder="请选择" size="large" @change="changeCountry">
        <el-option
          v-for="item in countryOptions"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        >
        </el-option>
      </el-select>
    </div>
    <el-button class="sub-select__btn" type="primary" round size="large" @click="randomArea">随机</el-button>
  </div>
</template>

<script>
import areaData from '@assets/data/area.json'
import { computed, onBeforeMount, ref, watch } from 'vue'

export default {
  name: 'area-select',
  emits: ['clear'],
  setup(props, context) {
    // 省市区
    const {
      province,
      city,
      country,
    } = areaData
    const provinceVal = ref('')
    const cityVal = ref('')
    const countryVal = ref('')
    const provinceOptions = ref(province)
    const cityOptions = ref([])
    const countryOptions = ref([])
    onBeforeMount(() => {
      randomArea()
    })
    const areaDisabled = computed(() => {
      return function(code) {
        if (code) {
          return ['71', '81', '82'].includes(code.slice(0, 2))
        }
        return false
      }
    })
    watch(countryVal, () => {
      context.emit('clear', countryVal.value)
    })
    // methods
    const updateCityOptions = () => {
      cityOptions.value = city.find(i => i.parent === (provinceVal.value + '').slice(0, 2))?.children || []
    }
    const updateCountryOptions = () => {
      countryOptions.value = country.find(i => i.parent === (cityVal.value + '').slice(0, 4))?.children || []
    }
    const changeProvince = () => {
      console.log('provinceVal:', provinceVal.value)
      updateCityOptions()
      cityVal.value = cityOptions.value[0]?.value || ''
      updateCountryOptions()
      countryVal.value = countryOptions.value[0]?.value || ''
    }
    const changeCity = () => {
      console.log('cityVal:', cityVal.value)
      updateCountryOptions()
      countryVal.value = countryOptions.value[0]?.value || ''
    }
    const changeCountry = () => {
      console.log('countryVal:', countryVal.value)
    }
    const randomLen = (len) => {
      return Math.floor(Math.random() * len)
    }
    const randomArea = () => {
      provinceVal.value = province[randomLen(provinceOptions.value.length - 3)]?.value || ''
      updateCityOptions()
      cityVal.value = cityOptions.value[randomLen(cityOptions.value.length)]?.value || ''
      updateCountryOptions()
      countryVal.value = countryOptions.value[randomLen(countryOptions.value.length)]?.value || ''
    }
    return {
      provinceVal,
      cityVal,
      countryVal,
      provinceOptions,
      cityOptions,
      countryOptions,
      changeProvince,
      changeCity,
      changeCountry,
      randomArea,
      areaDisabled,
    }
  },
}
</script>

<style scoped lang="scss">
@import "sub-select";
</style>
