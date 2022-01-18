const path = require('path')

function resolve(dir) {
  return path.join(__dirname, dir)
}

module.exports = {
  context: path.resolve(__dirname, './'),
  resolve: {
    extensions: ['.js', '.vue', '.json'],
    alias: {
      '@assets': resolve('src/assets'),
      '@api': resolve('src/service/api'),
      '@components': resolve('src/components'),
      '@config': resolve('src/config'),
      '@module': resolve('src/module'),
      '@mixins': resolve('src/mixins'),
      '@status': resolve('src/service/status'),
      '@service': resolve('src/service'),
      '@utils': resolve('src/utils'),
      '@views': resolve('src/views'),
    },
  },
}
