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
    partial_size = 0,
    default_unit = 1024,
    paths = [],
    unit = default_unit;

if (require.main !== module) {
  console.error('please run it as standalone app');
}

if (argv.help) {
  require('optimist').showHelp();
  process.exit(0);
}

function displaySize(bytes) {
  console.log(bytes);
}

function traversePath(path, callback) {
  var stats, files;

  stats = fs.lstatSync(path);
  if (stats.isFile()) {
    callback(stats.size);
  } else {
    files = fs.readdirSync(path);
    files && files.forEach(function(file) {
      traversePath(path + '/' + file, callback);
    });
  }
}

function collectSize(bytes) {
  partial_size += Math.ceil(bytes/unit);
}

if (argv._.length === 0) {
  paths.push('.');

} else {
  argv._.forEach(function(path) {
    paths.push(path);
  });
}

paths.forEach(function(path) {
  traversePath(path, collectSize);
  displaySize(partial_size);
});
