#! /usr/bin/env node

var async = require('async');
var exec = require('child_process').exec;
var fs = require('fs');
var id3 = require('id3-writer');
var path = require('path');
var request = require('request');

function parse(str) {
  try {
    return JSON.parse(str);
  } catch(e) {}
}

module.exports = function(url, dest, callback) {


  exec('phantomjs ./lib/sniff.js ' + url, function (error, stdout, stderr) {
      var info = parse(stdout);
      var audio = path.join(dest, info.title + '.mp3');
      var artwork_name = new Date().getTime() + '-artwork.jpg';
      var artwork = path.join('/tmp', artwork_name);

      async.series([

        // Write artwork to disk
        function(cb) {
          request(info.artwork).on('end', cb).pipe(fs.createWriteStream(artwork));
        },

        // Write audio file to disk
        function(cb) {
          request(info.stream_api_uri, function(err, res) {
            var body = parse(res.body);
            request(body.http_mp3_128_url).on('end', cb).pipe(fs.createWriteStream(audio));
          });
        },

        // Write ID3 Tags
        function(cb) {

          var writer = new id3.Writer();

          var meta = new id3.Meta({
              artist: info.artist,
              title: info.title
          }, [
            new id3.Image(artwork)
          ]);

          writer
            .setFile(new id3.File(audio))
            .write(meta, cb);

        },

        // Clean up temp
        function(cb) { fs.unlink(artwork, cb); }
      ], function() {
        console.log("Downloaded", info.title);
        callback();
      });
    }
  );
};
