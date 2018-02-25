let fs = require("fs")
let path = require("path");
let process = require("process");
let mkdirp = require("mkdirp");
let zipFolder = require("zip-folder");
let gulp = require("gulp");
let conf = require("./gulpconf")

let runSequence = require("run-sequence");
let exec = require("gulp-exec");
var size = require('gulp-size');
let plumber = require("gulp-plumber");
let foreach = require("gulp-foreach");
let clean = require("gulp-clean");
let gulpSrcFiles= require("gulp-src-files");

let luaminify = require('gulp-luaminify');
let spritesmith = require('gulp.spritesmith');

let win = process.platform === "win32";

gulp.task("delete-dist", function () {
	return gulp.src("dist", { read: false }).pipe(clean());
});

gulp.task("dist", function () {
	return gulp.src(["./src/**/*.{" + conf["srcExt"] + "}"])
		.pipe(plumber())
		.pipe(size({ showFiles: true }))
		.pipe(gulp.dest("./dist/src"));
});

gulp.task('minify-lua', function () {
	return gulp.src(["./dist/src/**/*.lua"], { base: "." })
	.pipe(plumber())
		.pipe(size({ showFiles: true }))
		.pipe(luaminify())
		.pipe(gulp.dest("."));
});

var animations;
gulp.task("reg-animations", function () {
	animations = [];
	return gulp.src(["./src/**/*.ani.png"], { read: false })
		.pipe(size({ showFiles: true }))
		.pipe(foreach(function (stream, file) {
			let d = path.dirname(file.path).replace(__dirname + "/", "");
			let g = path.win32.basename(file.path).split(/_/)[0];
			console.log(d, g)
			if (animations.length < 1 || animations.indexOf([d, g]) < 0) {
				animations.push([d, g]);
			}
			return stream
		}));
});

gulp.task("merge-animations", ["reg-animations"], function () {
	var subTasks = [];
	animations.forEach(arr => {
		subTasks.push(new Promise(function (resolve, reject) {
			gulp.src([arr[0] + "/" + arr[1] + "_*.ani.png"])
    		.pipe(size({ showFiles: true }))
				.pipe(spritesmith({
					imgName: arr[1] + ".a.png",
					cssName: "dummy.css",
					algorithm: "top-down",
					algorithmOpts: {
						sort: false
					}
				}))
				.on('error', reject)
				.pipe(gulp.dest(arr[0]))
				.pipe(gulp.dest("./dist/" + arr[0]))
				.on('end', resolve);
		}));
	});
	return Promise.all(subTasks);
});

gulp.task("clean-dist", function () {
	return Promise.all([
		gulp.src("./dist/src/**/dummy.css", { read: false }).pipe(clean()),
		gulp.src("./dist/src/**/*.ani.png", { read: false }).pipe(clean()),
		gulp.src("./src/**/dummy.css", { read: false }).pipe(clean()),
	]);
});

gulp.task("make-love", function () {
	return new Promise(function (resolve, reject) {
		zipFolder("./dist/src", "./dist/game.love", function (ziperr) {
			if (ziperr) reject();
			else resolve();
		});
	});
});

gulp.task("make-win", function () {
	let loveDependencyExt = "*.{exe,dll}"
	let p = (win ? conf.windows["loveWinDir"] + "\\" : conf["loveWinDir"] + "/") + loveDependencyExt;
	console.log(gulpSrcFiles(p));
	return Promise.all([
		gulp.src(p, { read: false })
    	.pipe(size({ showFiles: true }))
			.pipe(gulp.dest("./dist/win"))
	])/*.then(Promise.all([
		new Promise(function (resolve, reject) {
			var cmd;
			if(win) {
				cmd = "copy /b dist\\win\\love.exe+dist\\game.love dist\\win\\game.exe";
			}
			else {
				cmd = "cat ./dist/win/love.exe ./dist/game.love > ./dist/win/game.exe";
			}
			proc = exec("ls -la", function(err, stdout, stderr) {
				console.log(stdout);
				if (err) {
					reject();
				}
			});			
			proc.on('exit', function (code) {
				(code && reject()) || resolve();
			});
		})
	]).then(Promise.all([
		gulp.src("./dist/win/love.exe", { read: false }).pipe(clean())
	])))*/;
});

gulp.task("make-android", function () {

});

gulp.task("make-mac", function () {
	return new Promise(function (resolve, reject) {
		mkdirp("./mac", function (err) {
			if (err) reject();
			else {
				throw new Error("Mac build is not implemented as of now.");
			}
		});
	});
});

gulp.task("make-ios", function () {

});

gulp.task("build", function () {
	runSequence("delete-dist", "dist", ["minify-lua", "merge-animations"], "clean-dist", function () {
		if (conf["makeWin"]) {
			runSequence("make-win");
		}
		if (conf["makeAndroid"]) {
			runSequence("make-android");
		}
		if (conf["makeMac"]) {
			runSequence("make-mac");
		}
		if (conf["makeiOS"]) {
			runSequence("make-ios");
		}
	});
});

gulp.task("default", ["build"], function () {
})