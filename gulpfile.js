var gulp = require('gulp');
const gulpSequence = require('gulp-sequence');
var sass = require('gulp-sass');
var browserSync = require('browser-sync').create();
const freemarker = require('gulp-freemarker');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const babel = require('gulp-babel');
var inlinesource = require('gulp-inline-source');
var cleanDest = require('gulp-clean-dest');

gulp.task('server', function () {
	browserSync.init({
		server: {
			baseDir: "./dist",
			index: "index.html",
		},
		port: 5006,
		ui: {
			port: 5001
		},
		host: "0.0.0.0",
		open: false,
	});
	gulp.watch("./src/js/**", ['js-watch']);
	gulp.watch("./src/scss/**", ['scss-watch']);
	gulp.watch("./src/html/*", ['cpHtml-watch']);
});

gulp.task('emailBuilder', function() {
    return gulp.src(['./dist/*.html'])
      .pipe(emailBuilder().build())
      .pipe(gulp.dest('./dist/inlined'));
  });

gulp.task('js-watch', function(cb) {
	gulpSequence('js')(() => {
		browserSync.reload();
		cb();
	});	
});

gulp.task('scss-watch', function(cb) {
	gulpSequence('scss')(() => {
		browserSync.reload();
		cb();
	});	
});

gulp.task('cpHtml-watch', function(cb) {
	gulpSequence('cpHtml')(() => {
		browserSync.reload();
		cb();
	});
});

gulp.task('js', () => {
	return gulp.src('src/js/*.js')
		.pipe(babel({
			presets: ['es2015', 'es2016', 'es2017']
		}))
		.pipe(cleanDest('dist/js'))
		.pipe(gulp.dest('dist/js'))
})

gulp.task('scss', function () {
	const plugins = [
		autoprefixer({ browsers: ['>= 5%'] })
	];
	return gulp.src("src/scss/*.scss")
		.pipe(sass.sync({
			includePaths: require('node-normalize-scss').includePaths
		}))
		.pipe(postcss(plugins))
		.pipe(gulp.dest("dist/css"))
});



// 将模板中的引用inline, 否则编译结果感人
gulp.task('inline', () => {
	return gulp.src('./dist/*.html')
		.pipe(inlinesource({
			compress: false
		}))
		.pipe(gulp.dest('./dist'))
});

gulp.task('inlineHtmlImg', () => {
	return gulp.src('./dist/*.html')
			.pipe(inlineimg({basedir: './dist'}))
			.pipe(gulp.dest('./dist'))
})

gulp.task('clean',
	() => {
		return gulp.src('dist')
			.pipe(cleanDest('dist'))
	}
);

gulp.task('cleanDist', () => {
	return gulp.src('dist/**')
	.pipe(clean())
})

gulp.task('cpTmp', () => {
	return gulp.src('./src/img/*')
		.pipe(gulp.dest('./dist/img'))
});

gulp.task('cpHtml', () => {
	return gulp.src('./src/*.html')
		.pipe(gulp.dest('./dist/'))
});

gulp.task('cpFiles', () => {
	return gulp.src('./src/html/**')
			.pipe(gulp.dest('./dist'))
})

gulp.task('buildDev', gulpSequence('clean', 'cpTmp', ['cpHtml', 'js', 'scss']));
gulp.task('dev', gulpSequence('buildDev', 'server'));
gulp.task('build', gulpSequence('buildDev'));
