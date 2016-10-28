#!/usr/bin/env node
// du clone

var fs = require('fs'),
    util = require('util'),
    argv = require('optimist')
           .usage('Usage: $0 [OPTION]... [PATH]...\n' +
                  '\t-h, --human \n' +
                  '\t-c, --total \n' +
                  '\t--help')
           .boolean(['c', 'h', 'count', 'help'])
           .argv,
    events = new require('events'),
    emitter = new events.EventEmitter(),
    total_size = 0,
    default_unit = 1,
    paths = [],
    unit = default_unit;

if (require.main !== module) {
  console.error('please run it as standalone app');
}

if (argv.help) {
  require('optimist').showHelp();
  process.exit(0);
}

function displaySize() {
    console.log(total_size);
}

function traversePath(path, callback) {

  fs.lstat(path, function(err, stats) {
    if (stats.isFile()) {
      emitter.emit('data', stats.size);
      console.log('%d\t%s', stats.size, path);

    } else {
      fs.readdir(path, function(err2, files) {
        files && files.forEach(function(file) {
                   traversePath(path + '/' + file, callback);
                 });
      });
    }
  });
}

function collectSize(bytes) {
  total_size += Math.ceil(bytes/unit);
}

emitter.on('data', collectSize);

if (argv._.length === 0) {
  paths.push('.');

} else {
  argv._.forEach(function(path) {
    paths.push(path);
  });
}

paths.forEach(function(path) {
  traversePath(path, collectSize);
});

process.on('exit', displaySize);