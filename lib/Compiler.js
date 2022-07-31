const fs = require('fs')
const path = require('path')
module.exports = class Compiler {
  constructor() {
    /** 获取当前命令所在的路径, 也就是当前项目的根路径 */
    this.root = process.cwd();
    /** 保存着最后的module依赖关系 */
    this.modules = {}
  }

  /** 依赖分析 */
  _depAnalysis (modulePath) {
    console.log(modulePath)
  }

  /** 获取文件 */
  _getSourceFile (filePath) {
    return fs.readFileSync(path.join(this.root, filePath), {  encoding: 'utf-8' })
  }

  /** 开始打包📦 */
  start () {
    /** 读取项目中的 webpack.config.js */
    const config = require(path.join(this.root, './webpack.config.js'))
    const entry = config.entry
    // 从入口文件开始分析依赖
    this._depAnalysis(path.join(this.root, entry))
  }
}