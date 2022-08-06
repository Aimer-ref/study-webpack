const fs = require('fs')
const path = require('path')
const parser = require("@babel/parser")
const traverse = require('@babel/traverse').default
const generate = require('@babel/generator').default
let ejs = require('ejs')
module.exports = class Compiler {
  constructor() {
    /** 获取当前命令所在的路径, 也就是当前项目的根路径 */
    this.root = process.cwd();
    /** 保存着最后的module依赖关系 */
    this.modules = {}
    /** 保存webpack配置 */
    this.config = {}
  }

  /** 生成最后的打包文件 */
  _bundle () {
    const template = this._getSourceFile(path.join(__dirname, './Template.ejs'));
    const code = ejs.render(template, {
      modules: this.modules,
      entry: this.config.entry
    })
    const filenamePath = path.join(this.config.output.path, this.config.output.filename || 'index.js')
    if (!fs.existsSync(filenamePath)) {
      fs.mkdirSync(this.config.output.path, { recursive: true })
    }
    fs.writeFileSync(filenamePath, code)
  }

  /** 依赖分析 */
  _depAnalysis (modulePath) {
    const file = this._getSourceFile(modulePath)
    // 生成ast
    const ast = parser.parse(file)
    traverse(ast, {
      CallExpression: (p) => {
        // 如果有require 则需要替换成 __custom_require__
        if (p.node.callee.name === 'require') {
          p.node.callee.name = '__custom_require__';
          // 获取到require引用的路径 例如 require('./home.js') => ./home.js
          let depFilePath = p.node.arguments[0].value
          // 首先获取当前文件所在的目录
          const dirname = path.relative(this.root, path.dirname(modulePath))
          // 依赖关系的key中需要 './src/**/*.js'的格式 所以需要拼接
          depFilePath = './' + path.join(dirname, depFilePath);
          p.node.arguments[0].value = depFilePath
          this._depAnalysis(path.join(this.root, depFilePath))
        }
      }
    })
    const { code } = generate(ast)
    const relativePath = './' + path.relative(this.root, modulePath)
    this.modules[relativePath] = code;
  }

  /** 获取文件 绝对路径*/
  _getSourceFile (filePath) {
    return fs.readFileSync(filePath, {  encoding: 'utf-8' })
  }

  /** 开始打包📦 */
  start () {
    console.time('📦custom-pack compiled \x1b[46msuccessfully\x1b[0m')
    /** 读取项目中的 webpack.config.js */
    this.config = require(path.join(this.root, './webpack.config.js'))
    const entry = this.config.entry
    // 从入口文件开始分析依赖
    this._depAnalysis(path.join(this.root, entry))
    // 执行打包
    this._bundle()
    console.timeEnd('📦custom-pack compiled \x1b[46msuccessfully\x1b[0m')
  }
}