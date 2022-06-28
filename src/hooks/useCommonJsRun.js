import { ref } from 'vue'
import { globalProperties } from '@utils/globalProperties'
import clipboard from 'copy-text-to-clipboard'

export const useCommonJsRun = () => {
  const { global } = globalProperties()
  const editorBox = ref()
  const logValue = ref('')

  const logger = console.log
  console.log = function(arg) {
    logger(arg)
    logValue.value += arg + '\n\n'
  }

  const clearCode = () => {
    const {
      setCodeContent,
    } = editorBox.value
    setCodeContent('')
  }

  const lookDemo = (demo) => {
    const {
      setCodeContent,
    } = editorBox.value
    setCodeContent(demo)
  }

  const clearConsole = () => {
    logValue.value = ''
  }

  const copyConsole = () => {
    if (logValue.value) {
      if (clipboard(logValue.value)) {
        global.$message.success('console内容已复制')
      }
    }
  }

  return {
    global,
    editorBox,
    logValue,
    logger,
    clearCode,
    lookDemo,
    clearConsole,
    copyConsole,
  }
}
