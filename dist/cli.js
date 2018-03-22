#!/usr/bin/env node
'use strict';var _keys=require('babel-runtime/core-js/object/keys');var _keys2=_interopRequireDefault(_keys);var _path=require('path');var _path2=_interopRequireDefault(_path);var _index=require('./index');var _index2=_interopRequireDefault(_index);var _yargs=require('yargs');var _yargs2=_interopRequireDefault(_yargs);var _package=require('../package.json');function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj}}var argv=_yargs2.default.usage('Usage: '+(0,_keys2.default)(_package.bin)[0]+' --input <http://url|file.json> [--output <directory>]').options({input:{alias:'i',describe:'Youtube URL or JSON file',demandOption:true,type:'string',requiresArg:true},output:{alias:'o',default:'.',describe:'Generated MP3 directory',type:'string',requiresArg:true},verbose:{alias:'v',describe:'Verbose mode',type:'boolean'}}).argv;var opts={output:argv.output,verbose:argv.verbose};if(/^https?:\/\//.test(argv.input)){opts.videoUrl=argv.input}else{opts.videos=require(process.cwd()+'/'+argv.input).videos}var youtubeToMp3=new _index2.default(opts);youtubeToMp3.on('downloading',function(videoId,outputLine){return process.stdout.write('Downloading '+videoId+': '+outputLine)});youtubeToMp3.on('encoding',function(videoId,outputLine){return process.stdout.write('Encoding '+videoId+': '+outputLine)});youtubeToMp3.on('downloaded',function(videoId,downloadedFile){return process.stdout.write(videoId+' downloaded with success: '+downloadedFile)});youtubeToMp3.on('encoded',function(videoId,encodedFile){return process.stdout.write(videoId+' encoded with success: '+encodedFile)});youtubeToMp3.on('error',function(videoId,err){return process.stderr.write(err)});youtubeToMp3.run();