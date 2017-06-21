#!/usr/bin/env node

var fs = require("fs"),
    os = require('os'),
    path = require('path'),
    http = require("http"),
    util = require("util"),
    localIp = require('ip'),
    PiCamera = require('./camera.js'),
    WebCamera = require('./webcam.js'),
    program = require('commander'),
    pjson = require('./package.json');

program
  .version(pjson.version)
  .description(pjson.description)
  .option('-p --port <n>', 'port number (default 8080)', parseInt)
  .option('-w --width <n>', 'image width (default 640)', parseInt)
  .option('-l --height <n>', 'image height (default 480)', parseInt)
  .option('-q --quality <n>', 'jpeg image quality from 0 to 100 (default 85)', parseInt)
  .option('-t --timeout <n>', 'timeout in milliseconds between frames (default 500)', parseInt)
  .option('-v --version', 'show version')
  .parse(process.argv);

program.on('--help', function(){
 console.log("Usage: " + pjson.name + " [OPTION]\n");
});

var port = program.port || 8080,
    width = program.width || 640,
    height = program.height || 480,
    timeout = program.timeout || 250,
    quality = program.quality || 75,
    tmpFolder = os.tmpdir(),
    tmpImage = pjson.name + '-image.jpg',
    localIpAddress = localIp.address(),
    boundaryID = "BOUNDARY";

/**
 * create a server to serve out the motion jpeg images
 */
var server = http.createServer(function(req, res) {

    if (req.url === "/healthcheck") {
        res.statusCode = 200;
        res.end();
        return;
    };

    // for image requests, return a HTTP multipart document (stream)
    if (req.url === "/") {
		 fs.readFile(tmpFolder + '/' + tmpImage, function(err, data) {
			if (err) throw err; // Fail if the file can't be read.
			res.writeHead(200, {'Content-Type': 'image/jpeg'});
			res.end(data); // Send the file data to the browser.
		});
    }
});

server.on('error', function(e) {
    if (e.code == 'EADDRINUSE') {
        console.log('port already in use');
    } else if (e.code == "EACCES") {
        console.log("Illegal port");
    } else {
        console.log("Unknown error");
    }
    process.exit(1);
});

// start the server
server.listen(port);
console.log(pjson.name + " started on port " + port);
console.log('Visit http://' + localIpAddress + ':' + port + ' to view your PI camera stream');
console.log('');


var tmpFile = path.resolve(path.join(tmpFolder, tmpImage));

// //setup the camera
// var finderscope = new PiCamera();

// // start image capture
// finderscope
//     .nopreview()
//     .baseFolder(tmpFolder)
//     .thumb('0:0:0') // dont include thumbnail version
//     .timeout(9999999) // never end
//     .timelapse(timeout) // how often we should capture an image
//     .width(width)
//     .height(height)
//     .quality(quality)
//     .takePicture(tmpImage);

var mainscope = new WebCamera();

// start image capture
mainscope
    .baseFolder(tmpFolder)
    .loop(1) // how often we should capture an image
    .resolution(width + "x" + height)
    .takePicture(tmpImage);