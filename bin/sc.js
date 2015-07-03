#! /usr/bin/env node

var commander = require('commander');
var pkg = require('../package.json');

var downloader = require('../lib/downloader');

commander.command('dl <url> <dest>').action(function(url, dest) {
  downloader(url, dest, process.exit);
});

commander.version(pkg.version).parse(process.argv);

if (!process.argv.slice(2).length) {
  commander.outputHelp();
}
