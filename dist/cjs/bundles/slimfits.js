/**
  @license
  This is the repository for slimfits, a library for loading FITS files in JavaScript by Sybilla Technologies, sp. z o.o.

The library is available under different licenses depending on whether it is intended for commercial/government use, or for a personal or non-profit project.

- Commercial/governmnent: please contact us via info@sybillatechnologies.com
- Personal or non-profit: MIT (https://opensource.org/licenses/MIT)
 **/
"format register";
System.register("sybilla/Interfaces", [], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  "use strict";
  exports.Constants = {
    blockLength: 2880,
    lineLength: 80,
    keyLength: 8,
    maxKeywordsInBlock: 36
  };
  (function(BitPix) {
    BitPix[BitPix["Byte"] = 8] = "Byte";
    BitPix[BitPix["Char"] = 8] = "Char";
    BitPix[BitPix["Short"] = 16] = "Short";
    BitPix[BitPix["Integer"] = 32] = "Integer";
    BitPix[BitPix["Long"] = 64] = "Long";
    BitPix[BitPix["Float"] = -32] = "Float";
    BitPix[BitPix["Double"] = -64] = "Double";
    BitPix[BitPix["Unknown"] = 0] = "Unknown";
  })(exports.BitPix || (exports.BitPix = {}));
  var BitPix = exports.BitPix;
  var BitPixUtils = (function() {
    function BitPixUtils() {}
    BitPixUtils.getByteSize = function(type) {
      return Math.abs(type) / 8;
    };
    BitPixUtils.getBitPixForLetter = function(format) {
      switch (format) {
        case 'A':
          return BitPix.Byte;
        case 'B':
          return BitPix.Byte;
        case 'I':
          return BitPix.Short;
        case 'J':
          return BitPix.Integer;
        case 'K':
          return BitPix.Long;
        case 'E':
          return BitPix.Float;
        case 'D':
          return BitPix.Double;
        default:
          throw 'unrecognized format';
      }
    };
    return BitPixUtils;
  }());
  exports.BitPixUtils = BitPixUtils;
  global.define = __define;
  return module.exports;
});

