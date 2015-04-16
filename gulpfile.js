var gulp        = require('gulp');
var browserSync = require('browser-sync');
var sass        = require('gulp-sass');
var sourcemaps  = require('gulp-sourcemaps');
var prefix      = require('gulp-autoprefixer');
var svgSprite   = require('gulp-svg-sprites');
var svg2png     = require('gulp-svg2png');
var filter      = require('gulp-filter');
var modulizr    = require('gulp-modulizr');
var addSrc     = require('gulp-add-src');
var preprocess  = require('gulp-preprocess');
var cssMin      = require('gulp-minify-css');
var hologram    = require('gulp-hologram');
var jshint      = require('gulp-jshint');
var stylish     = require('jshint-stylish');
var del         = require('del');
var imagemin    = require('gulp-imagemin');
var jpegoptim   = require('imagemin-jpegoptim');
var pngquant    = require('imagemin-pngquant');
var uglify      = require('gulp-uglify');
var concat      = require('gulp-concat');
var fileinclude = require('gulp-file-include');
var ghPages     = require('gulp-gh-pages');
var rename      = require('gulp-rename');
var cache       = require('gulp-cache');
var gulpif      = require('gulp-if');

var env = process.env.NODE_ENV ||  'development';

// Input and output path
var path = {
    dest: './public/',
    src: './source/',
    bower: './bower_components/'
}

// Delete destination folder
gulp.task('clean', function() {
    del([path.dest], function (err) {
        console.log('Files deleted');
    })
});

// Copy root level files and folders
gulp.task('copy-files', function() {
    return gulp.src([
        './CNAME',
        path.bower + 'jquery/dist/jquery.js',
        path.bower + 'fitvids/jquery.fitvids.js'
    ], { base: '.' }) // base keeps original path
        .pipe(gulp.dest( path.dest));
});

// Copy misc assets
gulp.task('copy-assets', function() {
    return gulp.src([
        // path.src + 'fonts/**/*'
    ], { base: path.src }) // base keeps original path
        .pipe(gulp.dest( path.dest + 'assets'));
});

// Markup task
gulp.task('html', function() {
  return gulp.src([path.src + 'html/**/*.html', '!' + path.src + 'html/_includes/**/*.html'])
    .pipe(fileinclude({
      prefix: '@@',
      basepath: path.src + 'html/_includes'
    }))
    .pipe(preprocess()) // Run with $ NODE_ENV=production gulp html
    .pipe(gulp.dest(path.dest))
    .pipe(browserSync.reload({stream:true}));

});

// Image task
gulp.task('img', function () {
    return gulp.src([path.src + 'images/**/*', '!' + path.src + 'images/sprite/export/**/*'])
        .pipe(cache(imagemin({
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [
                pngquant({ quality: '65-80', speed: 4 }),
                jpegoptim({max: 70})
            ]
        })))
        .pipe(gulp.dest(path.dest + 'assets/img'));
});

// Javascript tasks
gulp.task('js', function() {
    return gulp.src([
            path.bower + 'jquery/dist/jquery.js',
            path.bower + 'fitvids/jquery.fitvids.js',
            path.src + 'javascript/vendor/*.js',
            path.src + 'javascript/*.js'
        ])
        .pipe(jshint())
        .pipe(jshint.reporter(stylish))
        .pipe(gulp.dest(path.dest + 'assets/js/'))
        .pipe(concat('all.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest(path.dest + 'assets/js'))
        .pipe(browserSync.reload({stream:true}));
});

// Build custom modernizer script
// Manual task
gulp.task("modernizr", function() {
    return gulp.src("bower_components/modernizr/modernizr.js")
        .pipe(modulizr([
            // Add what you want modernizer to include
            // https://github.com/Modernizr/modernizr.com/blob/gh-pages/i/js/modulizr.js
            "cssclasses",
            "svg",
            "url-data-uri"
        ]))
        .pipe(addSrc([
            "bower_components/modernizr/feature-detects/url-data-uri.js"
        ]))
        .pipe(concat("modernizr.js"))
        .pipe(uglify())
        .pipe(rename({
            suffix: ".min"
        }))
        .pipe(gulp.dest(path.dest + "assets/js"));
});

// Svg task
gulp.task('sprite', ['img'], function() {
    return gulp.src(path.src + 'images/sprite/*.svg')
        .pipe(svgSprite({
            selector: 'icon-%f',
            baseSize: 16,
            padding: 5,
            cssFile: '../../source/sass/modules/_sprite.scss',
            svg: {
                sprite: "img/sprite/export/sprite.svg"
            }
        }))
        .pipe(gulp.dest(path.dest + 'assets'))
        .pipe(filter('**/*.svg'))
        .pipe(svg2png())
        .pipe(gulp.dest(path.dest + 'assets'));
});

// Living styleguide
gulp.task('styleguide', function() {
    return gulp.src('./hologram_config.yml')
        .pipe(hologram({ bundler: true }));
});

// Browser sync task
gulp.task('browser-sync', ['build'], function() {
    browserSync({
        server: {
            baseDir: 'public'
        }
    });
});

// Sass tasks
gulp.task('sass', function () {
    var sassConfig = {
        errLogToConsole: true
    };

    if (env === 'production') {
        sassConfig.outputStyle = 'compressed';
    }

    return gulp.src(path.src + 'sass/*.scss')
        .pipe(gulpif(env === 'development', sourcemaps.init()))
        .pipe(sass(sassConfig))
        .pipe(prefix(['last 15 versions', '> 1%', 'ie 8'], { cascade: true }))
        .pipe(gulpif(env === 'development', sourcemaps.write()))
        .pipe(gulp.dest(path.dest + 'assets/css'))
        .pipe(browserSync.reload({stream:true}));
});

// Watch task
gulp.task('watch', function () {
    gulp.watch(path.src + 'sass/**/*.scss', ['sass', 'styleguide']);
    gulp.watch(path.src + 'images/sprite/*.svg', ['sprite']);
    gulp.watch(path.src + 'javascript/**/*.js', ['js']);
    gulp.watch(path.src + 'html/**/*.html', ['html'])
});

// Deployment tasks
gulp.task('deploy-gh', function () {
    return gulp.src(path.dest + '**/*')
        .pipe(ghPages({
            cacheDir: './.git-cache'
        }));
});

// Build task
gulp.task('build', ['sass', 'js', 'styleguide', 'img', 'html', 'sprite', 'copy-files', 'copy-assets']);

// Default task
gulp.task('default', ['browser-sync', 'watch']);
