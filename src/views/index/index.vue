<template>
  <div class="page">
    <div class="index-content">
      <div class="card-group">
        <div class="card-group__item point" v-for="tool in toolRoutes" :key="tool.name"
             @click="goToTool(tool.path)">
          <p class="single-line">{{ tool.meta.title }}</p>
        </div>
        <div class="card-group__item point" v-for="i in itemNum" :key="i" @click="addItem">
          <p class="single-line">一段文字很长看不到后面内容</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import toolRoutes from '@/router/tool'
import { ref, watch } from 'vue'
import { globalProperties } from '@utils/globalProperties'

const { global } = globalProperties()
// data
const itemNum = ref(1)
// watch
watch(itemNum, (newValue, oldValue) => {
  console.log('The old itemNum value is: ' + oldValue)
  console.log('The new itemNum value is: ' + newValue)
})
// methods
const goToTool = (path) => {
  global.$router.push({
    path,
  })
}
const addItem = () => {
  itemNum.value++
  global.$logGlobal(itemNum.value)
}
</script>

<style scoped lang="scss">
.index-content {
  width: 1200px;
  margin: 0 auto;

  .card-group {
    display: flex;
    flex-flow: row wrap;
    width: 100%;

    &__item {
      display: flex;
      justify-content: center;
      align-items: center;
      width: calc((100% - 60px) / 4);
      height: 300px;
      margin-top: 10px;
      margin-bottom: 10px;
      margin-right: 20px;
      background-color: #EFEFEF;
      border-radius: 10px;
      padding: 0 20px;
      box-sizing: border-box;

      &:nth-child(4n) {
        margin-right: 0;
      }

      p {
        font-size: 24px;
        font-weight: bold;
      }
    }
  }
}
</style>
