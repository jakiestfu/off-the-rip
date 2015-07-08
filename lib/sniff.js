var system = require('system');
var page = require('webpage').create();

var info = {};
var logs = [];

// Capture Resources
page.onResourceRequested = function(request) {
  //console.log('Request ' + JSON.stringify(request, undefined, 4));

  // Get highest res artwork
  if(request.url.indexOf('artwork') !== -1 && request.url.indexOf('500') !== -1 && request.url.indexOf('pixel') == -1 && !info.artwork) {
    info.artwork = request.url;

    logs.push({
      type: "log",
      data: "Found artwork: " + info.artwork
    });
  }

  // If stream is in the URL, save it for later
  if(request.url.indexOf('stream') !== -1) {
    info.stream_api_uri = request.url;

    logs.push({
      type: "log",
      data: "Found stream API url: " + info.stream_api_uri
    });
  }

  if(info.artwork && info.stream_api_uri && info.title && info.username) {

    // Attempt to extract an artist name from the track title, kind of common in soundcloud tracks
    var split;
    if (info.title.indexOf('~') !== -1) { split = '~'; }
    else if (info.title.indexOf('-') !== -1) { split = '-'; }

    if(split) {
      var parts = info.title.split(split);
      info.artist = parts[0].trim();
      info.title = parts[1].trim();
    }
    else {
      info.artist = info.username;
    }

    logs.push({
      type: "log",
      data: "Found Title: " + info.title
    });

    logs.push({
      type: "log",
      data: "Found artist: " + info.artist
    });

    logs.push({
      type: "payload",
      data: info
    });

    console.log(JSON.stringify(logs));
    phantom.exit();
  }
};

var url = system.args[1];
if(url) {
  page.open(url, function(status) {
    page.includeJs("http://ajax.googleapis.com/ajax/libs/jquery/1.6.1/jquery.min.js", function() {

      // Check the page until the play button exists
      logs.push({
        type: "log",
        data: "Waiting for play button"
      });
      var interval = setInterval(function() {

        if(page.evaluate(function() {
          return $('.heroPlayButton').length;
        })) {
          clearInterval(interval);

          info.title = page.evaluate(function() {
            return $('.soundTitle__title:first').text().replace("\n", "").trim();
          });

          info.username = page.evaluate(function() {
            return $('.soundTitle__usernameHero').text().replace("\n", "").trim();
          });

          logs.push({
            type: "log",
            data: "Playing track"
          });

          // Press play to initiate API request
          page.evaluate(function() {
            $('.heroPlayButton').click();
          });
        }
      }, 300);
    });
  });
}