System.register("sybilla/utils/ValueConverters", [], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  "use strict";
  var StringConverter = (function() {
    function StringConverter() {}
    StringConverter.prototype.convert = function(value) {
      return value.replace(/\'/g, "''");
    };
    StringConverter.prototype.convertBack = function(value) {
      if (value.charAt(0) === "'") {
        value = value.substr(1);
      }
      if (value.charAt(value.length - 1) === "'") {
        value = value.substr(0, value.length - 1);
      }
      return value.replace(/\'\'/g, "'").toString().trim();
    };
    return StringConverter;
  }());
  exports.StringConverter = StringConverter;
  var IntConverter = (function() {
    function IntConverter() {}
    IntConverter.prototype.convert = function(value) {
      return value.toString();
    };
    IntConverter.prototype.convertBack = function(value) {
      return parseInt(value);
    };
    return IntConverter;
  }());
  exports.IntConverter = IntConverter;
  var FloatConverter = (function() {
    function FloatConverter() {}
    FloatConverter.prototype.convert = function(value) {
      return value.toString();
    };
    FloatConverter.prototype.convertBack = function(value) {
      return parseFloat(value);
    };
    return FloatConverter;
  }());
  exports.FloatConverter = FloatConverter;
  var DateConverter = (function() {
    function DateConverter() {}
    DateConverter.prototype.convert = function(value) {
      console.warn('DateFitsValueConverter.convert not implemented.');
      return '';
    };
    DateConverter.prototype.convertBack = function(stringValue) {
      if (stringValue[0] === "'") {
        stringValue = stringValue.slice(1);
      }
      if (stringValue[stringValue.length - 1] === "'") {
        stringValue = stringValue.slice(0, stringValue.length - 1);
      }
      if (isNaN(Date.parse(stringValue))) {
        console.error('DateFitsValueConverter.convertBack error parsing ' + stringValue);
        return null;
      }
      return new Date(stringValue);
    };
    return DateConverter;
  }());
  exports.DateConverter = DateConverter;
  var BooleanConverter = (function() {
    function BooleanConverter() {}
    BooleanConverter.prototype.convert = function(value) {
      if (value) {
        return 'T';
      } else {
        return 'F';
      }
    };
    BooleanConverter.prototype.convertBack = function(stringValue) {
      return stringValue.toString().trim().toUpperCase() === 'T';
    };
    return BooleanConverter;
  }());
  exports.BooleanConverter = BooleanConverter;
  var BitPixConverter = (function() {
    function BitPixConverter() {}
    BitPixConverter.prototype.convert = function(value) {
      return value.toString();
    };
    BitPixConverter.prototype.convertBack = function(value) {
      return parseInt(value);
    };
    return BitPixConverter;
  }());
  exports.BitPixConverter = BitPixConverter;
  var registeredNames = {
    ZBITPIX: new BitPixConverter(),
    BITPIX: new BitPixConverter(),
    NAXIS: new IntConverter(),
    NAXIS1: new IntConverter(),
    NAXIS2: new IntConverter(),
    NAXIS3: new IntConverter(),
    YBINNING: new IntConverter(),
    XBINNING: new IntConverter(),
    PCOUNT: new IntConverter(),
    GCOUNT: new IntConverter(),
    NSEGMENT: new IntConverter(),
    BSCALE: new FloatConverter(),
    BZERO: new FloatConverter(),
    EPOCH: new StringConverter(),
    EQUINOX: new FloatConverter(),
    ALTRVAL: new FloatConverter(),
    ALTRPIX: new FloatConverter(),
    RESTFREQ: new FloatConverter(),
    DATAMAX: new FloatConverter(),
    DATAMIN: new FloatConverter(),
    RA: new FloatConverter(),
    DEC: new FloatConverter(),
    OBSRA: new FloatConverter(),
    OBSDEC: new FloatConverter(),
    XSHIFT: new FloatConverter(),
    YSHIFT: new FloatConverter(),
    SIMPLE: new BooleanConverter(),
    GROUPS: new BooleanConverter(),
    BLOCKED: new BooleanConverter(),
    EXTEND: new BooleanConverter(),
    SEQVALID: new BooleanConverter(),
    TFIELDS: new IntConverter(),
    ZIMAGE: new BooleanConverter(),
    ZVAL1: new IntConverter(),
    ZVAL2: new IntConverter()
  };
  var registeredPrefixedNames = {
    NAXIS: new IntConverter(),
    NSEG: new IntConverter(),
    CRVAL: new FloatConverter(),
    CDELT: new FloatConverter(),
    CRPIX: new FloatConverter(),
    CROTA: new FloatConverter(),
    PHAS: new FloatConverter(),
    PSCAL: new FloatConverter(),
    PZERO: new FloatConverter(),
    SDLT: new FloatConverter(),
    SRVL: new FloatConverter(),
    SRPX: new FloatConverter(),
    DBJD: new FloatConverter(),
    'THDA-': new FloatConverter()
  };
  var registeredTypes = {
    int: new IntConverter(),
    float: new FloatConverter(),
    string: new StringConverter(),
    date: new DateConverter(),
    boolean: new BooleanConverter()
  };
  exports.ValueConverters = {
    registeredNames: registeredNames,
    registeredPrefixedNames: registeredPrefixedNames,
    registeredTypes: registeredTypes,
    defaultConverter: new StringConverter()
  };
  global.define = __define;
  return module.exports;
});

(function() {
function define(){};  define.amd = {};
(function() {
  "use strict";
  function lib$es6$promise$utils$$objectOrFunction(x) {
    return typeof x === 'function' || (typeof x === 'object' && x !== null);
  }
  function lib$es6$promise$utils$$isFunction(x) {
    return typeof x === 'function';
  }
  function lib$es6$promise$utils$$isMaybeThenable(x) {
    return typeof x === 'object' && x !== null;
  }
  var lib$es6$promise$utils$$_isArray;
  if (!Array.isArray) {
    lib$es6$promise$utils$$_isArray = function(x) {
      return Object.prototype.toString.call(x) === '[object Array]';
    };
  } else {
    lib$es6$promise$utils$$_isArray = Array.isArray;
  }
  var lib$es6$promise$utils$$isArray = lib$es6$promise$utils$$_isArray;
  var lib$es6$promise$asap$$len = 0;
  var lib$es6$promise$asap$$vertxNext;
  var lib$es6$promise$asap$$customSchedulerFn;
  var lib$es6$promise$asap$$asap = function asap(callback, arg) {
    lib$es6$promise$asap$$queue[lib$es6$promise$asap$$len] = callback;
    lib$es6$promise$asap$$queue[lib$es6$promise$asap$$len + 1] = arg;
    lib$es6$promise$asap$$len += 2;
    if (lib$es6$promise$asap$$len === 2) {
      if (lib$es6$promise$asap$$customSchedulerFn) {
        lib$es6$promise$asap$$customSchedulerFn(lib$es6$promise$asap$$flush);
      } else {
        lib$es6$promise$asap$$scheduleFlush();
      }
    }
  };
  function lib$es6$promise$asap$$setScheduler(scheduleFn) {
    lib$es6$promise$asap$$customSchedulerFn = scheduleFn;
  }
  function lib$es6$promise$asap$$setAsap(asapFn) {
    lib$es6$promise$asap$$asap = asapFn;
  }
  var lib$es6$promise$asap$$browserWindow = (typeof window !== 'undefined') ? window : undefined;
  var lib$es6$promise$asap$$browserGlobal = lib$es6$promise$asap$$browserWindow || {};
  var lib$es6$promise$asap$$BrowserMutationObserver = lib$es6$promise$asap$$browserGlobal.MutationObserver || lib$es6$promise$asap$$browserGlobal.WebKitMutationObserver;
  var lib$es6$promise$asap$$isNode = typeof process !== 'undefined' && {}.toString.call(process) === '[object process]';
  var lib$es6$promise$asap$$isWorker = typeof Uint8ClampedArray !== 'undefined' && typeof importScripts !== 'undefined' && typeof MessageChannel !== 'undefined';
  function lib$es6$promise$asap$$useNextTick() {
    return function() {
      process.nextTick(lib$es6$promise$asap$$flush);
    };
  }
  function lib$es6$promise$asap$$useVertxTimer() {
    return function() {
      lib$es6$promise$asap$$vertxNext(lib$es6$promise$asap$$flush);
    };
  }
  function lib$es6$promise$asap$$useMutationObserver() {
    var iterations = 0;
    var observer = new lib$es6$promise$asap$$BrowserMutationObserver(lib$es6$promise$asap$$flush);
    var node = document.createTextNode('');
    observer.observe(node, {characterData: true});
    return function() {
      node.data = (iterations = ++iterations % 2);
    };
  }
  function lib$es6$promise$asap$$useMessageChannel() {
    var channel = new MessageChannel();
    channel.port1.onmessage = lib$es6$promise$asap$$flush;
    return function() {
      channel.port2.postMessage(0);
    };
  }
  function lib$es6$promise$asap$$useSetTimeout() {
    return function() {
      setTimeout(lib$es6$promise$asap$$flush, 1);
    };
  }
  var lib$es6$promise$asap$$queue = new Array(1000);
  function lib$es6$promise$asap$$flush() {
    for (var i = 0; i < lib$es6$promise$asap$$len; i += 2) {
      var callback = lib$es6$promise$asap$$queue[i];
      var arg = lib$es6$promise$asap$$queue[i + 1];
      callback(arg);
      lib$es6$promise$asap$$queue[i] = undefined;
      lib$es6$promise$asap$$queue[i + 1] = undefined;
    }
    lib$es6$promise$asap$$len = 0;
  }
  function lib$es6$promise$asap$$attemptVertx() {
    try {
      var r = require;
      var vertx = r('vertx');
      lib$es6$promise$asap$$vertxNext = vertx.runOnLoop || vertx.runOnContext;
      return lib$es6$promise$asap$$useVertxTimer();
    } catch (e) {
      return lib$es6$promise$asap$$useSetTimeout();
    }
  }
  var lib$es6$promise$asap$$scheduleFlush;
  if (lib$es6$promise$asap$$isNode) {
    lib$es6$promise$asap$$scheduleFlush = lib$es6$promise$asap$$useNextTick();
  } else if (lib$es6$promise$asap$$BrowserMutationObserver) {
    lib$es6$promise$asap$$scheduleFlush = lib$es6$promise$asap$$useMutationObserver();
  } else if (lib$es6$promise$asap$$isWorker) {
    lib$es6$promise$asap$$scheduleFlush = lib$es6$promise$asap$$useMessageChannel();
  } else if (lib$es6$promise$asap$$browserWindow === undefined && typeof require === 'function') {
    lib$es6$promise$asap$$scheduleFlush = lib$es6$promise$asap$$attemptVertx();
  } else {
    lib$es6$promise$asap$$scheduleFlush = lib$es6$promise$asap$$useSetTimeout();
  }
  function lib$es6$promise$then$$then(onFulfillment, onRejection) {
    var parent = this;
    var state = parent._state;
    if (state === lib$es6$promise$$internal$$FULFILLED && !onFulfillment || state === lib$es6$promise$$internal$$REJECTED && !onRejection) {
      return this;
    }
    var child = new this.constructor(lib$es6$promise$$internal$$noop);
    var result = parent._result;
    if (state) {
      var callback = arguments[state - 1];
      lib$es6$promise$asap$$asap(function() {
        lib$es6$promise$$internal$$invokeCallback(state, child, callback, result);
      });
    } else {
      lib$es6$promise$$internal$$subscribe(parent, child, onFulfillment, onRejection);
    }
    return child;
  }
  var lib$es6$promise$then$$default = lib$es6$promise$then$$then;
  function lib$es6$promise$promise$resolve$$resolve(object) {
    var Constructor = this;
    if (object && typeof object === 'object' && object.constructor === Constructor) {
      return object;
    }
    var promise = new Constructor(lib$es6$promise$$internal$$noop);
    lib$es6$promise$$internal$$resolve(promise, object);
    return promise;
  }
  var lib$es6$promise$promise$resolve$$default = lib$es6$promise$promise$resolve$$resolve;
  function lib$es6$promise$$internal$$noop() {}
  var lib$es6$promise$$internal$$PENDING = void 0;
  var lib$es6$promise$$internal$$FULFILLED = 1;
  var lib$es6$promise$$internal$$REJECTED = 2;
  var lib$es6$promise$$internal$$GET_THEN_ERROR = new lib$es6$promise$$internal$$ErrorObject();
  function lib$es6$promise$$internal$$selfFulfillment() {
    return new TypeError("You cannot resolve a promise with itself");
  }
  function lib$es6$promise$$internal$$cannotReturnOwn() {
    return new TypeError('A promises callback cannot return that same promise.');
  }
  function lib$es6$promise$$internal$$getThen(promise) {
    try {
      return promise.then;
    } catch (error) {
      lib$es6$promise$$internal$$GET_THEN_ERROR.error = error;
      return lib$es6$promise$$internal$$GET_THEN_ERROR;
    }
  }
  function lib$es6$promise$$internal$$tryThen(then, value, fulfillmentHandler, rejectionHandler) {
    try {
      then.call(value, fulfillmentHandler, rejectionHandler);
    } catch (e) {
      return e;
    }
  }
  function lib$es6$promise$$internal$$handleForeignThenable(promise, thenable, then) {
    lib$es6$promise$asap$$asap(function(promise) {
      var sealed = false;
      var error = lib$es6$promise$$internal$$tryThen(then, thenable, function(value) {
        if (sealed) {
          return ;
        }
        sealed = true;
        if (thenable !== value) {
          lib$es6$promise$$internal$$resolve(promise, value);
        } else {
          lib$es6$promise$$internal$$fulfill(promise, value);
        }
      }, function(reason) {
        if (sealed) {
          return ;
        }
        sealed = true;
        lib$es6$promise$$internal$$reject(promise, reason);
      }, 'Settle: ' + (promise._label || ' unknown promise'));
      if (!sealed && error) {
        sealed = true;
        lib$es6$promise$$internal$$reject(promise, error);
      }
    }, promise);
  }
  function lib$es6$promise$$internal$$handleOwnThenable(promise, thenable) {
    if (thenable._state === lib$es6$promise$$internal$$FULFILLED) {
      lib$es6$promise$$internal$$fulfill(promise, thenable._result);
    } else if (thenable._state === lib$es6$promise$$internal$$REJECTED) {
      lib$es6$promise$$internal$$reject(promise, thenable._result);
    } else {
      lib$es6$promise$$internal$$subscribe(thenable, undefined, function(value) {
        lib$es6$promise$$internal$$resolve(promise, value);
      }, function(reason) {
        lib$es6$promise$$internal$$reject(promise, reason);
      });
    }
  }
  function lib$es6$promise$$internal$$handleMaybeThenable(promise, maybeThenable, then) {
    if (maybeThenable.constructor === promise.constructor && then === lib$es6$promise$then$$default && constructor.resolve === lib$es6$promise$promise$resolve$$default) {
      lib$es6$promise$$internal$$handleOwnThenable(promise, maybeThenable);
    } else {
      if (then === lib$es6$promise$$internal$$GET_THEN_ERROR) {
        lib$es6$promise$$internal$$reject(promise, lib$es6$promise$$internal$$GET_THEN_ERROR.error);
      } else if (then === undefined) {
        lib$es6$promise$$internal$$fulfill(promise, maybeThenable);
      } else if (lib$es6$promise$utils$$isFunction(then)) {
        lib$es6$promise$$internal$$handleForeignThenable(promise, maybeThenable, then);
      } else {
        lib$es6$promise$$internal$$fulfill(promise, maybeThenable);
      }
    }
  }
  function lib$es6$promise$$internal$$resolve(promise, value) {
    if (promise === value) {
      lib$es6$promise$$internal$$reject(promise, lib$es6$promise$$internal$$selfFulfillment());
    } else if (lib$es6$promise$utils$$objectOrFunction(value)) {
      lib$es6$promise$$internal$$handleMaybeThenable(promise, value, lib$es6$promise$$internal$$getThen(value));
    } else {
      lib$es6$promise$$internal$$fulfill(promise, value);
    }
  }
  function lib$es6$promise$$internal$$publishRejection(promise) {
    if (promise._onerror) {
      promise._onerror(promise._result);
    }
    lib$es6$promise$$internal$$publish(promise);
  }
  function lib$es6$promise$$internal$$fulfill(promise, value) {
    if (promise._state !== lib$es6$promise$$internal$$PENDING) {
      return ;
    }
    promise._result = value;
    promise._state = lib$es6$promise$$internal$$FULFILLED;
    if (promise._subscribers.length !== 0) {
      lib$es6$promise$asap$$asap(lib$es6$promise$$internal$$publish, promise);
    }
  }
  function lib$es6$promise$$internal$$reject(promise, reason) {
    if (promise._state !== lib$es6$promise$$internal$$PENDING) {
      return ;
    }
    promise._state = lib$es6$promise$$internal$$REJECTED;
    promise._result = reason;
    lib$es6$promise$asap$$asap(lib$es6$promise$$internal$$publishRejection, promise);
  }
  function lib$es6$promise$$internal$$subscribe(parent, child, onFulfillment, onRejection) {
    var subscribers = parent._subscribers;
    var length = subscribers.length;
    parent._onerror = null;
    subscribers[length] = child;
    subscribers[length + lib$es6$promise$$internal$$FULFILLED] = onFulfillment;
    subscribers[length + lib$es6$promise$$internal$$REJECTED] = onRejection;
    if (length === 0 && parent._state) {
      lib$es6$promise$asap$$asap(lib$es6$promise$$internal$$publish, parent);
    }
  }
  function lib$es6$promise$$internal$$publish(promise) {
    var subscribers = promise._subscribers;
    var settled = promise._state;
    if (subscribers.length === 0) {
      return ;
    }
    var child,
        callback,
        detail = promise._result;
    for (var i = 0; i < subscribers.length; i += 3) {
      child = subscribers[i];
      callback = subscribers[i + settled];
      if (child) {
        lib$es6$promise$$internal$$invokeCallback(settled, child, callback, detail);
      } else {
        callback(detail);
      }
    }
    promise._subscribers.length = 0;
  }
  function lib$es6$promise$$internal$$ErrorObject() {
    this.error = null;
  }
  var lib$es6$promise$$internal$$TRY_CATCH_ERROR = new lib$es6$promise$$internal$$ErrorObject();
  function lib$es6$promise$$internal$$tryCatch(callback, detail) {
    try {
      return callback(detail);
    } catch (e) {
      lib$es6$promise$$internal$$TRY_CATCH_ERROR.error = e;
      return lib$es6$promise$$internal$$TRY_CATCH_ERROR;
    }
  }
  function lib$es6$promise$$internal$$invokeCallback(settled, promise, callback, detail) {
    var hasCallback = lib$es6$promise$utils$$isFunction(callback),
        value,
        error,
        succeeded,
        failed;
    if (hasCallback) {
      value = lib$es6$promise$$internal$$tryCatch(callback, detail);
      if (value === lib$es6$promise$$internal$$TRY_CATCH_ERROR) {
        failed = true;
        error = value.error;
        value = null;
      } else {
        succeeded = true;
      }
      if (promise === value) {
        lib$es6$promise$$internal$$reject(promise, lib$es6$promise$$internal$$cannotReturnOwn());
        return ;
      }
    } else {
      value = detail;
      succeeded = true;
    }
    if (promise._state !== lib$es6$promise$$internal$$PENDING) {} else if (hasCallback && succeeded) {
      lib$es6$promise$$internal$$resolve(promise, value);
    } else if (failed) {
      lib$es6$promise$$internal$$reject(promise, error);
    } else if (settled === lib$es6$promise$$internal$$FULFILLED) {
      lib$es6$promise$$internal$$fulfill(promise, value);
    } else if (settled === lib$es6$promise$$internal$$REJECTED) {
      lib$es6$promise$$internal$$reject(promise, value);
    }
  }
  function lib$es6$promise$$internal$$initializePromise(promise, resolver) {
    try {
      resolver(function resolvePromise(value) {
        lib$es6$promise$$internal$$resolve(promise, value);
      }, function rejectPromise(reason) {
        lib$es6$promise$$internal$$reject(promise, reason);
      });
    } catch (e) {
      lib$es6$promise$$internal$$reject(promise, e);
    }
  }
  function lib$es6$promise$promise$all$$all(entries) {
    return new lib$es6$promise$enumerator$$default(this, entries).promise;
  }
  var lib$es6$promise$promise$all$$default = lib$es6$promise$promise$all$$all;
  function lib$es6$promise$promise$race$$race(entries) {
    var Constructor = this;
    var promise = new Constructor(lib$es6$promise$$internal$$noop);
    if (!lib$es6$promise$utils$$isArray(entries)) {
      lib$es6$promise$$internal$$reject(promise, new TypeError('You must pass an array to race.'));
      return promise;
    }
    var length = entries.length;
    function onFulfillment(value) {
      lib$es6$promise$$internal$$resolve(promise, value);
    }
    function onRejection(reason) {
      lib$es6$promise$$internal$$reject(promise, reason);
    }
    for (var i = 0; promise._state === lib$es6$promise$$internal$$PENDING && i < length; i++) {
      lib$es6$promise$$internal$$subscribe(Constructor.resolve(entries[i]), undefined, onFulfillment, onRejection);
    }
    return promise;
  }
  var lib$es6$promise$promise$race$$default = lib$es6$promise$promise$race$$race;
  function lib$es6$promise$promise$reject$$reject(reason) {
    var Constructor = this;
    var promise = new Constructor(lib$es6$promise$$internal$$noop);
    lib$es6$promise$$internal$$reject(promise, reason);
    return promise;
  }
  var lib$es6$promise$promise$reject$$default = lib$es6$promise$promise$reject$$reject;
  var lib$es6$promise$promise$$counter = 0;
  function lib$es6$promise$promise$$needsResolver() {
    throw new TypeError('You must pass a resolver function as the first argument to the promise constructor');
  }
  function lib$es6$promise$promise$$needsNew() {
    throw new TypeError("Failed to construct 'Promise': Please use the 'new' operator, this object constructor cannot be called as a function.");
  }
  var lib$es6$promise$promise$$default = lib$es6$promise$promise$$Promise;
  function lib$es6$promise$promise$$Promise(resolver) {
    this._id = lib$es6$promise$promise$$counter++;
    this._state = undefined;
    this._result = undefined;
    this._subscribers = [];
    if (lib$es6$promise$$internal$$noop !== resolver) {
      typeof resolver !== 'function' && lib$es6$promise$promise$$needsResolver();
      this instanceof lib$es6$promise$promise$$Promise ? lib$es6$promise$$internal$$initializePromise(this, resolver) : lib$es6$promise$promise$$needsNew();
    }
  }
  lib$es6$promise$promise$$Promise.all = lib$es6$promise$promise$all$$default;
  lib$es6$promise$promise$$Promise.race = lib$es6$promise$promise$race$$default;
  lib$es6$promise$promise$$Promise.resolve = lib$es6$promise$promise$resolve$$default;
  lib$es6$promise$promise$$Promise.reject = lib$es6$promise$promise$reject$$default;
  lib$es6$promise$promise$$Promise._setScheduler = lib$es6$promise$asap$$setScheduler;
  lib$es6$promise$promise$$Promise._setAsap = lib$es6$promise$asap$$setAsap;
  lib$es6$promise$promise$$Promise._asap = lib$es6$promise$asap$$asap;
  lib$es6$promise$promise$$Promise.prototype = {
    constructor: lib$es6$promise$promise$$Promise,
    then: lib$es6$promise$then$$default,
    'catch': function(onRejection) {
      return this.then(null, onRejection);
    }
  };
  var lib$es6$promise$enumerator$$default = lib$es6$promise$enumerator$$Enumerator;
  function lib$es6$promise$enumerator$$Enumerator(Constructor, input) {
    this._instanceConstructor = Constructor;
    this.promise = new Constructor(lib$es6$promise$$internal$$noop);
    if (Array.isArray(input)) {
      this._input = input;
      this.length = input.length;
      this._remaining = input.length;
      this._result = new Array(this.length);
      if (this.length === 0) {
        lib$es6$promise$$internal$$fulfill(this.promise, this._result);
      } else {
        this.length = this.length || 0;
        this._enumerate();
        if (this._remaining === 0) {
          lib$es6$promise$$internal$$fulfill(this.promise, this._result);
        }
      }
    } else {
      lib$es6$promise$$internal$$reject(this.promise, this._validationError());
    }
  }
  lib$es6$promise$enumerator$$Enumerator.prototype._validationError = function() {
    return new Error('Array Methods must be provided an Array');
  };
  lib$es6$promise$enumerator$$Enumerator.prototype._enumerate = function() {
    var length = this.length;
    var input = this._input;
    for (var i = 0; this._state === lib$es6$promise$$internal$$PENDING && i < length; i++) {
      this._eachEntry(input[i], i);
    }
  };
  lib$es6$promise$enumerator$$Enumerator.prototype._eachEntry = function(entry, i) {
    var c = this._instanceConstructor;
    var resolve = c.resolve;
    if (resolve === lib$es6$promise$promise$resolve$$default) {
      var then = lib$es6$promise$$internal$$getThen(entry);
      if (then === lib$es6$promise$then$$default && entry._state !== lib$es6$promise$$internal$$PENDING) {
        this._settledAt(entry._state, i, entry._result);
      } else if (typeof then !== 'function') {
        this._remaining--;
        this._result[i] = entry;
      } else if (c === lib$es6$promise$promise$$default) {
        var promise = new c(lib$es6$promise$$internal$$noop);
        lib$es6$promise$$internal$$handleMaybeThenable(promise, entry, then);
        this._willSettleAt(promise, i);
      } else {
        this._willSettleAt(new c(function(resolve) {
          resolve(entry);
        }), i);
      }
    } else {
      this._willSettleAt(resolve(entry), i);
    }
  };
  lib$es6$promise$enumerator$$Enumerator.prototype._settledAt = function(state, i, value) {
    var promise = this.promise;
    if (promise._state === lib$es6$promise$$internal$$PENDING) {
      this._remaining--;
      if (state === lib$es6$promise$$internal$$REJECTED) {
        lib$es6$promise$$internal$$reject(promise, value);
      } else {
        this._result[i] = value;
      }
    }
    if (this._remaining === 0) {
      lib$es6$promise$$internal$$fulfill(promise, this._result);
    }
  };
  lib$es6$promise$enumerator$$Enumerator.prototype._willSettleAt = function(promise, i) {
    var enumerator = this;
    lib$es6$promise$$internal$$subscribe(promise, undefined, function(value) {
      enumerator._settledAt(lib$es6$promise$$internal$$FULFILLED, i, value);
    }, function(reason) {
      enumerator._settledAt(lib$es6$promise$$internal$$REJECTED, i, reason);
    });
  };
  function lib$es6$promise$polyfill$$polyfill() {
    var local;
    if (typeof global !== 'undefined') {
      local = global;
    } else if (typeof self !== 'undefined') {
      local = self;
    } else {
      try {
        local = Function('return this')();
      } catch (e) {
        throw new Error('polyfill failed because global object is unavailable in this environment');
      }
    }
    var P = local.Promise;
    if (P && Object.prototype.toString.call(P.resolve()) === '[object Promise]' && !P.cast) {
      return ;
    }
    local.Promise = lib$es6$promise$promise$$default;
  }
  var lib$es6$promise$polyfill$$default = lib$es6$promise$polyfill$$polyfill;
  var lib$es6$promise$umd$$ES6Promise = {
    'Promise': lib$es6$promise$promise$$default,
    'polyfill': lib$es6$promise$polyfill$$default
  };
  if (typeof define === 'function' && define['amd']) {
    System.register("es6-promise", [], false, function() {
      return lib$es6$promise$umd$$ES6Promise;
    });
  } else if (typeof module !== 'undefined' && module['exports']) {
    module['exports'] = lib$es6$promise$umd$$ES6Promise;
  } else if (typeof this !== 'undefined') {
    this['ES6Promise'] = lib$es6$promise$umd$$ES6Promise;
  }
  lib$es6$promise$polyfill$$default();
}).call(this);
})();
System.register("sybilla/datareaders/SimpleDataReader", ["sybilla/Interfaces", "sybilla/utils/KeywordsManager", "es6-promise"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  "use strict";
  var Interfaces_1 = require("sybilla/Interfaces");
  var KeywordsManager_1 = require("sybilla/utils/KeywordsManager");
  var es6_promise_1 = require("es6-promise");
  var SimpleDataReader = (function() {
    function SimpleDataReader() {}
    SimpleDataReader.prototype.canReadData = function(header) {
      return (KeywordsManager_1.KeywordsManager.hasValue(header, "SIMPLE", true) || KeywordsManager_1.KeywordsManager.hasValue(header, "XTENSION", "IMAGE")) && !KeywordsManager_1.KeywordsManager.hasValue(header, "GROUPS", true);
    };
    SimpleDataReader.prototype.readDataSize = function(header) {
      var elementType = KeywordsManager_1.KeywordsManager.getValue(header, "BITPIX", Interfaces_1.BitPix.Unknown);
      var elementTypeSize = Interfaces_1.BitPixUtils.getByteSize(elementType);
      if (KeywordsManager_1.KeywordsManager.hasValue(header, "NAXIS", 0)) {
        return 0;
      }
      var length = header.filter(function(k) {
        return k.key.indexOf('NAXIS') === 0 && k.key !== 'NAXIS';
      }).reduce(function(prev, cur) {
        return prev * cur.value;
      }, 1);
      return Math.ceil(elementTypeSize * length / Interfaces_1.Constants.blockLength) * Interfaces_1.Constants.blockLength;
    };
    SimpleDataReader.prototype.readDataAsync = function(file, offsetBytes, header, changeEndian) {
      if (changeEndian === void 0) {
        changeEndian = true;
      }
      var dataType = KeywordsManager_1.KeywordsManager.getValue(header, "BITPIX", Interfaces_1.BitPix.Unknown);
      var naxisKeywords = header.filter(function(k) {
        return k.key.indexOf("NAXIS", 0) === 0 && k.key !== "NAXIS";
      });
      var length = naxisKeywords.map(function(k) {
        return k.value;
      }).reduce(function(a, b) {
        return a * b;
      }, 1);
      var bscale = KeywordsManager_1.KeywordsManager.getValue(header, "BSCALE", 1);
      var bzero = KeywordsManager_1.KeywordsManager.getValue(header, "BZERO", 0);
      if (naxisKeywords.length > 0 && length !== 0) {
        var promise = file.getDataAsync(offsetBytes, length, dataType, changeEndian);
        if (bscale !== 1 || bzero !== 0) {
          return promise.then(function(data) {
            for (var i = 0; i < data.length; i++) {
              data[i] = data[i] * bscale + bzero;
            }
            return data;
          });
        } else {
          return promise;
        }
      } else {
        var arr = null;
        return es6_promise_1.Promise.resolve(arr);
      }
    };
    return SimpleDataReader;
  }());
  exports.SimpleDataReader = SimpleDataReader;
  global.define = __define;
  return module.exports;
});

System.register("sybilla/utils/AsciiConverter", [], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  "use strict";
  var RegexTemplates = (function() {
    function RegexTemplates() {}
    RegexTemplates.test = function(template, value) {
      return new RegExp(template).test(value);
    };
    RegexTemplates.String = 'A\\d{1,}';
    RegexTemplates.Integer = 'I\\d{1,}';
    RegexTemplates.Float = 'F\\d{1,}\\.?\\d{0,}';
    RegexTemplates.Double = '(D|E)\\d{1,}\\.?\\d{0,}';
    return RegexTemplates;
  }());
  var AsciiConverter = (function() {
    function AsciiConverter() {}
    AsciiConverter.getConverterFor = function(value, length) {
      if (RegexTemplates.test(RegexTemplates.String, value)) {
        return {
          converter: function(x) {
            return x;
          },
          array: new Array(length)
        };
      } else if (RegexTemplates.test(RegexTemplates.Integer, value)) {
        return {
          converter: function(x) {
            return x === '' ? 0 : parseInt(x);
          },
          array: new Int32Array(length)
        };
      } else if (RegexTemplates.test(RegexTemplates.Float, value)) {
        return {
          converter: function(x) {
            return x === '' ? 0 : parseFloat(x);
          },
          array: new Float32Array(length)
        };
      } else if (RegexTemplates.test(RegexTemplates.Double, value)) {
        return {
          converter: function(x) {
            return x === '' ? 0 : parseFloat(x);
          },
          array: new Float64Array(length)
        };
      } else {
        throw 'AsciiConvertManager: No converter registered for ' + value;
      }
    };
    return AsciiConverter;
  }());
  exports.AsciiConverter = AsciiConverter;
  global.define = __define;
  return module.exports;
});

