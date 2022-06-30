<template>
  <el-drawer
    :model-value="show"
    size="45%"
    :show-close="false"
    :close-on-click-modal="closeOnModal"
    @close="closeDrawer">
    <template #header="{ close, titleId, titleClass }">
      <h4 v-if="title" :id="titleId" :class="titleClass">{{ title }}</h4>
      <el-button @click="close">关闭</el-button>
    </template>
    <slot name="content"/>
  </el-drawer>
</template>

<script setup>
// eslint-disable-next-line no-undef
defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  closeOnModal: {
    type: Boolean,
    default: true,
  },
  title: {
    type: String,
    default: '',
  },
})
// eslint-disable-next-line no-undef
const emits = defineEmits(['update:show'])

const closeDrawer = () => {
  emits('update:show')
}
</script>

<style scoped lang="scss">
</style>
