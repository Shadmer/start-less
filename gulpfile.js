var gulp     = require('gulp'),
less         = require('gulp-less'),
browserSync  = require('browser-sync'),
concat       = require('gulp-concat'),
uglify       = require('gulp-uglifyjs'),
cssnano      = require('gulp-cssnano'),
rename       = require('gulp-rename'),
del          = require('del'),
autoprefixer = require('gulp-autoprefixer'),
gcmq         = require('gulp-group-css-media-queries'),
imagemin     = require('gulp-imagemin'),
pngquant     = require('imagemin-pngquant'),
cache        = require('gulp-cache'),
spritesmith  = require('gulp.spritesmith'),
notify       = require('gulp-notify'),
plumber      = require('gulp-plumber');


//Сборка less
gulp.task('less', function() {
  return gulp.src('src/less/style.less')
  .pipe(plumber({
    errorHandler: notify.onError(function(err) {
      return {
        title: 'Styles',
        message: err.message
      };
    })
  }))
  .pipe(less())
  .pipe(gcmq())
  .pipe(autoprefixer(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], { cascade: true }))
  .pipe(cssnano())
  .pipe(gulp.dest('src/css/'))
  .pipe(browserSync.reload({stream: true}))
});


//Автоматическое обновление страниц с browser-sync
gulp.task('browser-sync', function() {
  browserSync({
    server: {
      baseDir: 'src'
    },
    notify: false
  });
});


//Оптимизация изображений
gulp.task('img', function() {
  return gulp.src('src/img/**/*')
  .pipe(cache(imagemin({
    interlaced: true,
    progressive: true,
    svgoPlugins: [{removeViewBox: false}],
    use: [pngquant()]
  })))
  .pipe(gulp.dest('dist/img'));
});


//Оптимизация js
gulp.task('scripts', function() {
  return gulp.src([
    'src/libs/jquery/dist/jquery.min.js',
    'src/libs/magnific-popup/dist/jquery.magnific-popup.min.js'
    ])
  .pipe(concat('libs.min.js'))
  .pipe(uglify())
  .pipe(gulp.dest('src/js'));
});


//Минификация css библиотек
gulp.task('css-libs', ['less'], function() {
  return gulp.src('src/css/libs.css')
  .pipe(cssnano())
  .pipe(rename({suffix: '.min'}))
  .pipe(gulp.dest('src/css'));
});


//Команда по умолчанию
gulp.task('default', ['browser-sync', 'css-libs', 'scripts'], function() {
  gulp.watch('src/less/**/*.less', ['less']);
  gulp.watch('src/*.html', browserSync.reload);
  gulp.watch('src/js/**/*.js', browserSync.reload);
});


//Удаление проекта
gulp.task('clean', function() {
  return del.sync('dist');
});


//Сборка проекта
gulp.task('build', ['clean', 'img', 'less', 'scripts'], function() {

  var buildCss = gulp.src([
    'src/css/style.css',
    'src/css/libs.min.css',
    ])
  .pipe(gulp.dest('dist/css'))

  var buildFonts = gulp.src('src/fonts/**/*')
  .pipe(gulp.dest('dist/fonts'))

  var buildJs = gulp.src('src/js/**/*')
  .pipe(gulp.dest('dist/js'))

  var buildHtml = gulp.src('src/*.html')
  .pipe(gulp.dest('dist'));
});


//Кэширование
gulp.task('clear', function() {
  return cache.clearAll();
});


// Генерация спрайтов
gulp.task('sprite', function() {
  var spriteData =
  gulp.src('src/img/sprite/*.*')
  .pipe(spritesmith({
    imgName: 'sprite.png',
    cssName: 'sprite.less',
    cssFormat: 'less',
    algorithm: 'binary-tree',
    padding: 1,
    cssTemplate: 'less.template.mustache',
    cssVarMap: function(sprite) {
      sprite.name = 's-' + sprite.name
    }
  }));

  spriteData.img.pipe(gulp.dest('src/img/'));
  spriteData.css.pipe(gulp.dest('src/less/global/'));
});
