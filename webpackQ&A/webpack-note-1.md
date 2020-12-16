## 0.有哪些常见的Loader？用过哪些Loader？
- `raw-loader`：加载文件原始内容（utf-8）
- `file-loader`：把文件输出到一个文件夹中，在代码中通过相对URL去引用输出的文件（处理图片和字体）
- `url-loader`：与file-loader类似，区别是用户可以设置一个阈值，大于阈值会交给file-loader处理，小于阈值时返回文件base64形式代码（处理图片和字体）
- `source-map-loader`：加载额外的Source Map文件，以方便断点调试
- `svg-inline-loader`：将压缩后的SVG内容注入代码中
- `image-loader`：加载并且压缩图片文件
- `json-loader`：加载JSON文件（默认包含）
- `handlebars-loader`：将Handlebars模板编译成函数并返回
- `babel-loader`：把ES6转换成ES5
- `ts-loader`：将TypeScript转换成JavaScript
- `awesome-typescript-loader`：将TypeScript转换成JavaScript，性能优于ts-loader
- `sass-loader`：将SCSS/SASS代码转换成CSS
- `css-loader`：加载CSS，支持模块化、压缩、文件导入等特性
- `style-loader`：把CSS代码注入到JavaScript中，通过DOM操作去加载CSS
- `postcss-loader`：扩展CSS语法，使用下一代CSS，可以配合autoprefixer插件自动补齐CSS3前缀
- `eslint-loader`：通过ESLint检查JavaScript代码
- `tslint-loader`：通过TSLint检查TypeScript代码
- `mocha-loader`：加载Mocha测试用例的代码
- `coverjs-loader`：计算测试的覆盖率
- `vue-loader`：加载Vue.js单文件组件
- `i18n-loader`：国际化
- `cache-loader`：可以在一些性能开销比较大的Loader之前添加，目的是将结果缓存到磁盘里

## 1.有哪些常见的Plugin？用过哪些Plugin？
- `define-plugin`：定义环境变量（Webpack4之后指定mode会自动配置）
- `ignore-plugin`：忽略部分文件
- `html-webpack-plugin`：简化HTML文件创建（依赖于html-loader）
- `web-webpack-plugin`：可方便地为单页面应用输出HTML，比html-webpack-plugin好用
- `uglifyjs-webpack-plugin`：不支持ES6压缩（Webpack4以前）
- `terser-webpack-plugin`：支持压缩ES6（Webpack4）
- `webpack-parallel-uglify-plugin`：多进程执行代码压缩，提升构建速度
- `mini-css-extract-plugin`：分离样式文件，CSS提取为独立文件，支持按需加载（替代extract-text-webpack-plugin）
- `serviceworker-webpack-plugin`：为网页应用增加离线缓存功能
- `clean-webpack-plugin`：目录清理
- `ModuleConcatenationPlugin`：开启Scope Hoisting
- `speed-measure-webpack-plugin`：可以看到每个Loader和Plugin执行耗时（整个打包耗时、每个Plugin和Loader耗时）
- `webpack-bundle-analyzer`： 可视化Webpack输出文件的体积（业务组件、依赖第三方模块）

## 2.Loader和Plugin的区别
`Loader`本质就是一个函数，在该函数中对接收到的内容进行转换，返回转换后的结果。因为Webpack只认识JavaScript，所以Loader就成了翻译官，对其他类型的资源进行转译的预处理。

`Plugin`就是插件，基于事件流框架`Tapable`，插件可以扩展Webpack的功能，在Webpack运行的生命周期中会广播出许多事件，Plugin可以监听这些事件，在合适的时机通过Webpack提供的API改变输出结果。

`Loader`在module.rules中配置，作为模板的解析规则，类型为数组。每一项都是一个Object，内部包含了test（类型文件）、loader、options（参数）等属性。

`Plugin`在plugins中单独配置，类型为数组，每一项都是一个人Plugin的实例，参数都通过构造函数传入。