'use strict';var _path=require('path');var _path2=_interopRequireDefault(_path);var _index=require('./index');var _index2=_interopRequireDefault(_index);function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj}}var youtubeSlicer=new _index2.default({output:_path2.default.resolve(__dirname,'..','out'),videoUrl:process.argv[2]//     videos: [
//       {
//         url: 'https://www.youtube.com/watch?v=gCBoKAxuzpc',
//         tags: {
//           artist: 'Godspeed You! Black Emperor',
//           album: 'Luciferian Towers'
//         },
//         slices: [
// //           01.  00:00
// {
//   tags: { title: 'Peasantry or \'Light! Inside of Light!', },
//   start: '00:00:00',
//   end: 'next'
// },
// // 02.  
// {
//   tags: { title: 'Lamb\'s Breath', },
//   start: '00:10:28',
//   end: 'next'
// },
// // 03.  
// {
//   tags: { title: 'Asunder, Sweet', },
//   start: '00:20:20',
//   end: 'next'
// },
// // 04.  
// {
//   tags: { title: 'Piss Crowns Are Trebled', },
//   start: '00:26:33',
//   end: 'next'
// }
//         ]
//       }
//     ]
});youtubeSlicer.on('downloading',function(videoId,outputLine){console.log('Downloading '+videoId+': '+outputLine)});youtubeSlicer.on('encoding',function(videoId,outputLine){console.log('Encoding '+videoId+': '+outputLine)});youtubeSlicer.on('downloaded',function(videoId,downloadedFile){console.log(videoId+' downloaded with success: '+downloadedFile)});youtubeSlicer.on('encoded',function(videoId,encodedFile){console.log(videoId+' encoded with success: '+encodedFile)});youtubeSlicer.on('error',function(videoId,err){console.error(err)});youtubeSlicer.run();