System.register("sybilla/utils/ArrayUtils", ["sybilla/Interfaces"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  "use strict";
  var Interfaces_1 = require("sybilla/Interfaces");
  var ArrayUtils = (function() {
    function ArrayUtils() {}
    ArrayUtils.copy = function(source, target, sourceByteOffset, length, type, changeEndian) {
      if (changeEndian === void 0) {
        changeEndian = true;
      }
      if (length == 0) {
        throw 'Length of copied array cannot be 0';
      }
      if (type == Interfaces_1.BitPix.Unknown) {
        throw 'Unknown array element type';
      }
      var _a = [new Uint8Array(source), new Uint8Array(target)],
          sourceBytes = _a[0],
          targetBytes = _a[1];
      var bytesPerElement = Interfaces_1.BitPixUtils.getByteSize(type);
      var bytesLength = length * bytesPerElement;
      if (changeEndian && bytesPerElement !== 1) {
        for (var i = 0; i < length; i++) {
          for (var j = 0; j < bytesPerElement; j++) {
            targetBytes[bytesPerElement * i + j] = sourceBytes[sourceByteOffset + bytesPerElement * i + (bytesPerElement - (j + 1))];
          }
        }
      } else {
        for (var i = 0; i < bytesLength; i++) {
          targetBytes[i] = sourceBytes[sourceByteOffset + i];
        }
      }
    };
    ArrayUtils.generateTypedArray = function(bitPix, length) {
      if (length == 0) {
        throw 'Length of created array cannot be 0';
      }
      switch (bitPix) {
        case Interfaces_1.BitPix.Byte:
          {
            return new Uint8Array(length);
          }
        case Interfaces_1.BitPix.Short:
          {
            return new Int16Array(length);
          }
        case Interfaces_1.BitPix.Integer:
          {
            return new Int32Array(length);
          }
        case Interfaces_1.BitPix.Float:
          {
            return new Float32Array(length);
          }
        case Interfaces_1.BitPix.Double:
          {
            return new Float64Array(length);
          }
        default:
          throw 'Cannot create array of unknown type';
      }
    };
    ArrayUtils.pluckColumn = function(source, target, rows, rowByteWidth, rowByteOffset, width, type, changeEndian) {
      var _a = [new Uint8Array(source), new Uint8Array(target)],
          sourceBytes = _a[0],
          targetBytes = _a[1];
      var bytesPerElement = Interfaces_1.BitPixUtils.getByteSize(type);
      if (changeEndian && bytesPerElement !== 1) {
        for (var i = 0; i < rows; i++) {
          for (var j = 0; j < width; j++) {
            for (var k = 0; k < bytesPerElement; k++) {
              targetBytes[i * width * bytesPerElement + j * bytesPerElement + k] = sourceBytes[i * rowByteWidth + rowByteOffset + j * bytesPerElement + (bytesPerElement - (k + 1))];
            }
          }
        }
      } else {
        for (var i = 0; i < rows; i++) {
          for (var j = 0; j < width; j++) {
            for (var k = 0; k < bytesPerElement; k++) {
              targetBytes[i * width * bytesPerElement + j * bytesPerElement + k] = sourceBytes[i * rowByteWidth + rowByteOffset + j * bytesPerElement + k];
            }
          }
        }
      }
    };
    ArrayUtils.chunk = function(buffer, dataType, chunkSize) {
      var chunkByteSize = Interfaces_1.BitPixUtils.getByteSize(dataType) * chunkSize;
      var chunksNumber = buffer.byteLength / chunkByteSize;
      var column = [];
      switch (dataType) {
        case Interfaces_1.BitPix.Byte:
          {
            for (var i = 0; i < chunksNumber; i++) {
              column.push(new Uint8Array(buffer, i * chunkByteSize, chunkSize));
            }
            return column;
          }
        case Interfaces_1.BitPix.Short:
          {
            for (var i = 0; i < chunksNumber; i++) {
              column.push(new Int16Array(buffer, i * chunkByteSize, chunkSize));
            }
            return column;
          }
        case Interfaces_1.BitPix.Integer:
          {
            for (var i = 0; i < chunksNumber; i++) {
              column.push(new Int32Array(buffer, i * chunkByteSize, chunkSize));
            }
            return column;
          }
        case Interfaces_1.BitPix.Float:
          {
            for (var i = 0; i < chunksNumber; i++) {
              column.push(new Float32Array(buffer, i * chunkByteSize, chunkSize));
            }
            return column;
          }
        case Interfaces_1.BitPix.Double:
          {
            for (var i = 0; i < chunksNumber; i++) {
              column.push(new Float64Array(buffer, i * chunkByteSize, chunkSize));
            }
            return column;
          }
        default:
          throw 'Cannot create array of unknown type';
      }
    };
    return ArrayUtils;
  }());
  exports.ArrayUtils = ArrayUtils;
  global.define = __define;
  return module.exports;
});

