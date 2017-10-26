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
  return gulp.src('app/less/style.less')
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
  .pipe(gulp.dest('app/css/'))
  .pipe(browserSync.reload({stream: true}))
});


//Автоматическое обновление страниц с browser-sync
gulp.task('browser-sync', function() {
  browserSync({
    server: {
      baseDir: 'app'
    },
    notify: false
  });
});


//Оптимизация изображений
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


//Оптимизация js
gulp.task('scripts', function() {
  return gulp.src([
    'app/libs/jquery/dist/jquery.min.js',
    'app/libs/magnific-popup/dist/jquery.magnific-popup.min.js'
    ])
  .pipe(concat('libs.min.js'))
  .pipe(uglify())
  .pipe(gulp.dest('app/js'));
});


//Минификация css библиотек
gulp.task('css-libs', ['less'], function() {
  return gulp.src('app/css/libs.css')
  .pipe(cssnano())
  .pipe(rename({suffix: '.min'}))
  .pipe(gulp.dest('app/css'));
});


//Команда по умолчанию
gulp.task('default', ['browser-sync', 'css-libs', 'scripts'], function() {
  gulp.watch('app/less/**/*.less', ['less']);
  gulp.watch('app/*.html', browserSync.reload);
  gulp.watch('app/js/**/*.js', browserSync.reload);
});


//Удаление проекта
gulp.task('clean', function() {
  return del.sync('dist');
});


//Сборка проекта
gulp.task('build', ['clean', 'img', 'less', 'scripts'], function() {

  var buildCss = gulp.src([
    'app/css/style.css',
    'app/css/libs.min.css',
    ])
  .pipe(gulp.dest('dist/css'))

  var buildFonts = gulp.src('app/fonts/**/*')
  .pipe(gulp.dest('dist/fonts'))

  var buildJs = gulp.src('app/js/**/*')
  .pipe(gulp.dest('dist/js'))

  var buildHtml = gulp.src('app/*.html')
  .pipe(gulp.dest('dist'));
});


//Кэширование
gulp.task('clear', function() {
  return cache.clearAll();
});


// Генерация спрайтов
gulp.task('sprite', function() {
  var spriteData =
  gulp.src('app/img/sprite/*.*')
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

  spriteData.img.pipe(gulp.dest('app/img/'));
  spriteData.css.pipe(gulp.dest('app/less/global/'));
});
