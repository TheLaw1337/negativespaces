
module.exports = {
	"srcExt": "lua,png,jpg,ogg,wav,mp3", // files to copy to dist, prevent spaces between commas
	"minifyExclude": "**/lib/**/*", // any files within a lib folder won't be minified, because not all are luamin friendly (path will get the prefix "!./dist/src/")

	"makeWin": false, // will create build exe on default build (no final SFX compression, feel free to pull request)
	"loveWinDir": "/Users/marty/love-win32", // contains love.exe and dll-files

	"makeAndroid": false, // will copy .love file and injection files into the directory below and will run gradlew build on default build
	"loveAndroidDir": "/Users/marty/_my_/AS/love2d-admob-inappbilling-gameservices-android", // injection files will work with with the AdMob+InAppBilling-GameServices fork - not available yet

	"makeMac": false, // won't work / not supported (sry, feel free to pull request)
	"loveMacDir": "/Applications",

	"makeiOS": false, // will copy .love file and injection files into the directory below on default build
	"loveiOSDir": "/Users/marty/_my_/XC/love2d-admob-inapppurchases-gamecenter-ios", // injection files will work with with the AdMob+InAppPurchases-GameCenter fork - not available yet

	"windows" : { // all paths above for Windows systems
		"loveWinDir": "C:\\Program Files (x86)\\LOVE",
		"loveAndroidDir": "Z:\\_my_\\AS\\love2d-admob-inappbilling-gameservices-android",
		"loveiOSDir": "Z:\\_my_\\XC\\love2d-admob-inapppurchases-gamecenter-ios",
	}
}