System.register("sybilla/datareaders/RandomGroupsDataReader", ["sybilla/Interfaces", "sybilla/utils/KeywordsManager", "sybilla/utils/ArrayUtils"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  "use strict";
  var Interfaces_1 = require("sybilla/Interfaces");
  var KeywordsManager_1 = require("sybilla/utils/KeywordsManager");
  var ArrayUtils_1 = require("sybilla/utils/ArrayUtils");
  var RandomGroupsDataReader = (function() {
    function RandomGroupsDataReader() {}
    RandomGroupsDataReader.prototype.canReadData = function(header) {
      return KeywordsManager_1.KeywordsManager.hasValue(header, "GROUPS", true) && KeywordsManager_1.KeywordsManager.hasValue(header, "NAXIS1", 0);
    };
    RandomGroupsDataReader.prototype.readDataSize = function(header) {
      var elementType = KeywordsManager_1.KeywordsManager.getValue(header, "BITPIX", Interfaces_1.BitPix.Unknown);
      var groupLength = header.filter(function(k) {
        return k.key.indexOf('NAXIS') === 0 && k.key !== 'NAXIS' && k.key !== 'NAXIS1' && k.value !== 1;
      }).reduce(function(prev, cur) {
        return prev * cur.value;
      }, 1);
      var groupsCount = KeywordsManager_1.KeywordsManager.getValue(header, "GCOUNT", 0);
      var paramsLength = KeywordsManager_1.KeywordsManager.getValue(header, "PCOUNT", 0);
      var elementTypeSize = Interfaces_1.BitPixUtils.getByteSize(elementType);
      return Math.ceil(groupsCount * (paramsLength + groupLength) * elementTypeSize / Interfaces_1.Constants.blockLength) * Interfaces_1.Constants.blockLength;
    };
    RandomGroupsDataReader.prototype.readDataAsync = function(file, offsetBytes, header, changeEndian) {
      if (changeEndian === void 0) {
        changeEndian = true;
      }
      var elementType = KeywordsManager_1.KeywordsManager.getValue(header, "BITPIX", Interfaces_1.BitPix.Unknown);
      var elementTypeSize = Interfaces_1.BitPixUtils.getByteSize(elementType);
      var groupsCount = KeywordsManager_1.KeywordsManager.getValue(header, "GCOUNT", 0);
      var paramsLength = KeywordsManager_1.KeywordsManager.getValue(header, "PCOUNT", 0);
      var groupLength = header.filter(function(k) {
        return k.key.indexOf('NAXIS') === 0 && k.key !== 'NAXIS' && k.key !== 'NAXIS1' && k.value !== 1;
      }).reduce(function(prev, cur) {
        return prev * cur.value;
      }, 1);
      var paramsAndGroupLength = paramsLength + groupLength;
      var paramsByteLength = paramsLength * elementTypeSize;
      return file.getDataAsync(offsetBytes, paramsAndGroupLength * groupsCount, elementType, changeEndian).then(function(x) {
        var params = ArrayUtils_1.ArrayUtils.generateTypedArray(elementType, groupsCount * paramsLength);
        var data = ArrayUtils_1.ArrayUtils.generateTypedArray(elementType, groupsCount * groupLength);
        ArrayUtils_1.ArrayUtils.pluckColumn(x.buffer, params.buffer, groupsCount, paramsAndGroupLength * elementTypeSize, 0, paramsLength, elementType, false);
        ArrayUtils_1.ArrayUtils.pluckColumn(x.buffer, data.buffer, groupsCount, paramsAndGroupLength * elementTypeSize, paramsByteLength, groupLength, elementType, false);
        return {
          params: ArrayUtils_1.ArrayUtils.chunk(params.buffer, elementType, paramsLength),
          data: ArrayUtils_1.ArrayUtils.chunk(data.buffer, elementType, groupLength)
        };
      });
    };
    return RandomGroupsDataReader;
  }());
  exports.RandomGroupsDataReader = RandomGroupsDataReader;
  global.define = __define;
  return module.exports;
});

