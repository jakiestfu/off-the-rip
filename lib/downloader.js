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
var sanitize = require("sanitize-filename");

function parse(str) {
  try {
    return JSON.parse(str);
  } catch(e) {}
}

function log(data, showLog) {
  if(typeof showLog == "undefined") {
    showLog = true;
  }
  console.log(showLog ? "LOG:".underline : "    ", data);
}

function add_slashes(str) {
  return (str + '')
    .replace(/[\\"']/g, '\\$&')
    .replace(/\u0000/g, '\\0');
}

function download(soundcloud_url, dest, info, callback) {
  var tmp_name = new Date().getTime();

  var audio_temp_dest = path.join('/tmp', 'audio-' + tmp_name + '.mp3');
  var audio_dest = path.join(dest, sanitize(info.title + '.mp3'));
  var artwork_temp_dest = path.join('/tmp', 'artwork-' + tmp_name + '.jpg');

  async.series([

    // Write artwork to disk
    function(cb) {
      log("Downloading Artwork...");

      request(info.artwork).on('end', cb).pipe(fs.createWriteStream(artwork_temp_dest));
    },

    // Resolve Audio File MP3 and write to disk
    function(cb) {
      log("Resolving MP3 URI...");

      request(info.stream_api_uri, function(err, res) {
        var body = parse(res.body);

        // Raw HTTP
        if ('http_mp3_128_url' in body) {
          log("Downloading MP3...");

          request(body.http_mp3_128_url).on('end', cb).pipe(fs.createWriteStream(audio_temp_dest));
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
            .pipe(fs.createWriteStream(audio_temp_dest));
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
          title: add_slashes(info.title)
      }, [
        new id3.Image(artwork_temp_dest)
      ]);

      writer
        .setFile(new id3.File(add_slashes(audio_temp_dest)))
        .write(meta, cb);

    },

    // Move Files
    function(cb) {
      log("Moving audio...");

      fs.rename(audio_temp_dest, audio_dest, cb);
    },

    // Clean up temp
    function(cb) {
      log("Cleaning up temp files...");

      fs.unlink(artwork_temp_dest, cb);
    }
  ], function() {
    log(('Downloaded "' + info.title + '" to ' + audio_dest).green);
    callback();
  });
}

module.exports = function(soundcloud_url, dest, callback) {

  log("Sniffing network...");
  // Sniff network traffic and return relevant data
  var phantom_path = path.join(__dirname, '../', 'node_modules/phantomjs/bin/phantomjs');
  var sniff_path = path.join(__dirname, 'sniff.js');

  exec([
    phantom_path,
    sniff_path,
    soundcloud_url
  ].join(' '), function (error, stdout, stderr) {

    if(error) { console.log("ERROR".underline.red, error); }
    if(stderr) { console.log("ERROR".underline.red, stderr); }
    if(error || stderr) { return process.exit(); }

    var messages = parse(stdout) || [];

    messages.forEach(function(message) {
      if (message.type == "payload") {
        download(soundcloud_url, dest, message.data, callback);
      }
      else if (message.type == "log") {
        log("└── " + message.data, false);
      }
    });
  });

};
