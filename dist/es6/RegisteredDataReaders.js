import { SimpleDataReader } from './datareaders/SimpleDataReader';
import { AsciiTableDataReader } from './datareaders/AsciiTableDataReader';
import { BinaryTableDataReader } from './datareaders/BinaryTableDataReader';
import { RandomGroupsDataReader } from './datareaders/RandomGroupsDataReader';
import { CompressedImageReader } from './datareaders/CompressedImageReader';
export var RegisteredDataReaders = [
    new SimpleDataReader(),
    new AsciiTableDataReader(),
    new BinaryTableDataReader(),
    new RandomGroupsDataReader(),
    new CompressedImageReader()
];
//# sourceMappingURL=RegisteredDataReaders.js.map