<template>
  <div class="sub-select">
    <div class="sub-select__row">
      <el-select v-model="countVal" placeholder="请选择" size="large" @change="changeCount">
        <el-option
          v-for="item in countOptions"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        >
        </el-option>
      </el-select>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'

const countList = [10, 20, 50, 100]

export default {
  name: 'count-select',
  emits: ['clear'],
  setup(props, context) {
    const countVal = ref(10)
    const countOptions = countList.map(i => {
      return {
        label: `${i}个`,
        value: i,
      }
    })
    const changeCount = () => {
      console.log('genderVal:', countVal.value)
      context.emit('clear')
    }
    return {
      countVal,
      countOptions,
      changeCount,
    }
  },
}
</script>

<style scoped lang="scss">
@import "sub-select";
</style>
