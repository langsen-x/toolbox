const path = require('path')
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin')

function resolve(dir) {
  return path.resolve(__dirname, dir)
}

module.exports = {
  lintOnSave: process.env.NODE_ENV !== 'production',
  publicPath: process.env.VUE_APP_PUBLIC_PATH || '/toolbox/',
  outputDir: process.env.VUE_APP_BUILD_OUTPUT || 'dist',
  productionSourceMap: process.env.NODE_ENV !== 'production',

  chainWebpack: (config) => {
    config.plugin('monaco').use(new MonacoWebpackPlugin())
    config.resolve.alias
      .set('@assets', resolve('src/assets'))
      .set('@components', resolve('src/components'))
      .set('@config', resolve('src/config'))
      .set('@module', resolve('src/module'))
      .set('@hooks', resolve('src/hooks'))
      .set('@styles', resolve('src/styles'))
      .set('@utils', resolve('src/utils'))
      .set('@views', resolve('src/views'))

    const oneOfsMap = config.module.rule('scss').oneOfs.store
    oneOfsMap.forEach(item => {
      item
        .use('sass-resources-loader')
        .loader('sass-resources-loader')
        .options({
          // Provide path to the file with resources
          // Or array of paths
          resources: ['./src/App.scss'],
        })
        .end()
    })
  },
}
