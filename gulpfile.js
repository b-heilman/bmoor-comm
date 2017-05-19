var $ = require('gulp-load-plugins')(),
	gulp = require('gulp'),
	map = require('map-stream'),
	webpack = require('webpack-stream'),
	karma = require('gulp-karma'),
	jshint = require('gulp-jshint'),
	stylish = require('jshint-stylish');

var env = require('./config/env.js');

var server;

gulp.task('demo', function() {
	return gulp.src(env.jsSrc)
		.pipe(webpack({
			entry: './'+env.demoConfig,
			module: {
				loaders: [{
					test: /\.js$/,
					loader: "babel-loader",
					query: {
    					presets: ['es2015']
  					}
				}],
			},
			output: {
				filename: 'demo.js',
				library: env.library,
				libraryTarget: "var"
			}
		}))
		.pipe(gulp.dest(env.demoDir));
});

gulp.task('library', function() {
	return gulp.src(env.jsDemo)
		.pipe(webpack({
			entry: './'+env.libraryConfig,
			module: {
				loaders: [{
					test: /\.js$/,
					loader: "babel-loader",
					query: {
    				presets: ['es2015']
  				}
				}],
			},
			output: {
				filename: env.name+'.js',
				library: env.library,
				libraryTarget: "var"
			},
			externals: env.externals
		}))
		.pipe(gulp.dest(env.distDir));
});

gulp.task('test-server', function(){
	server = require('./test/server.js');

	return server.start( 10001 );
});

gulp.task('test', ['build','test-server'], function( done ) {
	var t = gulp.src('aaa')
		.pipe(karma({
			configFile: env.karmaConfig,
			action: 'run'
		}));

	t.on('error', function(err) {
		throw err;
	});

	t.on('close',function(){
		server.close();
	});

	return t;
});

var failOnError = function() {
    return map(function(file, cb) {
        if (!file.jshint.success) {
            process.exit(1);
        }
        cb(null, file);
    });
};

gulp.task('build-lint', function() {
    gulp.src( env.jsSrc )
        .pipe( jshint() )
        .pipe( jshint.reporter(stylish) )
        .pipe( failOnError() );
});

gulp.task('lint', function() {
    gulp.src( env.jsSrc )
        .pipe( jshint() )
        .pipe( jshint.reporter(stylish) );
});

gulp.task('build', ['build-lint', 'demo','library'] );

gulp.task('watch', ['build'], function(){
	gulp.watch(env.jsSrc.concat(['./'+env.demoConfig]), ['lint', 'demo','library']);
});

gulp.task('serve', ['watch','test-server'], function() {
	gulp.src(env.demoDir)
		.pipe($.webserver({
			port: 9000,
			host: 'localhost',
			fallback: 'index.html',
			livereload: true,
			open: true
		}))
});

