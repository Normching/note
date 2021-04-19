const fs = require('fs')
const path = require('path')
const chokidar = require('chokidar')
// const glob = require('glob')
const shelljs = require('shelljs')

class AutoDiscovery {
  constructor(options = {}) {
    // import 的路径前缀
    this.prefix = options.prefix || '../'
    if (this.prefix.lastIndexOf('/') === -1) {
      this.prefix += '/'
    }
    // 扫描目录
    this.directory = options.directory || `src/views`
    // 资源信息文件存放路径
    this.versionFilePath = options.versionFilePath || `src/versionInfo.js`
  }

  apply(compiler) {
    compiler.hooks.afterPlugins.tap('AutoDiscovery', () => {
      this.writVersionFile()
      console.log('版本信息文件生成成功')
      if (process.env.NODE_ENV === 'development') {
        const watcher = chokidar.watch(path.resolve(this.directory), {
          ignored: /(^|[\/\\])\../,
          persistent: true
        })

        watcher.on('change', () => {
          // const allData = this.parseRouteData()
          this.writVersionFile()
          console.log('版本信息文件生成成功')
        })
      }
    })
  }

  writVersionFile() {
    if (!fs.existsSync(path.resolve(this.versionFilePath, '..'))) {
      shelljs.mkdir('-p', path.resolve(this.versionFilePath, '..'))
    }
    const timestamp = new Date().getTime().toString()
    const writeData = `export default { version: ${timestamp} }
    `

    fs.writeFileSync(path.resolve(this.versionFilePath), writeData)
  }
}

module.exports = AutoDiscovery
