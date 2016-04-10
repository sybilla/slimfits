import { Constants } from "../Interfaces";
import { KeywordsManager } from "../utils/KeywordsManager";
import { AsciiConverter } from "../utils/AsciiConverter";
export class AsciiTableDataReader {
    canReadData(header) {
        return KeywordsManager.hasValue(header, "XTENSION", "TABLE");
    }
    readDataSize(header) {
        var rowsCount = KeywordsManager.getValue(header, "NAXIS2", 1);
        var rowLength = KeywordsManager.getValue(header, "NAXIS1", 1);
        return Math.ceil(rowLength * rowsCount / Constants.blockLength) * Constants.blockLength;
    }
    readDataAsync(file, offsetBytes, header) {
        var rowsCount = KeywordsManager.getValue(header, "NAXIS2", 1);
        var rowLength = KeywordsManager.getValue(header, "NAXIS1", 1);
        var fieldsCount = KeywordsManager.getValue(header, "TFIELDS", 0);
        var tforms = header.filter(k => k.key.indexOf('TFORM') === 0).map(k => AsciiConverter.getConverterFor(k.value, rowsCount));
        var asciiconverters = tforms.map(x => x.converter);
        var resultList = tforms.map(x => x.array);
        var positions = header.filter(k => k.key.indexOf('TBCOL') === 0)
            .map(k => k.value - 1).concat([rowLength]);
        if ((positions.length + 1) !== fieldsCount) {
            throw "There are " + positions.length + " 'TBCOL#' keywords whereas 'TFIELDS' specifies " + fieldsCount;
        }
        return file.getStringAsync(offsetBytes, rowLength * rowsCount).then((data) => {
            for (let rowIdx = 0; rowIdx < rowsCount; rowIdx++) {
                let line = data.substr(rowIdx * rowLength, rowLength);
                for (let posIdx = 0; posIdx < fieldsCount; posIdx++) {
                    var chunk = line.substr(positions[posIdx], positions[posIdx + 1] - positions[posIdx]);
                    resultList[posIdx][rowIdx] = asciiconverters[posIdx](chunk.trim());
                }
            }
            return resultList;
        });
    }
}
//# sourceMappingURL=AsciiTableDataReader.js.map