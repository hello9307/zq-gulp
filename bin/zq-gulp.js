#!/usr/bin/env node

// 运行命令所在目录为根目录
process.argv.push('--cwd')
process.argv.push(process.cwd())
// 指定gulpfile文件的目录
process.argv.push('--gulpfile')
process.argv.push(require.resolve('..'))
// 这里他会找在上层查找gulpfile文件，但是找不到
// 这时他会指定上层package.json中的main字段定义的地址

require('gulp/bin/gulp')