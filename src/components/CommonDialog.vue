<template>
  <el-dialog
    :model-value="show"
    :title="title"
    width="40%"
    center
    :close-on-click-modal="false"
    :show-close="false"
    destroy-on-close
    @close="closeDialog">
    <slot name="content"/>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="closeDialog">取消</el-button>
        <el-button type="primary" @click="confirmDialog">确认</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
// eslint-disable-next-line no-undef
defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: '',
  },
})

// eslint-disable-next-line no-undef
const emits = defineEmits(['update:show', 'close', 'confirm'])

const closeDialog = () => {
  emits('close')
  emits('update:show')
}

const confirmDialog = () => {
  emits('confirm')
}
</script>

<style scoped lang="scss">

</style>
