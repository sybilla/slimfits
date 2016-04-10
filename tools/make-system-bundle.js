var path = require('path');
var Builder = require('systemjs-builder');
var addLicenseToFile = require('./add-license-to-file');

var config = {
  baseURL: 'dist',
  paths: {
      'sybilla/*': 'cjs/*.js',
      'es6-promise' : "../node_modules/es6-promise/dist/es6-promise.js"
  }
};


build('sybilla/slimfits', '../dist/global/slimfits.js', '../dist/global/slimfits.min.js');

function build(name, inputFile, outputFile) {
  var devBuilder = new Builder();

  devBuilder.config(config);

  devBuilder.build(name, path.resolve(__dirname, inputFile)).then(function() {
    var prodBuilder = new Builder();
    prodBuilder.config(config);
    prodBuilder.build(name, path.resolve(__dirname, outputFile), {sourceMaps: true, minify: true}).then(function() {
      process.exit(0);
    }, function(err) {
      console.error('prod died', err);
      process.exit(1);
    });

  }, function(err) {
    console.error('dev died', err);
    process.exit(1);
  });
}

process.stdin.resume();