System.register("sybilla/utils/Rice", [], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  "use strict";
  var Rice = (function() {
    function Rice() {}
    Rice.getNonzeroCount = function() {
      var arr = new Uint8Array(256);
      var k = 1;
      for (var i = 1; i <= 8; i++) {
        for (var j = 0; j < Math.pow(2, i - 1); j++) {
          arr[k++] = i;
        }
      }
      return arr;
    };
    Rice.fits_rdecomp = function(c, array, nblock) {
      var nonzero_count = Rice.getNonzeroCount();
      var cPointer = 0;
      var fsbits = 5;
      var fsmax = 25;
      var bbits = (1 << fsbits) | 0;
      var lastpix = (new DataView(c.buffer)).getInt32(0, false);
      cPointer += 4;
      var b = c[cPointer++];
      var nbits = 8;
      for (var i = 0; i < array.length; ) {
        nbits -= fsbits;
        while (nbits < 0) {
          b = (b << 8) | c[cPointer++];
          nbits += 8;
        }
        var fs = (b >> nbits) - 1;
        b &= (1 << nbits) - 1;
        var imax = i + nblock;
        if (imax > array.length) {
          imax = array.length;
        }
        if (fs < 0) {
          for (; i < imax; i++) {
            array[i] = lastpix;
          }
        } else if (fs == fsmax) {
          for (; i < imax; i++) {
            var k = bbits - nbits;
            var diff = b << k;
            for (k -= 8; k >= 0; k -= 8) {
              b = c[cPointer++];
              diff |= b << k;
            }
            if (nbits > 0) {
              b = c[cPointer++];
              diff |= b >> (-k);
              b &= (1 << nbits) - 1;
            } else {
              b = 0;
            }
            if ((diff & 1) == 0) {
              diff = diff >> 1;
            } else {
              diff = ~(diff >> 1);
            }
            array[i] = diff + lastpix;
            lastpix = array[i];
          }
        } else {
          for (; i < imax; i++) {
            while (b == 0) {
              nbits += 8;
              b = c[cPointer++];
            }
            var nzero = nbits - nonzero_count[b];
            nbits -= nzero + 1;
            b ^= 1 << nbits;
            nbits -= fs;
            while (nbits < 0) {
              b = (b << 8) | (c[cPointer++]);
              nbits += 8;
            }
            var diff = (nzero << fs) | (b >> nbits);
            b &= (1 << nbits) - 1;
            if ((diff & 1) == 0) {
              diff = diff >> 1;
            } else {
              diff = ~(diff >> 1);
            }
            array[i] = diff + lastpix;
            lastpix = array[i];
          }
        }
      }
    };
    Rice.fits_rdecomp_short = function(c, array, nblock) {
      var nonzero_count = Rice.getNonzeroCount();
      var cPointer = 0;
      var fsbits = 4;
      var fsmax = 14;
      var bbits = 1 << fsbits;
      var lastpix = (new DataView(c.buffer)).getInt16(0, false);
      cPointer += 2;
      var b = c[cPointer++];
      var nbits = 8;
      for (var i = 0; i < array.length; ) {
        nbits -= fsbits;
        while (nbits < 0) {
          b = (b << 8) | c[cPointer++];
          nbits += 8;
        }
        var fs = (b >> nbits) - 1;
        b &= (1 << nbits) - 1;
        var imax = i + nblock;
        if (imax > array.length) {
          imax = array.length;
        }
        ;
        if (fs < 0) {
          for (; i < imax; i++) {
            array[i] = lastpix;
          }
        } else if (fs == fsmax) {
          for (; i < imax; i++) {
            var k = bbits - nbits;
            var diff = b << k;
            for (k -= 8; k >= 0; k -= 8) {
              b = c[cPointer++];
              diff |= b << k;
            }
            if (nbits > 0) {
              b = c[cPointer++];
              diff |= b >> (-k);
              b &= (1 << nbits) - 1;
            } else {
              b = 0;
            }
            if ((diff & 1) == 0) {
              diff = diff >> 1;
            } else {
              diff = ~(diff >> 1);
            }
            array[i] = diff + lastpix;
            lastpix = array[i];
          }
        } else {
          for (; i < imax; i++) {
            while (b == 0) {
              nbits += 8;
              b = c[cPointer++];
            }
            var nzero = nbits - nonzero_count[b];
            nbits -= nzero + 1;
            b ^= 1 << nbits;
            nbits -= fs;
            while (nbits < 0) {
              b = (b << 8) | c[cPointer++];
              nbits += 8;
            }
            var diff = (nzero << fs) | (b >> nbits);
            b &= (1 << nbits) - 1;
            if ((diff & 1) == 0) {
              diff = diff >> 1;
            } else {
              diff = ~(diff >> 1);
            }
            array[i] = diff + lastpix;
            lastpix = array[i];
          }
        }
      }
    };
    Rice.fits_rdecomp_byte = function(c, array, nblock) {
      var nonzero_count = Rice.getNonzeroCount();
      var cPointer = 0;
      var fsbits = 3;
      var fsmax = 6;
      var bbits = 1 << fsbits;
      var lastpix = c[0];
      cPointer += 1;
      var b = c[cPointer++];
      var nbits = 8;
      for (var i = 0; i < array.length; ) {
        nbits -= fsbits;
        while (nbits < 0) {
          b = (b << 8) | c[cPointer++];
          nbits += 8;
        }
        var fs = (b >> nbits) - 1;
        b &= (1 << nbits) - 1;
        var imax = i + nblock;
        if (imax > array.length) {
          imax = array.length;
        }
        if (fs < 0) {
          for (; i < imax; i++) {
            array[i] = lastpix;
          }
        } else if (fs == fsmax) {
          for (; i < imax; i++) {
            var k = bbits - nbits;
            var diff = b << k;
            for (k -= 8; k >= 0; k -= 8) {
              b = c[cPointer++];
              diff |= b << k;
            }
            if (nbits > 0) {
              b = c[cPointer++];
              diff |= b >> (-k);
              b &= (1 << nbits) - 1;
            } else {
              b = 0;
            }
            if ((diff & 1) == 0) {
              diff = diff >> 1;
            } else {
              diff = ~(diff >> 1);
            }
            array[i] = diff + lastpix;
            lastpix = array[i];
          }
        } else {
          for (; i < imax; i++) {
            while (b == 0) {
              nbits += 8;
              b = c[cPointer++];
            }
            var nzero = nbits - nonzero_count[b];
            nbits -= nzero + 1;
            b ^= 1 << nbits;
            nbits -= fs;
            while (nbits < 0) {
              b = (b << 8) | c[cPointer++];
              nbits += 8;
            }
            var diff = (nzero << fs) | (b >> nbits);
            b &= (1 << nbits) - 1;
            if ((diff & 1) == 0) {
              diff = diff >> 1;
            } else {
              diff = ~(diff >> 1);
            }
            array[i] = diff + lastpix;
            lastpix = array[i];
          }
        }
      }
    };
    return Rice;
  }());
  exports.Rice = Rice;
  global.define = __define;
  return module.exports;
});

System.register("sybilla/datasource/BlobFile", ["sybilla/Interfaces", "sybilla/utils/ArrayUtils", "es6-promise"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  "use strict";
  var Interfaces_1 = require("sybilla/Interfaces");
  var ArrayUtils_1 = require("sybilla/utils/ArrayUtils");
  var es6_promise_1 = require("es6-promise");
  var BlobFile = (function() {
    function BlobFile(file) {
      this.file = file;
      this.url = "";
      this.url = file.name;
    }
    BlobFile.prototype.initialize = function() {
      return es6_promise_1.Promise.resolve(true);
    };
    BlobFile.prototype.getByteLength = function() {
      return this.file.size;
    };
    BlobFile.prototype.getStringAsync = function(start, length) {
      var _this = this;
      return new es6_promise_1.Promise(function(resolve, reject) {
        var blob = _this.file.slice(start, start + length);
        var reader = new FileReader();
        reader.onloadend = function(evt) {
          var target = evt.target;
          if (target.readyState == target.DONE) {
            resolve(target.result);
          } else {
            reject(target.error);
          }
        };
        reader.readAsText(blob);
      });
    };
    BlobFile.prototype.getDataAsync = function(start, length, bitPix, changeEndian) {
      var _this = this;
      if (changeEndian === void 0) {
        changeEndian = true;
      }
      return new es6_promise_1.Promise(function(resolve, reject) {
        var blob = _this.file.slice(start, start + length * Interfaces_1.BitPixUtils.getByteSize(bitPix));
        var reader = new FileReader();
        reader.onloadend = function(evt) {
          var target = evt.target;
          if (target.readyState == target.DONE) {
            var typedArray = ArrayUtils_1.ArrayUtils.generateTypedArray(bitPix, length);
            ArrayUtils_1.ArrayUtils.copy(target.result, typedArray.buffer, start, length, bitPix, changeEndian);
            resolve(typedArray);
          } else {
            reject(target.error);
          }
        };
        reader.readAsArrayBuffer(blob);
      });
    };
    return BlobFile;
  }());
  exports.BlobFile = BlobFile;
  global.define = __define;
  return module.exports;
});

