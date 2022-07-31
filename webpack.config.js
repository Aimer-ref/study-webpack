const path = require('path')
/** @type {import('webpack').Configuration} */
const config = {
  entry: './src/index.js',
  output: {
    // 输出目录必须是绝对路径
    path: path.resolve('dist'),
    filename: 'bundle.js'
  },
  mode: 'development',
}
module.exports = config