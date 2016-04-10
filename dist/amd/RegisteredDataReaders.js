define(["require", "exports", './datareaders/SimpleDataReader', './datareaders/AsciiTableDataReader', './datareaders/BinaryTableDataReader', './datareaders/RandomGroupsDataReader', './datareaders/CompressedImageReader'], function (require, exports, SimpleDataReader_1, AsciiTableDataReader_1, BinaryTableDataReader_1, RandomGroupsDataReader_1, CompressedImageReader_1) {
    "use strict";
    exports.RegisteredDataReaders = [
        new SimpleDataReader_1.SimpleDataReader(),
        new AsciiTableDataReader_1.AsciiTableDataReader(),
        new BinaryTableDataReader_1.BinaryTableDataReader(),
        new RandomGroupsDataReader_1.RandomGroupsDataReader(),
        new CompressedImageReader_1.CompressedImageReader()
    ];
});
//# sourceMappingURL=RegisteredDataReaders.js.map