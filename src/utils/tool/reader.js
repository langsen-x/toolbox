const axios = require('axios')

export function readSourceCode(sourcePath) {
  const codePath = `/source/${sourcePath}.txt`
  return axios.get(codePath)
}
