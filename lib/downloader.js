#! /usr/bin/env node

var async = require('async');
var colors = require('colors');
var exec = require('child_process').exec;
var fs = require('fs');
var id3 = require('id3-writer');
var path = require('path');
var request = require('request');
var rtmpdump = require('rtmpdump');
var url = require('url');

function parse(str) {
  try {
    return JSON.parse(str);
  } catch(e) {}
}

function log(data) {
  console.log("LOG:".underline, data);
}

module.exports = function(soundcloud_url, dest, callback) {

  log("Sniffing network...");

  // Sniff network traffic and return relevant data
  exec('phantomjs ' + path.join(__dirname, 'sniff.js') +' ' + soundcloud_url, function (error, stdout, stderr) {

    var info = parse(stdout);

    var audio_dest = path.join(dest, info.title + '.mp3');
    var artwork_name = new Date().getTime() + '-artwork.jpg';
    var artwork_dest = path.join('/tmp', artwork_name);

    async.series([

      // Write artwork to disk
      function(cb) {
        log("Downloading Artwork...");

        request(info.artwork).on('end', cb).pipe(fs.createWriteStream(artwork_dest));
      },

      // Resolve Audio File MP3 and write to disk
      function(cb) {
        log("Resolving MP3 URI...");

        request(info.stream_api_uri, function(err, res) {
          var body = parse(res.body);

          // Raw HTTP
          if ('http_mp3_128_url' in body) {
            log("Downloading MP3...");

            request(body.http_mp3_128_url).on('end', cb).pipe(fs.createWriteStream(audio_dest));
          }

          // RTMP
          else if ('rtmp_mp3_128_url' in body) {
            log("Dumping RTMP Stream...");

            var parts = url.parse(body.rtmp_mp3_128_url);
            var playpath = parts.path.replace(/\//g, '');

            rtmpdump
              .createStream({
                rtmp: parts.href.replace(playpath, ''),
                playpath: playpath
              })
              .on('end', cb)
              .pipe(fs.createWriteStream(audio_dest));
          }

          // HLS Playlist
          /*else if ('hls_mp3_128_url' in body) {
            request(body.hls_mp3_128_url, function(err, res) {
              var playlist = M3U.parse(res.body).filter(function(item) { return item; });
              //console.log(playlist);
              if(playlist.length && playlist[0].file) {
                audio_download_url = playlist[0].file;
                return cb();
              }
            });
          }*/
        });
      },

      // Write ID3 Tags
      function(cb) {
        log("Writing ID3 Tags...");

        var writer = new id3.Writer();

        var meta = new id3.Meta({
            artist: info.artist,
            title: info.title
        }, [
          new id3.Image(artwork_dest)
        ]);

        writer
          .setFile(new id3.File(audio_dest))
          .write(meta, cb);

      },

      // Clean up temp
      function(cb) {
        log("Cleaning up temp files...");

        fs.unlink(artwork_dest, cb);
      }
    ], function() {
      log(('Downloaded "' + info.title + '" to ' + audio_dest).green);
      callback();
    });
  });
};
