'use strict';
var   gulp          = require('gulp'),
      sass          = require('gulp-sass'),
      scss          = require('gulp-scss'),
      browserSync   = require('browser-sync'),
      concat        = require('gulp-concat'),
      uglify        = require('gulp-uglifyjs'),
      cssnano       = require('gulp-cssnano'),
      rename        = require('gulp-rename'),
      del           = require('del'),
      imagemin      = require('gulp-imagemin'), // Подключаем библиотеку для работы с изображениями
      pngquant      = require('imagemin-pngquant'), // Подключаем библиотеку для работы с png
      cache         = require('gulp-cache'), // Подключаем библиотеку кеширования
      autoprefixer  = require('gulp-autoprefixer'),// Подключаем библиотеку для автоматического
      debug         = require('gulp-debug'),
      sourcemap     = require('gulp-sourcemaps'),
      gulpif        = require('gulp-if'),
      rigger        = require('gulp-rigger'),
      isDevelopment = true;

var pathAll = {
    dist: {
        html: 'dist/',
        js: 'dist/js/',
        css: 'dist/css/',
        img: 'dist/img/',
        fonts: 'dist/fonts/'
    },
    app:{
        html: 'app/',
        js: 'app/js/',
        css: 'app/css/',
        img: 'app/img/',
        fonts: 'app/fonts/',
        scss: 'app/style/',
        libs: 'app/libs/'
    },
    watch: {
        html: 'app/**/*.html',
        js: 'app/js/**/*.js',
        style: 'app/style/**/*.scss',
        img: 'app/img/**/*.*',
        css: 'app/css/**/*.*',
        fonts: 'app/fonts/**/*.*'
    },
    clean: './build'
};

gulp.task('default', ['watch']);
gulp.task('clear', function () {
    return cache.clearAll();
});
gulp.task('sass', function () {
    return gulp.src('app/style/*.{sass,scss,less}')
        .pipe(gulpif(isDevelopment, sourcemap.init()))
        .pipe(sass())
        .pipe(autoprefixer(['last 15 versions', '> 1%','ie 9', 'ie 8', 'ie 7','safari 5', 'opera 12.1', 'ios 6', 'android 4'], {cascade: true}))
        .pipe(gulpif(isDevelopment, sourcemap.write('.')))
        .pipe(gulp.dest('app/css'))
        .pipe(browserSync.reload({stream: true}))
        });
gulp.task('css-libs', ['sass'], function() {
    return gulp.src('app/css/libs.css')
        .pipe(cssnano())
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest('app/css'));
});
gulp.task('scripts', function() {
    return gulp.src('app/libs/main.js')
        .pipe(rigger())
        .pipe(uglify())
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest('app/js'));
});
gulp.task('browser-sync', function() {
    browserSync({
        server: {
            baseDir: 'app'
        },
        notify: false
    });
});
gulp.task('cleanapp', function() {
    return del(['app/css','app/js']);
});
gulp.task('watch', ['browser-sync', 'css-libs', 'scripts'], function() {
    gulp.watch('app/style/**/*.scss', ['sass']);
    gulp.watch('app/**/*.html', browserSync.reload);
    gulp.watch('app/js/**/*.js', browserSync.reload);
    gulp.watch('app/libs/*.js', browserSync.reload);

});
gulp.task('clean', function() {
    return del.sync('dist');
});
gulp.task('img', function() {
    return gulp.src('app/img/**/*')
        .pipe(cache(imagemin({
            interlaced: true,
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()]
        })))
        .pipe(gulp.dest('dist/img'));
});
gulp.task('build', ['clean', 'img', 'sass', 'scripts'], function() {

    var buildCss = gulp.src('app/css/*.css')
        .pipe(gulp.dest('dist/css'));

    var buildFonts = gulp.src('app/fonts/**/*')
        .pipe(gulp.dest('dist/fonts'));

    var buildJs = gulp.src('app/js/**/*')
        .pipe(gulp.dest('dist/js'));

    var buildHtml = gulp.src('app/*.html')
        .pipe(gulp.dest('dist'));

});