System.register("sybilla/utils/Header", [], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  "use strict";
  var __extends = (this && this.__extends) || function(d, b) {
    for (var p in b)
      if (b.hasOwnProperty(p))
        d[p] = b[p];
    function __() {
      this.constructor = d;
    }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  };
  var Header = (function() {
    function Header(name, value) {
      this.name = name;
      this.value = value;
    }
    return Header;
  }());
  exports.Header = Header;
  var AcceptRangeHeader = (function(_super) {
    __extends(AcceptRangeHeader, _super);
    function AcceptRangeHeader(from, length) {
      _super.call(this, 'Range', 'bytes=' + from + '-' + (from + length - 1));
      this.from = from;
      this.length = length;
    }
    return AcceptRangeHeader;
  }(Header));
  exports.AcceptRangeHeader = AcceptRangeHeader;
  global.define = __define;
  return module.exports;
});

System.register("sybilla/datasource/SingleRequestFile", ["sybilla/utils/PromiseUtils", "sybilla/utils/ArrayUtils", "es6-promise"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  "use strict";
  var PromiseUtils_1 = require("sybilla/utils/PromiseUtils");
  var ArrayUtils_1 = require("sybilla/utils/ArrayUtils");
  var es6_promise_1 = require("es6-promise");
  var SingleRequestFile = (function() {
    function SingleRequestFile(url) {
      this.url = url;
      this.data = null;
    }
    SingleRequestFile.prototype.initialize = function() {
      var _this = this;
      return PromiseUtils_1.PromiseUtils.getRequestAsync(this.url).then(function(xhr) {
        _this.data = xhr.response;
        return _this.data;
      });
    };
    SingleRequestFile.prototype.getByteLength = function() {
      return this.data != null ? this.data.byteLength : 0;
    };
    SingleRequestFile.prototype.getStringAsync = function(start, length) {
      return es6_promise_1.Promise.resolve(String.fromCharCode.apply(null, new Uint8Array(this.data, start, length)));
    };
    SingleRequestFile.prototype.getDataAsync = function(start, length, bitPix, changeEndian) {
      if (changeEndian === void 0) {
        changeEndian = true;
      }
      var typedArray = ArrayUtils_1.ArrayUtils.generateTypedArray(bitPix, length);
      ArrayUtils_1.ArrayUtils.copy(this.data, typedArray.buffer, start, length, bitPix, changeEndian);
      return es6_promise_1.Promise.resolve(typedArray);
    };
    return SingleRequestFile;
  }());
  exports.SingleRequestFile = SingleRequestFile;
  global.define = __define;
  return module.exports;
});

System.register("sybilla/utils/KeywordsManager", ["sybilla/utils/ValueConverters", "sybilla/Interfaces"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  "use strict";
  var ValueConverters_1 = require("sybilla/utils/ValueConverters");
  var Interfaces_1 = require("sybilla/Interfaces");
  var Keyword = (function() {
    function Keyword(key, value, comment) {
      if (value === void 0) {
        value = null;
      }
      if (comment === void 0) {
        comment = null;
      }
      this.key = key;
      this.value = value;
      this.comment = comment;
    }
    Keyword.isLastLine = function(line) {
      return line.indexOf('END     ', 0) === 0;
    };
    return Keyword;
  }());
  exports.Keyword = Keyword;
  var KeywordsManager = (function() {
    function KeywordsManager() {}
    KeywordsManager.getConverterByName = function(name) {
      if (name in ValueConverters_1.ValueConverters.registeredNames) {
        return ValueConverters_1.ValueConverters.registeredNames[name];
      }
      var foundKeys = Object.keys(ValueConverters_1.ValueConverters.registeredPrefixedNames).filter(function(k) {
        return name.indexOf(k) === 0;
      });
      if (foundKeys.length > 0) {
        return ValueConverters_1.ValueConverters.registeredPrefixedNames[foundKeys[0]];
      } else {
        return ValueConverters_1.ValueConverters.defaultConverter;
      }
    };
    KeywordsManager.isInt = function(num) {
      return typeof num === 'number' && parseFloat(num.toString()) === parseInt(num.toString(), 10) && !isNaN(num);
    };
    KeywordsManager.getConverterByType = function(type) {
      if (type in ValueConverters_1.ValueConverters.registeredTypes) {
        return ValueConverters_1.ValueConverters.registeredTypes[type];
      }
      return ValueConverters_1.ValueConverters.defaultConverter;
    };
    KeywordsManager.single = function(header, key) {
      return header.filter(function(k) {
        return k.key == key;
      })[0];
    };
    KeywordsManager.getValue = function(header, key, defaultValue) {
      var values = header.filter(function(k) {
        return k.key == key;
      });
      return values.length == 0 ? defaultValue : values[0].value;
    };
    KeywordsManager.hasValue = function(header, key, value) {
      return header.some(function(k) {
        return k.key == key && k.value == value;
      });
    };
    KeywordsManager.hasValueFromList = function(header, key, values) {
      return header.some(function(k) {
        return k.key == key && values.indexOf(k.value) > -1;
      });
    };
    KeywordsManager.convert = function(value) {
      var jsType = typeof value;
      if (jsType === 'number') {
        jsType = (KeywordsManager.isInt(value) ? 'int' : 'float');
      }
      if (jsType === 'object' ? value.getMonth : void 0) {
        jsType = 'date';
      }
      return KeywordsManager.getConverterByType(jsType);
    };
    KeywordsManager.convertBack = function(value, name) {
      var converter = KeywordsManager.getConverterByName(name);
      return converter.convertBack(value);
    };
    KeywordsManager.parseKeyword = function(line) {
      var keyword = new Keyword(line.substring(0, Interfaces_1.Constants.keyLength).trim());
      if (line.substr(Interfaces_1.Constants.keyLength, 2) === '= ') {
        if (line.charAt(31) === '/') {
          keyword.value = KeywordsManager.convertBack(line.substr(10, 21).trim(), keyword.key);
          keyword.comment = line.substr(32).trim();
        } else {
          var valueAndComment = line.substr(10, Interfaces_1.Constants.lineLength - 10);
          var slashIdx = valueAndComment.lastIndexOf(' /');
          var hasNoComment = slashIdx === -1;
          if (hasNoComment) {
            keyword.value = KeywordsManager.convertBack(valueAndComment.trim(), keyword.key);
          } else {
            keyword.value = KeywordsManager.convertBack(valueAndComment.substring(0, slashIdx).trim(), keyword.key);
            keyword.comment = valueAndComment.substring(slashIdx + 1).trim();
          }
        }
      } else {
        var value = line.substr(Interfaces_1.Constants.keyLength, Interfaces_1.Constants.lineLength - Interfaces_1.Constants.keyLength);
        keyword.value = KeywordsManager.convertBack(value, keyword.key);
      }
      return keyword;
    };
    return KeywordsManager;
  }());
  exports.KeywordsManager = KeywordsManager;
  global.define = __define;
  return module.exports;
});

System.register("sybilla/utils/PromiseUtils", ["es6-promise"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  "use strict";
  var es6_promise_1 = require("es6-promise");
  var PromiseUtils = (function() {
    function PromiseUtils() {}
    PromiseUtils.getRequestAsync = function(url, method, responseType, headers) {
      if (method === void 0) {
        method = 'GET';
      }
      if (responseType === void 0) {
        responseType = 'arraybuffer';
      }
      if (headers === void 0) {
        headers = [];
      }
      return new es6_promise_1.Promise(function(resolve, reject) {
        var xhr = new XMLHttpRequest();
        xhr.open(method, url);
        xhr.responseType = responseType;
        headers.forEach(function(h) {
          xhr.setRequestHeader(h.name, h.value);
        });
        xhr.onload = function() {
          if (this.status >= 200 && this.status < 300) {
            resolve(xhr);
          } else {
            reject({
              status: this.status,
              statusText: xhr.statusText
            });
          }
        };
        xhr.onerror = function() {
          reject({
            status: this.status,
            statusText: xhr.statusText
          });
        };
        xhr.send();
      });
    };
    PromiseUtils.promiseWhile = function(condition, action) {
      return new es6_promise_1.Promise(function(resolve, reject) {
        var loop = function() {
          if (!condition()) {
            resolve(undefined);
          } else {
            return new es6_promise_1.Promise(function(resolve, reject) {
              try {
                resolve(action());
              } catch (err) {
                reject(err);
              }
            }).then(loop).catch(function(err) {
              return reject(err);
            });
          }
          return null;
        };
        setTimeout(loop, 30);
      });
    };
    return PromiseUtils;
  }());
  exports.PromiseUtils = PromiseUtils;
  global.define = __define;
  return module.exports;
});

