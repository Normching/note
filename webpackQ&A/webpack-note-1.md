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

## 3.Webpack构建流程
Webpack的运行流程是一个串行的过程，从启动到结束会依次执行以下流程：
- **初始化参数**：从配置文件和Shell语句中读取与合并参数，得出最终的参数
- **开始编译**：用上一步得到的参数初始化Compiler对象，加载所有配置的插件，执行对象的run方法开始执行编译
- **确定入口**：根据配置中的entry找到所有的入口文件
- **编译模块**：从入口文件出发，调用所有配置的Loader对象对模块进行翻译，再找出该模块依赖的模块，再递归本步骤直到所有入口依赖的文件都经过了本步骤的处理
- **完成模块编译**：在经过第四步使用Loader翻译完所有模块后，得到了每个模块被翻译后的最终内容以及它们之间的依赖关系
- **输出资源**：根据入口和模块之间的依赖关系，组装成一个个包含多个模块的Chunk，再把每个Chunk转换成一个单独的文件加入到输出列表，这一步是可以修改输出内容的最后机会
- **输出完成**：在确定好输出内容后，根据配置确定输出的路径和文件名，把文件内容写入到文件系统

在以上过程中，`Webpack`会在特定的时间点广播出特定的事件，插件在监听到合适的事件后会执行特定的逻辑，并且插件可以调用Webpack提供的API改变Webpack的运行结果。

简单总结
- 初始化：启动构建，读取与合并配置参数，加载Plugin，实例化Compiler
- 编译：从Entry出发，针对每个Module串行调用对应的Loader去翻译文件的内容，再找到该Module依赖的Module，递归地进行编译处理
- 输出：将编译后的Module组合成Chunk，将Chunk转换成文件，输出到文件系统中

## 使用webpack开发时，用过哪些可以提高效率的插件？
- `webpack-dashboard`：可以更友好的展示相关打包信息
- `webpack-merge`：提取公共配置，减少重复配置代码
- `speed-measure-webpack-plugin`：简称SMP，分析出Webpack打包过程中Loader和Plugin的耗时，有助于找到构建过程中的性能瓶颈
- `size-plugin`：监控资源体积变化，尽早发现问题
- `HotModuleReplacementPlugin`：模块热替换

## source map是什么？生产环境怎么用？
`source map`是将编译、打包、压缩后的代码映射回源代码的过程。打包压缩后的代码不具备良好的可读性，想调试源码就需要source map。

map文件只要不打开开发者工具，浏览器是不会加载的。

线上环境一般有三种处理方案：
- `hidden-source-map`：借助第三方错误监控平台Sentry使用
- `nosources-source-map`：只会显示具体行数以及查看源代码的错误栈。安全性比source map高
- `sourcemap`：通过Nginx设置将.map文件只对白名单开放（公司内网）
  
注意：避免在生产中使用`inline`和`eval-`，因为它们会增加`bundle`体积大小，并降低整体性能。

## 6.模块打包原理
Webpack实际上为每个模块创造了一个可以导出和导入的环境，本质上并没有修改代码的执行逻辑，代码执行顺序与模块加载顺序也完全一致。

## 7.文件监听原理
在发现源代码发生变化时，自动重新构建出新的输出文件。

Webpack开启监听模式，有两种方式：
- 启动Webpack命令时，带上`--watch`参数
- 在配置`webpack.config.js`中设置`watch: true`

缺点：每次需要手动刷新浏览器

原理：轮询判断文件的最后编辑时间是否变化，如果某个文件发生了变化，并不会立刻告诉监听者，而是先缓存起来，等`aggregateTimeout`后再执行。
```js
module.export = {
  // 默认false，也就是不开启
  watch: true,
  // 只有开启监听模式时，watchOptions才有意义
  watchOptions: {
    // 默认为空，不监听的文件或者文件夹，支持正则匹配
    ignored: /node_modules/,
    // 监听到变化发生后会等300ms再去执行，默认300ms
    aggregateTimeout: 300,
    // 判断文件是否发生变化是通过不停询问系统指定文件有没有变化实现的，默认每秒问1000次
    poll: 1000
  }
}
```

## 8.Webpack的热更新原理
`Webpack`的热更新又称热替换（`Hot Module Replacement`），缩写`HMR`。这个机制可以做到不用刷新浏览器而将新变更的模块替换掉旧的模块。

HMR的核心就是客户端从服务端拉取更新后的文件，准确的说是 chunk diff（chunk需要更新的部分），实际上WDS与浏览器之间维护了一个`Websocket`，当本地资源发生变化时，WDS会向浏览器推送更新，并带上构建时的hash，让客户端与上一次资源进行对比。客户端对比出差异后会向WDS发送`Ajax`请求来获取更改内容（文件列表、hash），这样客户端就可以再借助这些信息继续向WDS发起`jsonp`请求获取该chunk的增量更新。

后续的部分（拿到增量更新之后如何处理？哪些状态该保留？哪些又需要更新？）由`HotModulePlugin`来完成，提供了相关API以供开发者针对自身场景进行处理，像`react-hot-loader`和`vue-loader`都是借助这些API实现HMR。