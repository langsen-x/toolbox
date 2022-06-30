import axios from 'axios'

export function readSourceCode(sourcePath) {
  const codePath = `./sourceCode/${sourcePath}.rtf`
  return axios.get(codePath)
}
