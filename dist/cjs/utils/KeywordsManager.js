"use strict";
var ValueConverters_1 = require('./ValueConverters');
var Interfaces_1 = require('../Interfaces');
var Keyword = (function () {
    function Keyword(key, value, comment) {
        if (value === void 0) { value = null; }
        if (comment === void 0) { comment = null; }
        this.key = key;
        this.value = value;
        this.comment = comment;
    }
    Keyword.isLastLine = function (line) {
        return line.indexOf('END     ', 0) === 0;
    };
    return Keyword;
}());
exports.Keyword = Keyword;
var KeywordsManager = (function () {
    function KeywordsManager() {
    }
    KeywordsManager.getConverterByName = function (name) {
        // first look for exact match
        if (name in ValueConverters_1.ValueConverters.registeredNames) {
            return ValueConverters_1.ValueConverters.registeredNames[name];
        }
        // then look for keywords that start with provided name
        var foundKeys = Object.keys(ValueConverters_1.ValueConverters.registeredPrefixedNames)
            .filter(function (k) { return name.indexOf(k) === 0; });
        if (foundKeys.length > 0) {
            return ValueConverters_1.ValueConverters.registeredPrefixedNames[foundKeys[0]];
        }
        else {
            return ValueConverters_1.ValueConverters.defaultConverter;
        }
    };
    KeywordsManager.isInt = function (num) {
        return typeof num === 'number' && parseFloat(num.toString()) === parseInt(num.toString(), 10) && !isNaN(num);
    };
    KeywordsManager.getConverterByType = function (type) {
        if (type in ValueConverters_1.ValueConverters.registeredTypes) {
            return ValueConverters_1.ValueConverters.registeredTypes[type];
        }
        return ValueConverters_1.ValueConverters.defaultConverter;
    };
    KeywordsManager.single = function (header, key) {
        return header.filter(function (k) { return k.key == key; })[0]; // undefined if not found
    };
    KeywordsManager.getValue = function (header, key, defaultValue) {
        var values = header.filter(function (k) { return k.key == key; });
        return values.length == 0 ? defaultValue : values[0].value;
    };
    KeywordsManager.hasValue = function (header, key, value) {
        return header.some(function (k) { return k.key == key && k.value == value; });
    };
    KeywordsManager.hasValueFromList = function (header, key, values) {
        return header.some(function (k) { return k.key == key && values.indexOf(k.value) > -1; });
    };
    KeywordsManager.convert = function (value) {
        var jsType = typeof value;
        if (jsType === 'number') {
            jsType = (KeywordsManager.isInt(value) ? 'int' : 'float');
        }
        if (jsType === 'object' ? value.getMonth : void 0) {
            jsType = 'date';
        }
        return KeywordsManager.getConverterByType(jsType);
    };
    KeywordsManager.convertBack = function (value, name) {
        var converter = KeywordsManager.getConverterByName(name);
        return converter.convertBack(value);
    };
    KeywordsManager.parseKeyword = function (line) {
        var keyword = new Keyword(line.substring(0, Interfaces_1.Constants.keyLength).trim());
        if (line.substr(Interfaces_1.Constants.keyLength, 2) === '= ') {
            if (line.charAt(31) === '/') {
                keyword.value = KeywordsManager.convertBack(line.substr(10, 21).trim(), keyword.key);
                keyword.comment = line.substr(32).trim();
            }
            else {
                var valueAndComment = line.substr(10, Interfaces_1.Constants.lineLength - 10);
                var slashIdx = valueAndComment.lastIndexOf(' /');
                var hasNoComment = slashIdx === -1;
                if (hasNoComment) {
                    keyword.value = KeywordsManager.convertBack(valueAndComment.trim(), keyword.key);
                }
                else {
                    keyword.value = KeywordsManager.convertBack(valueAndComment.substring(0, slashIdx).trim(), keyword.key);
                    keyword.comment = valueAndComment.substring(slashIdx + 1).trim();
                }
            }
        }
        else {
            var value = line.substr(Interfaces_1.Constants.keyLength, Interfaces_1.Constants.lineLength - Interfaces_1.Constants.keyLength);
            keyword.value = KeywordsManager.convertBack(value, keyword.key);
        }
        return keyword;
    };
    return KeywordsManager;
}());
exports.KeywordsManager = KeywordsManager;
//# sourceMappingURL=KeywordsManager.js.map