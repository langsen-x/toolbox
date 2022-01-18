<template>
  <div class="sub-select">
    <div class="sub-select__row">
      <el-radio-group v-model="genderVal" size="large" @change="changeGender">
        <el-radio label="male">男</el-radio>
        <el-radio label="female">女</el-radio>
      </el-radio-group>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'

export default {
  name: 'gender-select',
  emits: ['clear'],
  setup(props, context) {
    const genderVal = ref('male')
    const changeGender = () => {
      console.log('genderVal:', genderVal.value)
      context.emit('clear')
    }
    return {
      genderVal,
      changeGender,
    }
  },
}
</script>

<style scoped lang="scss">
@import "sub-select";
</style>
