var exec = require('child_process').exec;

var cmd = exec('mkfs.ext4 /dev/sdb2');
cmd.stdout.on('exit', function(extcode, signal) {
    console.log('exit with ', extcode, signal); 
});



