<template>
  <div class="page">
    <div class="fl-row jsRun-content">
      <div class="fl-col editor-panel">
        <div class="action-bar">
<!--          <el-button @click="lookDocument">文档</el-button>-->
          <el-button @click="lookDemo(demo)">查看示例</el-button>
          <el-button @click="clearCode">清空代码</el-button>
          <el-button type="primary" @click="runStrToHtml">运行</el-button>
        </div>
        <MonacoEditor ref="editorBox" class="code-editor" editor-id="strToHtml-edit" @clear="clearConsole"/>
      </div>
      <div class="fl-col log-panel">
        <div class="action-bar">
          <el-button text @click="copyConsole">copy console</el-button>
          <el-button text @click="clearConsole">clear console</el-button>
        </div>
        <el-input type="textarea" class="console-input" readonly v-model="logValue"></el-input>
      </div>
    </div>
  </div>
</template>

<script setup>
import MonacoEditor from '@components/MonacoEditor'
import { useCommonJsRun } from '@/hooks/useCommonJsRun'
import { demo, revertStrToHtml } from '@utils/tool/strToHtml'

const {
  global,
  editorBox,
  logValue,
  logger,
  clearCode,
  lookDemo,
  clearConsole,
  copyConsole,
} = useCommonJsRun()

// const lookDocument = () => {
//
// }

const runStrToHtml = () => {
  try {
    const {
      getCodeContent,
    } = editorBox.value
    const runCode = getCodeContent()
    if (runCode) {
      logValue.value = ''
      logger('执行代码!')
      // eslint-disable-next-line no-eval
      revertStrToHtml(eval(runCode))
    } else {
      global.$message.warning('代码内容面板为空')
    }
  } catch (e) {
    global.$message.error(e.message)
    clearConsole()
    throw new Error(e)
  }
}
</script>

<style scoped lang="scss">
@import "../styles/js-run";
</style>
