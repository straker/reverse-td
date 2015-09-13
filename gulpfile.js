var gulp = require('gulp');
var concat = require('gulp-concat');
var connect = require('gulp-connect');
var jshint = require('gulp-jshint');
var rename = require('gulp-rename');
var size = require('gulp-size');
var uglify = require('gulp-uglify');
var addsrc = require('gulp-add-src');
var zip = require('gulp-zip');
var htmlmin = require('gulp-htmlmin');
var micro = require('gulp-micro');
var stylus = require('gulp-stylus');
var minifyCss = require('gulp-minify-css');

function swallowError(error) {
  // print error so we know that uglify task didn't complete
  console.log(error.toString());

  this.emit('end');
}

gulp.task('lint', function() {
  return gulp.src('src/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter( 'jshint-stylish' ))
});

gulp.task('scripts', function() {
  return gulp.src(['src/*.js', '!src/{game,kontra.build,wrapper}.js'])
    .pipe(addsrc.prepend(['src/wrapper.js','src/kontra.build.js']))
    .pipe(addsrc.append('src/game.js'))
    .pipe(concat('build.js'))
    .pipe(gulp.dest('.'))
    .pipe(uglify())
    .on('error', swallowError)  // prevent uglify task from crashing watch on error
    .pipe(gulp.dest('dist'))
    .pipe(connect.reload());
});

gulp.task('stylus', function() {
  return gulp.src('styles.styl')
    .pipe(stylus())
    .pipe(gulp.dest('.'))
    .pipe(minifyCss())
    .pipe(gulp.dest('dist'))
    .pipe(connect.reload());
})

gulp.task('html', function() {
  return gulp.src('index.html')
    .pipe(htmlmin({
      collapseWhitespace: true,
      removeAttributeQuotes: true,
      removeComments: true,
      minifyCSS: true
    }))
    .pipe(gulp.dest('dist'))
    .pipe(connect.reload());
});

gulp.task('build', function() {
  return gulp.src(['dist/**/*.*'])
    .pipe(zip('archive.zip'))
    .pipe(size())
    .pipe(micro({limit: 13 * 1024}))
    .pipe(gulp.dest('build'));
});

gulp.task('connect', function() {
  connect.server({
    livereload: true
  });
});

gulp.task('watch', function() {
  gulp.watch('src/*.js', ['lint', 'scripts', 'build']);
  gulp.watch('index.html', ['html', 'build']);
  gulp.watch('styles.styl', ['stylus', 'build']);
});

gulp.task('default', ['lint', 'scripts', 'stylus', 'html', 'build', 'connect', 'watch']);