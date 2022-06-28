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
      '@components': resolve('src/components'),
      '@config': resolve('src/config'),
      '@module': resolve('src/module'),
      '@hooks': resolve('src/hooks'),
      '@styles': resolve('src/styles'),
      '@utils': resolve('src/utils'),
      '@views': resolve('src/views'),
    },
  },
}
