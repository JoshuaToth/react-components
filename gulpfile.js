const gulp = require('gulp');
const HubRegistry = require('gulp-hub');
const browserSync = require('browser-sync');

const conf = require('./conf/gulp.conf');

// Load some files into the registry

const path = require('path');
const del = require('del');
const mkdirp = require('mkdirp');
const tslint = require("gulp-tslint");
const PACKAGE_PATH = path.resolve(__dirname, 'package.json');
const hub = new HubRegistry([conf.path.tasks('*.js')]);
const gutil = require('gulp-util');
const webpackStream = require('webpack-stream');
const webpack = require('webpack');

const PKG = require(PACKAGE_PATH);
const NAME = PKG.name.replace(new RegExp('^@(.*?)\/'), ''); // remove namespace from project name
const VERSION = PKG.version;
const BUILD_DIR = path.resolve(__dirname, 'build');
const RELEASE_DIR = path.resolve(__dirname, 'release');
const BUILD_E2E_DIR = path.resolve(__dirname, 'build-e2e');
const SRC_DIR = path.resolve(__dirname, 'src');
const TEST_DIR = path.resolve(__dirname, 'test');
const DIST_DIR = path.resolve(__dirname, 'dist');
const DIST_NAME_DIR = path.resolve(DIST_DIR, NAME);
const DIST_LIBS_DIR = path.resolve(DIST_DIR, 'libs', NAME);
const DIST_LIBS_VERSION_DIR = path.resolve(DIST_LIBS_DIR, VERSION);

const WEBPACK_DEFAULT_CONFIG = path.resolve(__dirname, 'webpack.config.js');
const WEBPACK_RELEASE_CONFIG = path.resolve(__dirname, 'webpack.release.config.js');

const SRC_PATH = [path.resolve(SRC_DIR, '**/*.ts'), path.resolve(SRC_DIR, '**/*.js'), path.resolve(SRC_DIR, '**/*.html')];
const ALL_PATH = SRC_PATH;



// Tell gulp to use the tasks just loaded
gulp.registry(hub);

gulp.task('build', gulp.series(gulp.parallel('other', 'webpack:dist')));
gulp.task('test', gulp.series('karma:single-run'));
gulp.task('test:auto', gulp.series('karma:auto-run'));
gulp.task('serve', gulp.series('webpack:watch', 'watch', 'browsersync'));
gulp.task('serve:dist', gulp.series('default', 'browsersync:dist'));
gulp.task('default', gulp.series('clean', 'build'));
gulp.task('watch', watch);

function reloadBrowserSync(cb) {
  browserSync.reload();
  cb();
}

gulp.task('clean', function () {
	return del([BUILD_DIR, RELEASE_DIR, DIST_DIR, BUILD_E2E_DIR])
		.then(function () {
			return Promise.all([
				mkdirp(BUILD_DIR),
				mkdirp(RELEASE_DIR),
				mkdirp(BUILD_E2E_DIR)
			])
		});
});

gulp.task('lint', function () {
	gulp.src(ALL_PATH.filter(function (v) {
		return /\.ts(x?)$/.test(v)
	}))
		.pipe(tslint({
			formatter: "verbose"
		}))
		.pipe(tslint.report())
		.on('error', gutil.log);
});

gulp.task('build:release', gulp.series('clean', function () { // add lint
	return gulp.src(SRC_PATH)
		.pipe(webpackStream(require(WEBPACK_RELEASE_CONFIG), webpack))
		.pipe(gulp.dest(RELEASE_DIR));
}));

gulp.task('build:test', gulp.series('build:release', 'copy:html:clean', function () {
	// Copy release files to build directory
	return gulp.src(path.resolve(RELEASE_DIR, '**/*'))
		.pipe(gulp.dest(BUILD_E2E_DIR))
		.on('error', gutil.log);
}));

gulp.task('package',  gulp.series('build:release', function () {
	return [
		gulp.src(path.resolve(RELEASE_DIR, '**/*'))
			.pipe(gulp.dest(DIST_NAME_DIR))
			.pipe(gulp.dest(DIST_LIBS_DIR))
			.pipe(gulp.dest(DIST_LIBS_VERSION_DIR))
			.on('error', gutil.log),
		gulp.src(PACKAGE_PATH)
			.pipe(gulp.dest(RELEASE_DIR))
      .on('error', gutil.log)
	];
}));

function watch(done) {
  gulp.watch(conf.path.tmp('index.html'), reloadBrowserSync);
  done();
}
