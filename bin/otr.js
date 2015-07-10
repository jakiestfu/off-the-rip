#! /usr/bin/env node

var commander = require('commander');
var pkg = require('../package.json');

var downloader = require('../lib/downloader');
var targetUrl, destPath;

commander
  .arguments('<url> [dest]')
  .action(function(url, dest) {
    targetUrl = url;
    destPath = dest || __dirname;
  });

commander
  .version(pkg.version)
  .parse(process.argv);

if (targetUrl) {
  downloader(targetUrl, destPath, process.exit);
} else {
  commander.outputHelp();
}

