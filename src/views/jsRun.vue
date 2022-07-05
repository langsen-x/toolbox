<template>
  <div class="page">
    <div class="fl-row jsRun-content">
      <div class="fl-col editor-panel">
        <div class="action-bar">
          <el-button @click="getDraft">草稿</el-button>
          <el-button @click="clearCode">清空代码</el-button>
          <el-button type="primary" @click="runEditorCode">运行</el-button>
        </div>
        <MonacoEditor ref="editorBox" class="code-editor" editor-id="jsRun-edit" @clear="clearConsole"/>
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

const {
  global,
  editorBox,
  logValue,
  clearCode,
  clearConsole,
  copyConsole,
} = useCommonJsRun()

const getDraft = () => {
  const {
    setCodeContent,
  } = editorBox.value
  const saveCode = localStorage.getItem('langsen.draft_code') || ''
  if (saveCode) {
    setCodeContent(JSON.parse(saveCode))
  }
}

const runEditorCode = () => {
  try {
    const {
      getCodeContent,
    } = editorBox.value
    const runCode = getCodeContent()
    if (runCode) {
      logValue.value = ''
      console.log('执行代码!')
      // eslint-disable-next-line no-new-func
      const runFn = new Function(runCode)
      runFn()
      localStorage.setItem('langsen.draft_code', JSON.stringify(runCode))
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
