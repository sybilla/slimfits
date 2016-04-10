var browserify = require('browserify');
var fs = require('fs');

var b = browserify(['dist/cjs/slimfits.js'], {
  baseDir: 'dist/cjs',
  standalone: 'slimfits'
});

b.bundle().pipe(fs.createWriteStream('dist/global/slimfits.umd.js'));

