const { src, dest, series, parallel, watch } = require('gulp')
const del = require('del')
const plugins = require('gulp-load-plugins')()
const bs = require('browser-sync').create()

// 获取文件所在目录
const cwd = process.cwd()
let config = {
    build: {
        src: 'src',
        build: 'build',
        temp: 'temp',
        public: 'public',
        paths: {
            styles: 'assets/styles/**/*.css',
            js: 'assets/styles/**/*.js',
            images: 'assets/images/**'
            fonts: 'assets/fonts/**'
            page: 'public/*.html'
        }
    },
}
try {
    const loadConfig = require(`${cwd}/vue.config.js`)
    config = Object.assign({}, config, loadConfig)
} catch (e) {}

const html = () => {
    return src(config.build.paths.page)
    .pipe(plugins.data(config))
    .pipe(plugins.swig({defaults: { cache: false }}))
    .pipe(dest('temp'))
    .pipe(bs.reload({stream: true}))
}

const css = () => {
    return src(config.build.paths.styles, {base: config.build.src, cwd: config.build.src})
    .pipe(plugins.cleanCss())
    .pipe(dest('temp'))
    .pipe(bs.reload({stream: true}))
}

const js = () => {
    return src(config.build.paths.js,{base: config.build.src, cwd: config.build.src})
    .pipe(plugins.babel({presets: [require('@babel/preset-env')]}))
    // babel函数参数为空不做转换
    .pipe(dest('temp'))
    .pipe(bs.reload({stream: true}))
}

// image,font任务在开发阶段，更改后不需要执行，不需要放到临时temp目录。
const image = () => {
    return src(config.build.paths.images,{base: config.build.src + '/assets', cwd: config.build.src + '/assets'})
    .pipe(plugins.imagemin())
    .pipe(dest('dist'))
}

const font = () => {
    return src(config.build.paths.fonts,{base: config.build.src + '/assets', cwd: config.build.src + '/assets'})
    .pipe(plugins.imagemin())
    .pipe(dest('dist'))
}

const clean = () => {
    return del (['dist', 'temp'])
}

const useref = () => {
    return src('temp/*.html',{base: 'temp'})
    .pipe(plugins.useref({searchPath: ['temp','.']}))
    .pipe(plugins.if(/\.js$/,plugins.uglify()))
    .pipe(plugins.if(/\.css$/,plugins.cleanCss()))
    .pipe(plugins.if(/\.html$/,plugins.htmlmin()))
    .pipe(dest('dist'))
}

const serve = () => {
    // 监视xx文件改动，启动xx任务
    watch(config.build.paths.page,html)
    watch(config.build.paths.styles,css)

    watch([
        config.build.paths.images,
        config.build.paths.fonts,
        'public/**'
    ],bs.reload)

    bs.init({
        // notify: false,
        port: 9070,
        server: {
            baseDir: ['temp', 'src', 'public'],
            // routes: {
            //     '/node_modules': 'node_modules'
            // }
        }
    })
}

const compile = parallel(html, css, js)

const build = series(clean, parallel(series(compile, useref), image, font))

const dev = series(clean, compile, serve)

module.exports = {
    clean,
    build,
    dev
}