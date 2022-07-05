<template>
  <div class="page">
    <div class="fl-row jsRun-content">
      <div class="fl-col editor-panel">
        <div class="action-bar">
          <input type="file" @change="handleFileUpload"/>
          <el-button @click="lookDocument">文档</el-button>
          <el-button @click="loadConfigDemo">配置demo</el-button>
          <el-button type="danger" @click="otherDrawer = !otherDrawer">其他配置</el-button>
          <el-button type="danger" @click="handleFnBox">{{ showEditor2 ? '关闭' : '需要处理元数据' }}</el-button>
        </div>
        <div class="action-bar">
          <el-button @click="clearCode">清空代码</el-button>
          <el-button type="primary" @click="runGenJson">运行</el-button>
        </div>
        <MonacoEditor ref="editorBox" class="code-editor" editor-id="excelToJson-edit"/>
      </div>
      <div class="fl-col editor-panel" style="width: 50%;margin-left: 20px;">
        <MonacoEditor v-show="showEditor2" ref="editorBox2" class="code-editor" editor-id="excelToJson-edit-2"/>
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

    <CommonDrawer v-model:show="otherDrawer" title="其他配置">
      <template #content>
        <el-form label-width="100px">
          <el-form-item label="解析表索引">
            <el-input type="number" v-model="sheetName"></el-input>
          </el-form-item>
          <el-form-item label="生成文件名">
            <el-input v-model="genFileName"></el-input>
          </el-form-item>
          <el-form-item label="开启数据打印">
            <el-switch v-model="dataLog"></el-switch>
          </el-form-item>
        </el-form>
      </template>
    </CommonDrawer>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import MonacoEditor from '@components/MonacoEditor'
import CommonDrawer from '@components/CommonDrawer'
import * as XLSX from '@utils/xlsx.mjs'
import { createAndDownloadFile } from '@utils'
import { configDemo, docContent, fnDemo, transformArrayToEntries } from '@utils/tool/excelToJson'
import { useCommonJsRun } from '@/hooks/useCommonJsRun'
import { Gen } from '@utils/tool/excelClass'

const {
  global,
  editorBox,
  documentDrawer,
  lookDocument,
  clearCode,
} = useCommonJsRun()

// 上传的文件
const uploadFile = ref(null)
// 重写json的编辑器
const showEditor2 = ref(false)
const editorBox2 = ref(null)
// XLSX解析的json
const jsonArray = ref(null)
// parseExcel解析器的参数
let parseConfig = reactive({})

// 其他配置
const otherDrawer = ref(false)
// 解析的sheet索引
const sheetName = ref(0)
const genFileName = ref('parse')
// 开启数据console
const dataLog = ref(false)

const handleFileUpload = (e) => {
  uploadFile.value = e.target.files[0]
  const reader = new FileReader()
  reader.readAsArrayBuffer(uploadFile.value)
  reader.onload = (e) => {
    global.$message.success(`上传成功 ${uploadFile.value.name}`)
    const res = e.target.result// ArrayBuffer
    const workbook = XLSX.read(res, { type: 'array' })
    readWorkbook(workbook)
  }
}

const readWorkbook = (workbook) => {
  const sheetNames = workbook.SheetNames
  const worksheet = workbook.Sheets[sheetNames[sheetName.value]]
  jsonArray.value = XLSX.utils.sheet_to_json(worksheet)
  if (dataLog.value) {
    console.log('workbook:', workbook)
    console.log('worksheet:', worksheet)
    console.log('jsonArray:', jsonArray.value)
  }
}

const handleFnBox = () => {
  showEditor2.value = !showEditor2.value
  if (!showEditor2.value) {
    editorBox2.value.setCodeContent('')
  } else {
    editorBox2.value.setCodeContent(fnDemo)
  }
}

const loadConfigDemo = () => {
  editorBox.value.setCodeContent(configDemo)
}

const runGenJson = () => {
  if (jsonArray.value === null) {
    global.$message.warning('请上传需解析的xlsx文件！')
    return
  }
  const box1Content = editorBox.value.getCodeContent()
  if (!box1Content || !(box1Content || '').trim()) {
    global.$message.warning('请输入配置项！')
    return
  }
  if (showEditor2.value) {
    const box2Content = editorBox2.value.getCodeContent()
    if (!box2Content || !(box2Content || '').trim()) {
      global.$message.warning('请输入需要处理元数据的方法！')
      return
    }
  }
  // eslint-disable-next-line no-eval
  const configArr = eval(box1Content)
  parseConfig = configArr[0]
  parseConfig.rows = transformArrayToEntries(jsonArray.value)
  const { oldF, newF, rows, finalF, groupJson } = parseConfig
  const parseExcel = new Gen(oldF, newF, rows, finalF, groupJson)
  parseExcel.genOriginJsonData(rows)
  if (dataLog.value) {
    console.log('parseConfig:', parseConfig)
    console.log('originJsonData:', parseExcel.getOriginJsonData())
  }
  if (showEditor2.value) {
    parseConfig.rows = parseExcel.getRows()
    // eslint-disable-next-line no-eval,no-new-func
    const handleFn = new Function('parseConfig', editorBox2.value.getCodeContent())
    const handleJsonData = handleFn(parseConfig)
    parseExcel.setHandleJsonData(handleJsonData)
    if (dataLog.value) {
      console.log('handle rows:', parseConfig.rows)
      console.log('handleJsonData:', handleJsonData)
    }
  }
  parseExcel.genJson().then(res => {
    createAndDownloadFile(`${genFileName.value}.json`, res)
  }).catch(e => {
    console.log('excelToJson err:', e)
  })
}
</script>

<style scoped lang="scss">
@import "../styles/js-run";
@import "../styles/js-document";
</style>
