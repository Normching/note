v3

```javascript
const path = require('path')
const CompressionPlugin = require('compression-webpack-plugin')
const TerserPlugin = require('terser-webpack-plugin') // 引入删除console插件

function resolve(dir) {
  return path.join(__dirname, dir)
}

module.exports = {
  publicPath: process.env.VUE_APP_BUILD_PATH, // 打包后的文件地址
  outputDir: process.env.VUE_APP_FILE_Name, // 打包的文件夹名字
  assetsDir: 'static',
  // 打包gzip
  configureWebpack: config => {
    if (process.env.NODE_ENV === 'production') {
      return {
        optimization: {
          splitChunks: {
            cacheGroups: { // 这里开始设置缓存的 chunks
              vendor: { // 入口名称
                chunks: 'initial',
                test: /vant/,
                name: 'vendors-vant' // 要缓存的 分隔出来的 chunk 名称
              }
            }
          },
          minimizer: [
            new TerserPlugin({
              terserOptions: {
                ecma: undefined,
                warnings: false, // 传递true以在中返回压缩机警告result.warnings。使用该值可"verbose"获取更详细的警告。
                parse: {},
                compress: {
                  drop_console: true, // 移除console
                  drop_debugger: true, // 移除debugger
                  pure_funcs: ['console.log'] // 移除console
                }
              }
            })
          ]
        },
        plugins: [
          new CompressionPlugin({
            test: /\.js$|\.html$|\.css$/,
            // 超过10k才压缩
            threshold: 10240,
            // 是否删除源文件
            deleteOriginalAssets: false
          })
        ]
      }
    }
  },

  filenameHashing: true,
  // eslint-loader 是否在保存的时候检查
  lintOnSave: true,
  // 是否使用包含运行时编译器的Vue核心的构建
  runtimeCompiler: false,
  // 默认情况下 babel-loader 忽略其中的所有文件 node_modules
  transpileDependencies: [],
  // 生产环境 sourceMap,打包时不生成.map文件 避免看到源码
  productionSourceMap: false,
  chainWebpack: config => {
    const types = ['vue-modules', 'vue', 'normal-modules', 'normal']
    types.forEach(type =>
      addStyleResource(config.module.rule('less').oneOf(type))
    )
    config.resolve.alias
      .set('@', resolve('src'))
      .set('imgs', resolve('src/assets/imgs'))
      .set('components', resolve('src/components'))
      .set('pageComponents', resolve('src/pageComponents'))
      .set('http', resolve('src/http'))
      .set('utils', resolve('src/utils'))
      .set('views', resolve('src/views'))
  },
  // 配置高于chainWebpack中关于 css loader 的配置
  css: {
    // 默认情况下，只有 *.module.[ext] 结尾的文件才会被视作 CSS Modules 模块。设置为 false 后你就可以去掉文件名中的 .module 并将所有的 *.(css|scss|sass|less|styl(us)?) 文件视为 CSS Modules 模块。
    requireModuleExtension: true,
    // 是否使用 css 分离插件 ExtractTextPlugin，采用独立样式文件载入，不采用 <style> 方式内联至 html 文件中 设置为true的话修改样式不会立即生效
    extract: false,
    // 是否构建样式地图，false 将提高构建速度
    sourceMap: false,
    loaderOptions: {
      less: {
        javascriptEnabled: true
      }
    }
  },
  devServer: {
    open: false, // 运行项目时自动启动浏览器,
    port: 777, // 端口号
    https: false,
    hot: true, // 模块热替换(HMR - hot module replacement)功能会在应用程序运行过程中，替换、添加或删除 模块，而无需重新加载整个页面。主要是通过以下几种方式，来显著加快开发速度
    hotOnly: false, // hot 和 hotOnly 的区别是在某些模块不支持热更新的情况下，前者会自动刷新页面，后者不会刷新页面，而是在控制台输出热更新失败
    overlay: {
      warnings: false, // 当出现编译器错误或警告时，在浏览器中显示全屏覆盖层,如果想要显示警告和错误
      errors: true
    },
    // 设置代理
    proxy: {
      '/api/uduhs-scada': {
        target: '', // 地址
        changeOrigin: true,
        secure: false,
        ws: true,
        pathRewrite: {
          '^/api/uduhs-scada': '/uduhs-scada'
        }
      },
      '/api': {
        target: '', // 地址
        changeOrigin: true,
        secure: false, // 如果是https接口，需要配置这个参数
        ws: true,
        pathRewrite: { // 表示的意思是把/api 替换为空，用在如果你的实际请求地址没有api的情况)
          '^/api': ''
        }
      },
      '/foo': {
        target: '<other_url>'
      }
    },
    before: app => { }
  },
  // 构建时开启多进程处理 babel 编译
  parallel: require('os').cpus().length > 1,
  pwa: {},
  // 第三方插件配置
  pluginOptions: {}
}

function addStyleResource(rule) {
  rule
    .use('style-resource')
    .loader('style-resources-loader')
    .options({
      patterns: [
        path.resolve(__dirname, 'src/assets/css/styles/global.less') // 需要全局导入的less
      ]
    })
}
```



.postcssrc.js

```javascript
module.exports = {
  plugins: {
    "postcss-import": {},
    "postcss-url": {},
    "postcss-aspect-ratio-mini": {},
    "postcss-write-svg": {
      utf8: false
    },
    'postcss-px-to-viewport': {
      unitToConvert: "px",
      viewportWidth: 750, // 视窗的宽度，对应的是我们设计稿的宽度，一般是750
      viewportHeight: 1334, // 视窗的高度，根据750设备的宽度来指定，一般指定1334，也可以不配置
      unitPrecision: 3, // 指定`px`转换为视窗单位值的小数位数（很多时候无法整除）
      viewportUnit: 'vw', // 指定需要转换成的视窗单位，建议使用vw
      fontViewportUnit: "vw",
      selectorBlackList: ['.ig-'],  // <div class=".ig-"></div> 指定不转换为视窗单位的类，在该类型名下写不会转换为vw，可以无限添加,建议定义一至两个通用的类名
      minPixelValue: 1, // 小于或等于`1px`不转换为视窗单位，你也可以设置为你想要的值
      mediaQuery: false, // 允许在媒体查询中转换`px`
      replace: true,
      exclude: /(\/|\\)(node_modules)(\/|\\)/
    },
    // "postcss-viewport-units":{},
    'postcss-viewport-units': {
      filterRule: rule => rule.selector.includes('::after') && rule.selector.includes('::before')
    },
    "cssnano": {
      "cssnano-preset-advanced": {
        zindex: false,
        autoprefixer: false
      },
    }
  }
}
```

