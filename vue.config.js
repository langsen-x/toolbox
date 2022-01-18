const path = require('path')

function resolve(dir) {
  return path.resolve(__dirname, dir)
}

module.exports = {
  lintOnSave: process.env.NODE_ENV !== 'production',
  publicPath: process.env.VUE_APP_PUBLIC_PATH || '/toolbox/',
  outputDir: process.env.VUE_APP_BUILD_OUTPUT || 'dist',
  productionSourceMap: process.env.NODE_ENV !== 'production',

  chainWebpack: (config) => {
    config.resolve.alias
      .set('@module', resolve('src/module'))
      .set('@config', resolve('src/config'))
      .set('@components', resolve('src/components'))
      .set('@api', resolve('src/service/api'))
      .set('@status', resolve('src/service/status'))
      .set('@utils', resolve('src/utils'))
      .set('@assets', resolve('src/assets'))
      .set('@service', resolve('src/service'))
      .set('@views', resolve('src/views'))
      .set('@mixins', resolve('src/mixins'))

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