System.register("sybilla/datareaders/AsciiTableDataReader", ["sybilla/Interfaces", "sybilla/utils/KeywordsManager", "sybilla/utils/AsciiConverter"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  "use strict";
  var Interfaces_1 = require("sybilla/Interfaces");
  var KeywordsManager_1 = require("sybilla/utils/KeywordsManager");
  var AsciiConverter_1 = require("sybilla/utils/AsciiConverter");
  var AsciiTableDataReader = (function() {
    function AsciiTableDataReader() {}
    AsciiTableDataReader.prototype.canReadData = function(header) {
      return KeywordsManager_1.KeywordsManager.hasValue(header, "XTENSION", "TABLE");
    };
    AsciiTableDataReader.prototype.readDataSize = function(header) {
      var rowsCount = KeywordsManager_1.KeywordsManager.getValue(header, "NAXIS2", 1);
      var rowLength = KeywordsManager_1.KeywordsManager.getValue(header, "NAXIS1", 1);
      return Math.ceil(rowLength * rowsCount / Interfaces_1.Constants.blockLength) * Interfaces_1.Constants.blockLength;
    };
    AsciiTableDataReader.prototype.readDataAsync = function(file, offsetBytes, header) {
      var rowsCount = KeywordsManager_1.KeywordsManager.getValue(header, "NAXIS2", 1);
      var rowLength = KeywordsManager_1.KeywordsManager.getValue(header, "NAXIS1", 1);
      var fieldsCount = KeywordsManager_1.KeywordsManager.getValue(header, "TFIELDS", 0);
      var tforms = header.filter(function(k) {
        return k.key.indexOf('TFORM') === 0;
      }).map(function(k) {
        return AsciiConverter_1.AsciiConverter.getConverterFor(k.value, rowsCount);
      });
      var asciiconverters = tforms.map(function(x) {
        return x.converter;
      });
      var resultList = tforms.map(function(x) {
        return x.array;
      });
      var positions = header.filter(function(k) {
        return k.key.indexOf('TBCOL') === 0;
      }).map(function(k) {
        return k.value - 1;
      }).concat([rowLength]);
      if ((positions.length + 1) !== fieldsCount) {
        throw "There are " + positions.length + " 'TBCOL#' keywords whereas 'TFIELDS' specifies " + fieldsCount;
      }
      return file.getStringAsync(offsetBytes, rowLength * rowsCount).then(function(data) {
        for (var rowIdx = 0; rowIdx < rowsCount; rowIdx++) {
          var line = data.substr(rowIdx * rowLength, rowLength);
          for (var posIdx = 0; posIdx < fieldsCount; posIdx++) {
            var chunk = line.substr(positions[posIdx], positions[posIdx + 1] - positions[posIdx]);
            resultList[posIdx][rowIdx] = asciiconverters[posIdx](chunk.trim());
          }
        }
        return resultList;
      });
    };
    return AsciiTableDataReader;
  }());
  exports.AsciiTableDataReader = AsciiTableDataReader;
  global.define = __define;
  return module.exports;
});

System.register("sybilla/datareaders/BinaryTableDataReader", ["sybilla/Interfaces", "sybilla/utils/KeywordsManager", "sybilla/utils/ArrayUtils"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  "use strict";
  var Interfaces_1 = require("sybilla/Interfaces");
  var KeywordsManager_1 = require("sybilla/utils/KeywordsManager");
  var ArrayUtils_1 = require("sybilla/utils/ArrayUtils");
  var BinaryTableDataReader = (function() {
    function BinaryTableDataReader() {}
    BinaryTableDataReader.prototype.canReadData = function(header) {
      return KeywordsManager_1.KeywordsManager.hasValueFromList(header, "XTENSION", ["BINTABLE", "A3DTABLE"]) && !KeywordsManager_1.KeywordsManager.hasValue(header, "ZIMAGE", true);
    };
    BinaryTableDataReader.prototype.readDataSize = function(header) {
      var rowsCount = KeywordsManager_1.KeywordsManager.getValue(header, "NAXIS2", 1);
      var rowByteLength = KeywordsManager_1.KeywordsManager.getValue(header, "NAXIS1", 1);
      return Math.ceil(rowByteLength * rowsCount / Interfaces_1.Constants.blockLength) * Interfaces_1.Constants.blockLength;
    };
    BinaryTableDataReader.prototype.readColumn = function(source, rows, rowByteWidth, rowByteOffset, width, format) {
      if (width == 0) {
        return [];
      }
      var dataType = format == "A" ? Interfaces_1.BitPix.Byte : Interfaces_1.BitPixUtils.getBitPixForLetter(format);
      var buffer = new ArrayBuffer(Interfaces_1.BitPixUtils.getByteSize(dataType) * rows * width);
      ArrayUtils_1.ArrayUtils.pluckColumn(source, buffer, rows, rowByteWidth, rowByteOffset, width, dataType, true);
      var chunks = ArrayUtils_1.ArrayUtils.chunk(buffer, dataType, width);
      return format == "A" ? chunks.map(function(x) {
        return String.fromCharCode.apply(null, x);
      }) : chunks;
    };
    BinaryTableDataReader.prototype.readDataAsync = function(file, offsetBytes, header) {
      var _this = this;
      var rowsCount = KeywordsManager_1.KeywordsManager.getValue(header, "NAXIS2", 0);
      var rowByteLength = KeywordsManager_1.KeywordsManager.getValue(header, "NAXIS1", 0);
      var rowByteOffset = 0;
      var isValidTFORM = new RegExp("\\d+\\w");
      var converters = header.filter(function(k) {
        return k.key.indexOf("TFORM") === 0 && isValidTFORM.test(k.value);
      }).map(function(k) {
        var format = k.value.substr(k.value.length - 1, 1);
        var count = parseInt(k.value.substr(0, k.value.length - 1));
        var byteOffset = rowByteOffset;
        var dataType = format == "A" ? Interfaces_1.BitPix.Byte : Interfaces_1.BitPixUtils.getBitPixForLetter(format);
        rowByteOffset += count * Interfaces_1.BitPixUtils.getByteSize(dataType);
        return {
          format: format,
          count: count,
          byteOffset: byteOffset
        };
      });
      return file.getDataAsync(offsetBytes, rowsCount * rowByteLength, Interfaces_1.BitPix.Byte).then(function(data) {
        return converters.map(function(conv) {
          return _this.readColumn(data.buffer, rowsCount, rowByteLength, conv.byteOffset, conv.count, conv.format);
        });
      });
    };
    return BinaryTableDataReader;
  }());
  exports.BinaryTableDataReader = BinaryTableDataReader;
  global.define = __define;
  return module.exports;
});

System.register("sybilla/datareaders/CompressedImageReader", ["sybilla/Interfaces", "sybilla/utils/KeywordsManager", "sybilla/utils/Rice", "es6-promise"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  "use strict";
  var Interfaces_1 = require("sybilla/Interfaces");
  var KeywordsManager_1 = require("sybilla/utils/KeywordsManager");
  var Rice_1 = require("sybilla/utils/Rice");
  var es6_promise_1 = require("es6-promise");
  var CompressedImageReader = (function() {
    function CompressedImageReader() {}
    CompressedImageReader.prototype.canReadData = function(header) {
      return KeywordsManager_1.KeywordsManager.hasValueFromList(header, "XTENSION", ["BINTABLE", "A3DTABLE"]) && KeywordsManager_1.KeywordsManager.hasValue(header, "ZIMAGE", true);
    };
    CompressedImageReader.prototype.readDataSize = function(header) {
      var pCountLength = KeywordsManager_1.KeywordsManager.getValue(header, "PCOUNT", 0);
      var rowsCount = KeywordsManager_1.KeywordsManager.getValue(header, "NAXIS2", 0);
      var pointerWidth = Interfaces_1.BitPixUtils.getByteSize(Interfaces_1.BitPix.Integer);
      var pointerTableByteLength = 2 * rowsCount * pointerWidth;
      return Math.ceil((pCountLength + pointerTableByteLength) / Interfaces_1.Constants.blockLength) * Interfaces_1.Constants.blockLength;
    };
    CompressedImageReader.convertToTiles = function(pointers, compressedData) {
      var tiles = [];
      var rowsCount = pointers.length / 2;
      for (var i = 0; i < rowsCount; i++) {
        tiles.push(new Uint8Array(compressedData.buffer, pointers[2 * i + 1], pointers[2 * i]));
      }
      return tiles;
    };
    CompressedImageReader.riceExtract = function(compressedTile, blockSize, bytePix) {
      return compressedTile;
    };
    CompressedImageReader.prototype.readDataAsync = function(file, offsetBytes, header) {
      var rowsCount = KeywordsManager_1.KeywordsManager.getValue(header, "NAXIS2", 0);
      var rowLength = KeywordsManager_1.KeywordsManager.getValue(header, "NAXIS1", 0);
      var fieldsCount = KeywordsManager_1.KeywordsManager.getValue(header, "TFIELDS", 0);
      var rowElementsCount = 0;
      var regex = new RegExp("\\d{0,}\\D");
      var arrayTFORM = new RegExp("([01]{0,1})([PQ])([ABIJKED])\\((\\d+)\\)");
      var heapOffset = KeywordsManager_1.KeywordsManager.getValue(header, "THEAP", 0);
      var heapSize = KeywordsManager_1.KeywordsManager.getValue(header, "PCOUNT", 0);
      var gCountLength = KeywordsManager_1.KeywordsManager.getValue(header, "GCOUNT", 0);
      var compressionType = KeywordsManager_1.KeywordsManager.getValue(header, "ZCMPTYPE", "");
      var containsVariableArray = header.filter(function(k) {
        return k.key.indexOf("TFORM") == 0;
      }).some(function(kv) {
        return arrayTFORM.test(kv.value);
      });
      if (containsVariableArray) {
        var imageInfo = header.filter(function(k) {
          return (k.key.indexOf("TFORM") == 0) && arrayTFORM.test(k.value);
        })[0];
        var result = arrayTFORM.exec(imageInfo.value);
        var pointerFormat = result[2];
        var elementFormat = result[3];
        var count = parseInt(result[4]);
        if (pointerFormat !== "P") {
          throw "Pointer format other than Int32 unsupported";
        }
        if (elementFormat !== "B") {
          throw "Element format other than Byte currently unsupported";
        }
        if (compressionType !== "RICE_1") {
          throw "Decompression other than Rice is not currently supported";
        }
        var ztiles = header.filter(function(k) {
          return k.key.indexOf("ZTILE") == 0 && (k.key !== "ZTILE");
        });
        var tileLinearSize = ztiles.reduce(function(x, y) {
          return x * y.value;
        }, 1);
        var riceBlockSize = KeywordsManager_1.KeywordsManager.getValue(header, "ZVAL1", 32);
        var riceByteWidth = KeywordsManager_1.KeywordsManager.getValue(header, "ZVAL2", 4);
        var bitpix = KeywordsManager_1.KeywordsManager.getValue(header, "ZBITPIX", Interfaces_1.BitPix.Unknown);
        var pointerWidth = Interfaces_1.BitPixUtils.getByteSize(Interfaces_1.BitPix.Integer);
        var pointerTableLength = 2 * rowsCount;
        var pointerTableByteLength = pointerTableLength * pointerWidth;
        var promises = [file.getDataAsync(offsetBytes, pointerTableLength, Interfaces_1.BitPix.Integer), file.getDataAsync(offsetBytes + pointerTableByteLength, heapSize, Interfaces_1.BitPix.Byte)];
        return es6_promise_1.Promise.all(promises).then(function(results) {
          var tiles = CompressedImageReader.convertToTiles(results[0], results[1]);
          var uncompressed = [];
          var tileByteSize = riceBlockSize / 8 * tileLinearSize;
          var uncompressedBuffer = new ArrayBuffer(tileByteSize * tiles.length);
          var bscale = KeywordsManager_1.KeywordsManager.getValue(header, "BSCALE", 1);
          var bzero = KeywordsManager_1.KeywordsManager.getValue(header, "BZERO", 0);
          if (riceByteWidth == Interfaces_1.BitPixUtils.getByteSize(Interfaces_1.BitPix.Integer)) {
            uncompressed = tiles.map(function(tile, index) {
              var out = new Int32Array(uncompressedBuffer, index * tileByteSize, tileLinearSize);
              Rice_1.Rice.fits_rdecomp(tile, out, riceBlockSize);
              var i = tile.length;
              while (i--) {
                out[i] = bscale * out[i] + bzero;
              }
              return out;
            });
          } else if (riceByteWidth == Interfaces_1.BitPixUtils.getByteSize(Interfaces_1.BitPix.Short)) {
            uncompressed = tiles.map(function(tile, index) {
              var out = new Int16Array(uncompressedBuffer, index * tileByteSize, tileLinearSize);
              Rice_1.Rice.fits_rdecomp_short(tile, out, riceBlockSize);
              var i = tile.length;
              while (i--) {
                out[i] = bscale * out[i] + bzero;
              }
              return out;
            });
          } else if (riceByteWidth == Interfaces_1.BitPixUtils.getByteSize(Interfaces_1.BitPix.Byte)) {
            uncompressed = tiles.map(function(tile, index) {
              var out = new Uint8Array(uncompressedBuffer, index * tileByteSize, tileLinearSize);
              Rice_1.Rice.fits_rdecomp_byte(tile, out, riceBlockSize);
              var i = tile.length;
              while (i--) {
                out[i] = bscale * out[i] + bzero;
              }
              return out;
            });
          }
          return uncompressed;
        });
      } else {
        throw "Compressed image should have one variable column.";
      }
    };
    return CompressedImageReader;
  }());
  exports.CompressedImageReader = CompressedImageReader;
  global.define = __define;
  return module.exports;
});

