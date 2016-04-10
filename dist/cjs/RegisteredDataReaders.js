"use strict";
var SimpleDataReader_1 = require('./datareaders/SimpleDataReader');
var AsciiTableDataReader_1 = require('./datareaders/AsciiTableDataReader');
var BinaryTableDataReader_1 = require('./datareaders/BinaryTableDataReader');
var RandomGroupsDataReader_1 = require('./datareaders/RandomGroupsDataReader');
var CompressedImageReader_1 = require('./datareaders/CompressedImageReader');
exports.RegisteredDataReaders = [
    new SimpleDataReader_1.SimpleDataReader(),
    new AsciiTableDataReader_1.AsciiTableDataReader(),
    new BinaryTableDataReader_1.BinaryTableDataReader(),
    new RandomGroupsDataReader_1.RandomGroupsDataReader(),
    new CompressedImageReader_1.CompressedImageReader()
];
//# sourceMappingURL=RegisteredDataReaders.js.map