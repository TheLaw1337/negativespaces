let exec = require("child_process").exec;
let fs = require("fs")
let path = require("path");
let process = require("process");
let zipFolder = require("zip-folder");
let gulp = require("gulp");
let conf = require("./gulpconf");

let runSequence = require("run-sequence");
var size = require("gulp-size");
let plumber = require("gulp-plumber");
let func = require("gulp-function");
let clean = require("gulp-clean");
let deleteFile = require("gulp-delete-file");
let gulpSrcFiles= require("gulp-src-files");

let luaminify = require('gulp-luaminify');
let spritesmith = require('gulp.spritesmith');

let win = process.platform === "win32";
let mac = process.platform === "darwin";

gulp.task("delete-dist", function () {
	return gulp.src("dist", { read: false }).pipe(clean());
});

gulp.task("dist", ["delete-dist"], function () {
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
		.pipe(func.forEach(function (file, enc) {
			let d = path.dirname(file.path).replace(__dirname + "/", "").replace(__dirname + "\\", "");
			let g = path.win32.basename(file.path).split(/_/)[0];
			if (animations.length < 1 || animations.indexOf([d, g]) < 0) {
				animations.push([d, g]);
			}
			return enc
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
					cssName: "dummy.ani.css",
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
	return Promise.all(subTasks).then();
});

gulp.task("clean", function() {
	return gulp.src("./dist/src/**/*.ani.{png,css}", { read: false })
	.pipe(deleteFile({
		reg: /.*/, deleteMatch: true
	}))
	.pipe(func.atEnd(function() {
		gulp.src("./src/**/*.ani.css", { read: false })
		.pipe(deleteFile({
			reg: /.*/, deleteMatch: true
		}))
	}))
})

gulp.task("make-love", ["clean"], function () {
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
	return gulp.src(path.normalize(p), { read: true })
		.pipe(size({ showFiles: true }))
		.pipe(gulp.dest("./dist/win"))
		.pipe(func.atEnd(function() {
			var cmd;
			if(win) {
				cmd = "copy /b dist\\win\\love.exe+dist\\game.love dist\\win\\game.exe";
			}
			else {
				cmd = "cat ./dist/win/love.exe ./dist/game.love > ./dist/win/game.exe";
			}
			console.log(cmd);
			proc = exec(cmd, function(err, stdout, stderr) {
				console.log(stdout);
			});			
			proc.on("exit", function (code) {
				fs.unlinkSync("dist/win/love.exe");
				fs.unlinkSync("dist/win/lovec.exe");
				fs.unlinkSync("dist/win/Uninstall.exe");
			});
		}));
});

gulp.task("make-android", function () {
	let p = (win ? conf.windows["loveAndroidDir"] + "\\" : conf["loveAndroidDir"] + "/");
	return gulp.src("./inject/android/**/*", { read: true })
		.pipe(size({ showFiles: true }))
		.pipe(gulp.dest(path.normalize(p)))
		.pipe(func.atEnd(function() {
			fs.copyFileSync("./dist/game.love", path.normalize(p) + "/app/src/main/assets/game.love");
			// let cmd = "\"" + p + "gradlew build\"";
			// console.log(cmd);
			// proc = exec(cmd, function(err, stdout, stderr) {
			// 	console.log(stdout);
			// });
		}));
});

gulp.task("make-mac", function () {
	return new Promise(function (resolve, reject) {
		throw new Error("Mac build is not implemented as of now.");
	});
});

gulp.task("make-ios", function () {
	let p = (win ? conf.windows["loveiOSDir"] + "\\" : conf["loveiOSDir"] + "/");
	return gulp.src("./inject/iOS/**/*", { read: true })
		.pipe(size({ showFiles: true }))
		.pipe(gulp.dest(path.normalize(p)))
		.pipe(func.atEnd(function() {
			fs.copyFileSync("./dist/game.love", path.normalize(p) + "/platform/xcode/game.love");
		}));
});

gulp.task("build", function () {
	runSequence("dist", ["minify-lua", "merge-animations"], "make-love", function () {
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