System.register("sybilla/datasource/MultipleRequestFile", ["sybilla/utils/Header", "sybilla/utils/PromiseUtils", "sybilla/utils/ArrayUtils"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  "use strict";
  var Header_1 = require("sybilla/utils/Header");
  var PromiseUtils_1 = require("sybilla/utils/PromiseUtils");
  var ArrayUtils_1 = require("sybilla/utils/ArrayUtils");
  var MultipleRequestFile = (function() {
    function MultipleRequestFile(url) {
      this.url = url;
      this.size = 0;
    }
    MultipleRequestFile.parseHeaders = function(headerStr) {
      return !headerStr ? [] : headerStr.split('\u000d\u000a').filter(function(x) {
        return x !== '' || x.trim() !== '';
      }).map(function(pair) {
        var index = pair.indexOf('\u003a\u0020');
        return index > 0 ? new Header_1.Header(pair.substring(0, index), pair.substring(index + 2)) : null;
      });
    };
    MultipleRequestFile.prototype.initialize = function() {
      var _this = this;
      return PromiseUtils_1.PromiseUtils.getRequestAsync(this.url, 'HEAD', 'text').then(function(xhr) {
        var headers = MultipleRequestFile.parseHeaders(xhr.getAllResponseHeaders());
        if (headers.some(function(h) {
          return (h.name == 'Accept-Ranges') && (h.value == 'bytes');
        })) {
          var s = headers.filter(function(h) {
            return h.name == 'Content-Length';
          });
          _this.size = parseInt(s[0].value);
          return null;
        } else {
          throw 'File does not support Ranges request keyword';
        }
      });
    };
    MultipleRequestFile.prototype.getByteLength = function() {
      return this.size;
    };
    MultipleRequestFile.prototype.getStringAsync = function(start, byteLength) {
      var headers = [new Header_1.AcceptRangeHeader(start, byteLength)];
      return PromiseUtils_1.PromiseUtils.getRequestAsync(this.url, 'GET', 'text', headers).then(function(xhr) {
        return xhr.responseText;
      });
    };
    MultipleRequestFile.prototype.getDataAsync = function(start, length, bitPix, changeEndian) {
      if (changeEndian === void 0) {
        changeEndian = true;
      }
      var typedArray = ArrayUtils_1.ArrayUtils.generateTypedArray(bitPix, length);
      var byteLength = typedArray.BYTES_PER_ELEMENT * length;
      var headers = [new Header_1.AcceptRangeHeader(start, byteLength)];
      return PromiseUtils_1.PromiseUtils.getRequestAsync(this.url, 'GET', 'arraybuffer', headers).then(function(xhr) {
        var source = xhr.response;
        ArrayUtils_1.ArrayUtils.copy(source, typedArray.buffer, 0, length, bitPix, changeEndian);
        return typedArray;
      });
    };
    return MultipleRequestFile;
  }());
  exports.MultipleRequestFile = MultipleRequestFile;
  global.define = __define;
  return module.exports;
});

System.register("sybilla/RegisteredDataReaders", ["sybilla/datareaders/SimpleDataReader", "sybilla/datareaders/AsciiTableDataReader", "sybilla/datareaders/BinaryTableDataReader", "sybilla/datareaders/RandomGroupsDataReader", "sybilla/datareaders/CompressedImageReader"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  "use strict";
  var SimpleDataReader_1 = require("sybilla/datareaders/SimpleDataReader");
  var AsciiTableDataReader_1 = require("sybilla/datareaders/AsciiTableDataReader");
  var BinaryTableDataReader_1 = require("sybilla/datareaders/BinaryTableDataReader");
  var RandomGroupsDataReader_1 = require("sybilla/datareaders/RandomGroupsDataReader");
  var CompressedImageReader_1 = require("sybilla/datareaders/CompressedImageReader");
  exports.RegisteredDataReaders = [new SimpleDataReader_1.SimpleDataReader(), new AsciiTableDataReader_1.AsciiTableDataReader(), new BinaryTableDataReader_1.BinaryTableDataReader(), new RandomGroupsDataReader_1.RandomGroupsDataReader(), new CompressedImageReader_1.CompressedImageReader()];
  global.define = __define;
  return module.exports;
});

System.register("sybilla/FitsReader", ["sybilla/Interfaces", "sybilla/utils/KeywordsManager", "sybilla/utils/PromiseUtils", "sybilla/RegisteredDataReaders"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  "use strict";
  var Interfaces_1 = require("sybilla/Interfaces");
  var KeywordsManager_1 = require("sybilla/utils/KeywordsManager");
  var PromiseUtils_1 = require("sybilla/utils/PromiseUtils");
  var RegisteredDataReaders_1 = require("sybilla/RegisteredDataReaders");
  var FitsReader = (function() {
    function FitsReader() {}
    FitsReader.readFitsAsync = function(file) {
      var hdus = [];
      var offsetBytes = 0;
      return PromiseUtils_1.PromiseUtils.promiseWhile(function() {
        return offsetBytes < file.getByteLength();
      }, function() {
        return FitsReader.readHduAsync(file, offsetBytes).then(function(hdu) {
          hdus.push(hdu);
          offsetBytes += hdu.bytesRead;
        });
      }).then(function() {
        return hdus;
      });
    };
    FitsReader.readHeaderAsync = function(file, offsetBytes) {
      var endLineFound = false;
      var keywords = [];
      var bytesRead = 0;
      return PromiseUtils_1.PromiseUtils.promiseWhile(function() {
        return !endLineFound;
      }, function() {
        return file.getStringAsync(offsetBytes + bytesRead, Interfaces_1.Constants.blockLength).then(function(block) {
          bytesRead += Interfaces_1.Constants.blockLength;
          for (var j = 0; j < Interfaces_1.Constants.maxKeywordsInBlock; j++) {
            var line = block.substring(j * Interfaces_1.Constants.lineLength, (j + 1) * Interfaces_1.Constants.lineLength);
            endLineFound = KeywordsManager_1.Keyword.isLastLine(line);
            if (endLineFound) {
              break;
            }
            keywords.push(KeywordsManager_1.KeywordsManager.parseKeyword(line));
          }
          return null;
        });
      }).then(function() {
        return {
          header: keywords,
          bytesRead: bytesRead
        };
      });
    };
    FitsReader.readHduAsync = function(file, offsetBytes) {
      var hdu = {
        header: null,
        data: null,
        bytesRead: 0
      };
      return FitsReader.readHeaderAsync(file, offsetBytes).then(function(headerResult) {
        var naxis = KeywordsManager_1.KeywordsManager.getValue(headerResult.header, 'NAXIS', 0);
        hdu.header = headerResult.header;
        hdu.bytesRead += headerResult.bytesRead;
        if (naxis !== 0) {
          return FitsReader.readDataAsync(file, offsetBytes + headerResult.bytesRead, headerResult.header);
        } else {
          return null;
        }
      }).then(function(data) {
        hdu.data = data;
        hdu.bytesRead += FitsReader.readDataSize(hdu.header);
        return hdu;
      });
    };
    FitsReader.readDataAsync = function(file, offsetBytes, header) {
      var readers = RegisteredDataReaders_1.RegisteredDataReaders.filter(function(reader) {
        return reader.canReadData(header);
      });
      if (readers.length !== 1) {
        console.error('SlimFits was unable to read this file.');
      } else {
        return readers[0].readDataAsync(file, offsetBytes, header);
      }
    };
    FitsReader.readDataSize = function(header) {
      var readers = RegisteredDataReaders_1.RegisteredDataReaders.filter(function(reader) {
        return reader.canReadData(header);
      });
      if (readers.length !== 1) {
        console.error('SlimFits was unable to read this file.');
      } else {
        return readers[0].readDataSize(header);
      }
    };
    return FitsReader;
  }());
  exports.FitsReader = FitsReader;
  global.define = __define;
  return module.exports;
});

System.register("sybilla/slimfits", ["sybilla/FitsReader", "sybilla/datasource/BlobFile", "sybilla/datasource/MultipleRequestFile", "sybilla/datasource/SingleRequestFile"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  "use strict";
  var FitsReader_1 = require("sybilla/FitsReader");
  exports.FitsReader = FitsReader_1.FitsReader;
  var BlobFile_1 = require("sybilla/datasource/BlobFile");
  exports.BlobFile = BlobFile_1.BlobFile;
  var MultipleRequestFile_1 = require("sybilla/datasource/MultipleRequestFile");
  exports.MultipleRequestFile = MultipleRequestFile_1.MultipleRequestFile;
  var SingleRequestFile_1 = require("sybilla/datasource/SingleRequestFile");
  exports.SingleRequestFile = SingleRequestFile_1.SingleRequestFile;
  global.define = __define;
  return module.exports;
});

