<template>
  <div class="monaco-container">
    <div v-if="colBtn">
      <el-select v-model="editorTheme" placeholder="设置主题" @change="handleTheme">
        <el-option label="Visual Studio Dark" value="vs-dark"></el-option>
        <el-option label="Visual Studio" value="vs"></el-option>
        <el-option label="High Contrast Dark" value="hc-black"></el-option>
      </el-select>
      <el-select v-model="editorLanguage" placeholder="选择语言" @change="handleLanguage">
        <el-option
          v-for="(option, idx) in languageOptions"
          :key="idx"
          :label="option"
          :value="option">
        </el-option>
      </el-select>
    </div>
    <div :id="editorId" class="edit-box"></div>
  </div>
</template>

<script setup>
import { onMounted, ref, toRaw } from 'vue'
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api.js'
import 'monaco-editor/esm/vs/editor/editor.main.js'
import 'monaco-editor/esm/vs/editor/editor.worker.js'
// 代码高亮
import 'monaco-editor/esm/vs/basic-languages/javascript/javascript.contribution'
import 'monaco-editor/esm/vs/basic-languages/java/java.contribution'
import 'monaco-editor/esm/vs/basic-languages/python/python.contribution'
import 'monaco-editor/esm/vs/basic-languages/html/html.contribution'
import 'monaco-editor/esm/vs/basic-languages/scss/scss.contribution'
import 'monaco-editor/esm/vs/basic-languages/css/css.contribution'
import 'monaco-editor/esm/vs/basic-languages/sql/sql.contribution'
import 'monaco-editor/esm/vs/language/json/json.worker'
// 引入查找控件
import 'monaco-editor/esm/vs/editor/contrib/find/findController.js'

// eslint-disable-next-line no-undef
const emits = defineEmits(['clear'])

// eslint-disable-next-line no-undef
const props = defineProps({
  editorId: {
    type: String,
  },
  colBtn: {
    type: Boolean,
    default: false,
  },
  readOnly: {
    type: Boolean,
    default: false,
  },
  language: {
    type: String,
    default: 'javascript',
  },
})
onMounted(() => {
  initEditor()
})

const editor = ref(null)
const getCodeContent = () => {
  return toRaw(editor.value).getValue()
}

const setCodeContent = (val) => {
  toRaw(editor.value).setValue(val)
}

const editorTheme = ref('vs-dark')
const handleTheme = () => {
  monaco.editor.setTheme(editorTheme.value)
}

const editorLanguage = ref(props.language)
const languageOptions = ref(['javascript', 'java', 'python', 'html', 'scss', 'css', 'sql'])
const handleLanguage = (item) => {
  editorLanguage.value = item
  monaco.editor.setModelLanguage(toRaw(editor.value).getModel(), editorLanguage.value)
}

const initEditor = () => {
  // 初始化编辑器，确保dom已经渲染
  editor.value = monaco.editor.create(document.getElementById(props.editorId), {
    value: '',
    language: props.language,
    theme: 'vs-dark', // 官方自带三种主题vs, hc-black, or vs-dark
    readOnly: props.readOnly, // 只读
    selectOnLineNumbers: true, // 显示行号
    renderLineHighlight: 'line', // 当前行突出显示方式 'none' | 'gutter' | 'line' | 'all'
    roundedSelection: false, // 选区是否有圆角
    folding: true, // 是否启用代码折叠
    cursorStyle: 'line', // 光标样式
    automaticLayout: true, // 自动布局
    autoClosingQuotes: 'always', // 是否自动添加结束的单引号 双引号 'always' | 'languageDefined' | 'beforeWhitespace' | 'never'
    useTabStops: false,
    fontSize: 16, // 字体大小
    quickSuggestionsDelay: 100, // 代码提示延时
  })
  // 监听值的变化
  editor.value.onDidChangeModelContent((val) => {
    if (!val.changes[0].text) {
      emits('clear')
    }
  })
}

// eslint-disable-next-line no-undef
defineExpose({
  getCodeContent,
  setCodeContent,
})
</script>

<style scoped lang="scss">
.monaco-container {
  display: flex;
  flex-flow: column;
  align-items: flex-start;
  justify-content: flex-start;
}

.edit-box {
  width: 100%;
  height: 100%;
}
</style>
