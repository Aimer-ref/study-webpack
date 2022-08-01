const fs = require('fs')
const path = require('path')
const parser = require("@babel/parser")
const { config } = require('process')
const traverse = require('@babel/traverse').default
const generate = require('@babel/generator').default
module.exports = class Compiler {
  constructor() {
    /** 获取当前命令所在的路径, 也就是当前项目的根路径 */
    this.root = process.cwd();
    /** 保存着最后的module依赖关系 */
    this.modules = {}
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
    /** 读取项目中的 webpack.config.js */
    this.config = require(path.join(this.root, './webpack.config.js'))
    const entry = this.config.entry
    // 从入口文件开始分析依赖
    this._depAnalysis(path.join(this.root, entry))
    console.log(this.modules)
  }
}