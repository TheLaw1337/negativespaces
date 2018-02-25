let fs = require("fs")
var path = require('path');
let gulp = require("gulp");

let runSequence = require("run-sequence");
let clean = require("gulp-clean");
let plumber = require("gulp-plumber");
let foreach = require("gulp-foreach");

let luaminify = require('gulp-luaminify');
let spritesmith = require('gulp.spritesmith');

gulp.task("clean-before", function() {
	return gulp.src("dist", { read: false }).pipe(clean());
});
 
gulp.task('minify-lua', function () {
		return gulp.src(["src/**/*.lua"])
		.pipe(plumber())
		.pipe(luaminify())
		.pipe(gulp.dest("dist/src"));
});

var animations;
gulp.task("reg-animations", function () {	
	animations = [];
	return gulp.src(["src/**/*.ani.png"], { read: false })
		.pipe(foreach(function(stream, file) {
			let d = path.dirname(file.path).replace(__dirname + "/", "");
			let g = path.win32.basename(file.path).split(/_/)[0];
			if(animations.length < 1 || animations.indexOf([d,g]) < 0) {
				animations.push([d,g]);
			}
			return stream
		}));
});

gulp.task("merge-animations", ["reg-animations"], function () {	
	var subTasks = [];
	animations.forEach(arr => {
		subTasks.push(new Promise(function(resolve, reject) { 
			gulp.src([arr[0] + "/" + arr[1] + "_*.ani.png"])
				.pipe(spritesmith({
					imgName: arr[1] + ".a.png",
					cssName: "dummy.css",
					algorithm: "top-down",
					algorithmOpts: { 
						sort: false
					}
				}))
        .on('error', reject)
				.pipe(gulp.dest("dist/" + arr[0]))
				.pipe(gulp.dest(arr[0]))
        .on('end', resolve);
			}))
	});
	return Promise.all(subTasks);
});

gulp.task("clean-after", function () {
	return Promise.all([
		gulp.src("dist/src/**/dummy.css", { read: false }).pipe(clean()),
		gulp.src("src/**/dummy.css", { read: false }).pipe(clean())
	]);
});

gulp.task("default", ["build"], function() {
	gulp.watch("src/**/*.lua", ["minify-lua"]);
	gulp.watch("src/**/*.ani.png", ["build"]);
})

gulp.task("build", function() {
	runSequence("clean-before", ["minify-lua", "merge-animations"], "clean-after", function() {
		console.log("Build completed!");
	});
})