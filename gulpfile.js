let exec = require("child_process").exec;
let fs = require("fs")
var path = require('path');
let path = require("path");
let process = require("process");
let mkdirp = require("mkdirp");
let zipFolder = require("zip-folder");
let gulp = require("gulp");

let conf = require("./gulpconf");

let runSequence = require("run-sequence");
let clean = require("gulp-clean");

var size = require("gulp-size");
let plumber = require("gulp-plumber");
let func = require("gulp-function");
let clean = require("gulp-clean");
let plumber = require("gulp-plumber");
let foreach = require("gulp-foreach");
let deleteFile = require("gulp-delete-file");
let gulpSrcFiles= require("gulp-src-files");

let luaminify = require('gulp-luaminify');
let spritesmith = require('gulp.spritesmith');

gulp.task("clean-before", function() {
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
		return gulp.src(["src/**/*.lua"])
		.pipe(plumber())
	return gulp.src(["./dist/src/**/*.lua"], { base: "." })
	.pipe(plumber())
		.pipe(size({ showFiles: true }))
		.pipe(luaminify())
		.pipe(gulp.dest("dist/src"));
		.pipe(gulp.dest("."));
});

var animations;
gulp.task("reg-animations", function () {	
gulp.task("reg-animations", function () {
	animations = [];
	return gulp.src(["src/**/*.ani.png"], { read: false })
		.pipe(foreach(function(stream, file) {
	return gulp.src(["./src/**/*.ani.png"], { read: false })
		.pipe(size({ showFiles: true }))
		.pipe(func.forEach(function (file, enc) {
			let d = path.dirname(file.path).replace(__dirname + "/", "");
			let g = path.win32.basename(file.path).split(/_/)[0];
			if(animations.length < 1 || animations.indexOf([d,g]) < 0) {
				animations.push([d,g]);
			if (animations.length < 1 || animations.indexOf([d, g]) < 0) {
				animations.push([d, g]);

			}
			return stream
			return enc
		}));
});

gulp.task("merge-animations", ["reg-animations"], function () {	
gulp.task("merge-animations", ["reg-animations"], function () {
	var subTasks = [];
	animations.forEach(arr => {
		subTasks.push(new Promise(function(resolve, reject) { 
		subTasks.push(new Promise(function (resolve, reject) {
			gulp.src([arr[0] + "/" + arr[1] + "_*.ani.png"])
    		.pipe(size({ showFiles: true }))
				.pipe(spritesmith({
					imgName: arr[1] + ".a.png",
					cssName: "dummy.css",
					cssName: "dummy.ani.css",
					algorithm: "top-down",
					algorithmOpts: { 
					algorithmOpts: {
						sort: false
					}
				}))
        .on('error', reject)
				.pipe(gulp.dest("dist/" + arr[0]))
				.on('error', reject)
				.pipe(gulp.dest(arr[0]))
        .on('end', resolve);
			}))
				.pipe(gulp.dest("./dist/" + arr[0]))
				.on('end', resolve);
		}));
	});
	return Promise.all(subTasks);
	return Promise.all(subTasks).then();
});

gulp.task("clean-after", function () {
	return Promise.all([
		gulp.src("dist/src/**/dummy.css", { read: false }).pipe(clean()),
		gulp.src("src/**/dummy.css", { read: false }).pipe(clean())
	]);

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

gulp.task("default", ["build"], function() {
	gulp.watch("src/**/*.lua", ["minify-lua"]);
	gulp.watch("src/**/*.ani.png", ["build"]);
})



gulp.task("make-win", function () {
	let loveDependencyExt = "*.{exe,dll}"
	let p = (win ? conf.windows["loveWinDir"] + "\\" : conf["loveWinDir"] + "/") + loveDependencyExt;
	return gulp.src(p, { read: true })
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
			});
		}));
});

gulp.task("build", function() {
	runSequence("clean-before", ["minify-lua", "merge-animations"], "clean-after", function() {
		console.log("Build completed!");
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

gulp.task("make-ios", ["make-love"], function () {

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