<template>
  <div class="page">
    <div class="fl-row jsRun-content">
      <div class="fl-col editor-panel">
        <div class="action-bar">
          <el-button @click="lookSourceCode">源码</el-button>
          <el-button @click="lookDocument">文档</el-button>
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

    <CommonDrawer v-model:show="documentDrawer" title="需求&流程&思路">
      <template #content>
        <div class="document-content" v-for="(doc, idx) in docContent" :key="idx">
          <p class="c-title">{{ doc.label }}</p>
          <p class="c-p">{{ doc.value }}</p>
        </div>
      </template>
    </CommonDrawer>

    <CommonDrawer v-model:show="sourceDrawer" :close-on-modal="false" title="源码">
      <template #content>
        <el-input type="textarea" class="source-textarea" v-model="sourceCode" readonly></el-input>
      </template>
    </CommonDrawer>

    <CommonDialog ref="validDialog" v-model:show="randomValid" title="随机验证" @close="closeValid" @confirm="checkAnswerRight">
      <template #content>
        <div class="valid-content">
          <p style="margin-bottom: 10px;">{{ qa.question }}</p>
          <el-input v-model="qa.curAnswer" @keyup.enter="triggerClick"></el-input>
        </div>
      </template>
    </CommonDialog>
  </div>
</template>

<script setup>
import { watch } from 'vue'
import MonacoEditor from '@components/MonacoEditor'
import CommonDrawer from '@components/CommonDrawer'
import CommonDialog from '@components/CommonDialog'
import { useCommonJsRun } from '@/hooks/useCommonJsRun'
import { useValid } from '@/hooks/useValid'
import { demo, docContent, revertStrToHtml, sourceCodePath } from '@utils/tool/strToHtml'
import { readSourceCode } from '@utils/tool/reader'

const {
  global,
  editorBox,
  logValue,
  sourceCode,
  sourceDrawer,
  randomValid,
  documentDrawer,
  lookSourceCode,
  lookDocument,
  clearCode,
  lookDemo,
  clearConsole,
  copyConsole,
} = useCommonJsRun()

const {
  qa,
  randomQa,
  closeValid,
  validAnswer,
  validDialog,
  triggerClick,
} = useValid()

watch(randomValid, (newVal) => {
  if (newVal) {
    randomQa()
  }
})

const checkAnswerRight = () => {
  if (validAnswer(qa.answer, qa.curAnswer)) {
    randomValid.value = false
    readSourceCode(sourceCodePath).then(res => {
      sourceCode.value = res.data
      sourceDrawer.value = true
    })
  } else {
    global.$message.warning('验证不通过')
    randomQa()
  }
  closeValid()
}

const runStrToHtml = () => {
  try {
    const {
      getCodeContent,
    } = editorBox.value
    const runCode = getCodeContent()
    if (runCode) {
      logValue.value = ''
      console.log('执行代码!')
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
@import "../styles/js-document";
@import "../styles/js-source";
</style>
