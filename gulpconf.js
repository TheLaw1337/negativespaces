module.exports = {
	"srcExt": "lua,png", // Extensions of files to distribute

	"makeWin": true, // make exe from game
	"loveWinDir": "/Users/marty/love-win32", // unix path to love.exe

	"makeAndroid": false, // copy inject files and love file to android fork and run grudlew build
	"loveAndroidDir": "/Users/marty/_my_/AS/love2d-admob-inappbilling-gameservices-android", // inject files are very specific to this fork (not released yet, so use your own inject files)

	"makeMac": false, // not supporting, feel free to implement and pull request
	"loveMacDir": "", 

	"makeiOS": false, // copy inject files and love file to iOS fork
	"loveiOSDir": "/Users/marty/_my_/XC/love2d-admob-inapppurchases-gamecenter-ios", // inject files are very specific to this fork (not released yet, so use your own inject files)

	windows: { // set those when working on Windows
		"loveWinDir": "C:\\Program Files (x86)\\LOVE", // win path to love.exe
		"loveAndroidDir": "Z:\\_my_\\AS\\love2d-admob-inappbilling-gameservices-android",
		"loveMacDir": "",
		"loveiOSDir": "Z:\\_my_\\XC\\love2d-admob-inapppurchases-gamecenter-ios",
	}
};