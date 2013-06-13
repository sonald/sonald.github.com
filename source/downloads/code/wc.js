#!/usr/bin/env node

/**
 * simple wc clone written in JS.
 * need optimist for options parsing.
 * Sian Cao <yinshuiboy@gmail.com>
 */

var argv = require('optimist')
           .usage('Usage: $0 [OPTION]... [FILE]...\n' +
                  '  -c count chars\n' +
                  '  -l count lines\n' +
                  '  -w count words')
           .boolean(['c', 'l', 'w', 'h'])
           .argv,
    fs = require('fs'),
    util = require('util');

function processChunk(chunk, collects) {
    var i = 0, inword = false;
    for (i = 0; i < chunk.length; i += 1) {
      collects.nr_chars += 1;
      if (/\w/.test(chunk[i])) {
        if (!inword) {
          inword = true;
          collects.nr_words += 1;
        }
      } else {
        inword = false;
      }

      if (chunk[i] == '\n') {
        inword = true;
        collects.nr_lines += 1;
      }
    }
}

function printCounts(collects) {
  if (argv.l) {
    util.print(collects.nr_lines + ' ');
  }

  if (argv.w) {
    util.print(collects.nr_words + ' ');
  }

  if (argv.c) {
    util.print(collects.nr_chars + ' ');
  }

  if (!(argv.l || argv.c || argv.w)) {
    util.print(collects.nr_lines + ' ' + collects.nr_words + ' ' + collects.nr_chars);
  }

  util.print('\n');
}

if (argv.h || argv.help) {
  require('optimist').showHelp();
  process.exit(0);
}

if (argv._.length > 0) {
  argv._.forEach(function(file) {
    var collects = {
      nr_lines: 0,
      nr_words: 0,
      nr_chars: 0
    };

    var fstat = fs.statSync(file);
    if (fstat.isFile()) {
      fs.createReadStream(file, {encoding: 'utf8'}).on('data', function(chunk) {
        processChunk(chunk, collects);

      }).on('end', function() {
        printCounts(collects);
      });
    }
  });

} else {
  (function() {
    var collects = {
      nr_lines: 0,
      nr_words: 0,
      nr_chars: 0
    };

    process.stdin.resume();
    process.stdin.setEncoding('utf8');

    process.stdin.on('data', function(chunk) {
      processChunk(chunk, collects);
    });

    process.stdin.on('end', function() {
      printCounts(collects);
    });
   })();
}
