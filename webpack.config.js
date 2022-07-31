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
  devServer: {
    open: true,
    port: 8000,
    // 不会每次都重新从内存中生成一份bundle.js 而是类似于打补丁的方式
    hot: true,
    // 本地服务器根路径 在html中路径 /开头 都是以这个目录为基准
    static: path.resolve('./public')
  }
}
module.exports = config