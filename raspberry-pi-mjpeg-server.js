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
    // tmpFolder = os.tmpdir(),
    tmpFolder = '/var/tmp',
    tmpImageFinder = 'finder.jpg',
    tmpImageMain = 'main.jpg',
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
    if (req.url === "/main.jpg") {
		 fs.readFile(tmpFolder + '/' + tmpImageMain, function(err, data) {
			if (err) throw err; // Fail if the file can't be read.
			res.writeHead(200, {'Content-Type': 'image/jpeg'});
			res.end(data); // Send the file data to the browser.
		});
    }

    if (req.url === "/finder.jpg") {
		 fs.readFile(tmpFolder + '/' + tmpImageFinder, function(err, data) {
			if (err) throw err; // Fail if the file can't be read.
			res.writeHead(200, {'Content-Type': 'image/jpeg'});
			res.end(data); // Send the file data to the browser.
		});
    }

    if (req.url === "/shutdown") {
        res.statusCode = 200;
        console.log("Shutdown called");

        this.command = "sudo shutdown now";
        var exec = require('child_process').exec,child;
        child = exec(this.command,function (error, stdout, stderr) {
            if(callback!==undefined){
            }
        });

        res.end();
        return;
    };
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

// start image capture
var finderscope = new PiCamera();
finderscope
    .nopreview()
    .baseFolder(tmpFolder)
    .thumb('0:0:0') // dont include thumbnail version
    .timeout(9999999) // never end
    .timelapse(timeout) // how often we should capture an image
    .width(width)
    .height(height)
    .quality(quality)
    .takePicture(tmpImageFinder);

//start image capture
var mainscope = new WebCamera();
mainscope
    .baseFolder(tmpFolder)
    .loop(5) // how often we should capture an image
    .resolution(width + "x" + height)
    .takePicture(tmpImageMain);