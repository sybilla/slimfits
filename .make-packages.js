var pkg = require('./package.json');
var fs = require('fs');
var mkdirp = require('mkdirp');
var path = require('path');
var Builder = require('systemjs-builder');
var licenseTool = require('./tools/add-license-to-file');
var addLicenseToFile = licenseTool.addLicenseToFile;
var addLicenseTextToFile = licenseTool.addLicenseTextToFile;

// License info for minified files
var licenseUrl = 'https://github.com/sybilla/slimfits/blob/master/LICENSE.txt';
var license = 'Dual-licensed: ' + licenseUrl;

delete pkg.scripts;

var cjsPkg = Object.assign({}, pkg, {
  name: 'slimfits',
  main: 'slimfits.js',
  typings: 'slimfits.d.ts'
});
var es6Pkg = Object.assign({}, cjsPkg, {
  name: 'slimfits-es',
  main: 'slimfits.js',
  typings: 'slimfits.d.ts'
});

fs.writeFileSync('dist/cjs/package.json', JSON.stringify(cjsPkg, null, 2));
fs.writeFileSync('dist/cjs/LICENSE.txt', fs.readFileSync('./LICENSE.txt').toString());
fs.writeFileSync('dist/cjs/README.md', fs.readFileSync('./README.md').toString());

// Bundles for CJS only
mkdirp.sync('dist/cjs/bundles');
// UMD bundles
fs.writeFileSync('dist/cjs/bundles/slimfits.umd.js', fs.readFileSync('dist/global/slimfits.umd.js').toString());
fs.writeFileSync('dist/cjs/bundles/slimfits.umd.min.js', fs.readFileSync('dist/global/slimfits.umd.min.js').toString());
fs.writeFileSync('dist/cjs/bundles/slimfits.umd.min.js.map', fs.readFileSync('dist/global/slimfits.umd.min.js.map').toString());
// System bundles
fs.writeFileSync('dist/cjs/bundles/slimfits.js', fs.readFileSync('dist/global/slimfits.js').toString());
fs.writeFileSync('dist/cjs/bundles/slimfits.min.js', fs.readFileSync('dist/global/slimfits.min.js').toString());
fs.writeFileSync('dist/cjs/bundles/slimfits.min.js.map', fs.readFileSync('dist/global/slimfits.min.js.map').toString());

// ES6 Package
fs.writeFileSync('dist/es6/package.json', JSON.stringify(es6Pkg, null, 2));
fs.writeFileSync('dist/es6/LICENSE.txt', fs.readFileSync('./LICENSE.txt').toString());
fs.writeFileSync('dist/es6/README.md', fs.readFileSync('./README.md').toString());

// Add licenses to tops of bundles
addLicenseToFile('LICENSE.txt', 'dist/cjs/bundles/slimfits.umd.js');
addLicenseTextToFile(license, 'dist/cjs/bundles/slimfits.umd.min.js');
addLicenseToFile('LICENSE.txt', 'dist/cjs/bundles/slimfits.js');
addLicenseTextToFile('license', 'dist/cjs/bundles/slimfits.min.js');
addLicenseToFile('LICENSE.txt', 'dist/global/slimfits.umd.js');
addLicenseTextToFile(license, 'dist/global/slimfits.umd.min.js');
addLicenseToFile('LICENSE.txt', 'dist/global/slimfits.js');
addLicenseTextToFile(license, 'dist/global/slimfits.min.js');
