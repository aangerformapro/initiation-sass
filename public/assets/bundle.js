/* global unsafeWindow, globalThis */

const global = typeof unsafeWindow !== 'undefined' ? unsafeWindow : globalThis;
const { document: document$1, JSON } = global;
const RE_NUMERIC = /^\d?\.?\d+$/;

const isPlainObject = (param) => param instanceof Object && Object.getPrototypeOf(param) === Object.prototype,
    isString = (param) => typeof param === 'string',
    isNumber = (param) => typeof param === 'number',
    isInt = (param) => Number.isInteger(param),
    isFloat = (param) => isNumber(param) && !isInt(param) && !isNaN(param),
    isNumeric = (param) => isInt(param) || isFloat(param) || RE_NUMERIC.test(param),
    intVal = (param) => isNumeric(param) && parseInt(param),
    isCallable = (param) => typeof param === 'function',
    isFunction = isCallable;

function runAsync(callback, ...args) {
    if (isFunction(callback)) {
        setTimeout(() => {
            callback(...args);
        }, 0);
    }
}

/**
 * Creates an Element
 *
 * @param {string} tagName
 * @param {Object} [attributes]
 * @param {string} [innerHTML]
 * @returns {HTMLElement}
 */
function createElement(tagName = 'div', attributes = null, innerHTML = '') {
    if (isString(attributes)) {
        innerHTML = attributes;
        attributes = null;
    }

    attributes = isPlainObject(attributes) ? attributes : {};

    let elem = document$1.createElement(tagName),
        props = Object.keys(attributes),
        prop;

    for (let i = 0; i < props.length; i++) {
        prop = props[i];
        if (prop === 'html') {
            innerHTML = attributes[prop];
            continue;
        }

        if (/^data(set)?$/.test(prop) && isPlainObject(attributes[prop])) {
            Object.keys(attributes[prop]).forEach((key) => {
                elem.dataset[key] = attributes[prop][key];
            });
        } else if (typeof attributes[prop] !== 'string') {
            elem[prop] = attributes[prop];
            continue;
        } else {
            elem.setAttribute(prop, attributes[prop]);
        }
    }
    if (innerHTML.length > 0) {
        elem.innerHTML = innerHTML;
    }

    return elem;
}

/**
 * A small Event manager that does not uses DOM
 */




class EventManager {

    #listeners
    #useasync

    static #events

    constructor(useasync = true) {
        this.#listeners = [];
        this.#useasync = useasync;
    }


    getListenersForEvent(type) {

        if (!isString(type) || type.includes(' ')) {
            throw new TypeError('Invalid event type, not a String or contains spaces.');
        }

        return this.#listeners.filter(item => item.type === type).map(item => item.listener);
    }


    on(type, listener, once = false) {

        if (!isString(type)) {
            throw new TypeError('Invalid event type, not a String.');
        }

        if (!isFunction(listener)) {
            throw new TypeError('Invalid listener, not a function');
        }



        type.split(/\s+/).forEach(type => {
            this.#listeners.push({
                type, listener, once: once === true
            });
        });

        return this;
    }


    one(type, listener) {
        return this.on(type, listener, true);
    }


    off(type, listener) {

        if (!isString(type)) {
            throw new TypeError('Invalid event type, not a String.');
        }

        type.split(/\s+/).forEach(type => {

            this.#listeners = this.#listeners.filter(item => {
                if (type === item.type) {
                    if (listener === item.listener || !listener) {
                        return false;
                    }
                }
                return true;
            });
        });


        return this;
    }


    trigger(type, data = null) {

        let event;

        if (type instanceof Event) {
            event = type;
            event.data ??= data;
            type = event.type;
        }

        if (!isString(type) && type instanceof Event === false) {
            throw new TypeError('Invalid event type, not a String|Event.');
        }


        const listeners = Array.from(this.#listeners), types = [];

        type.split(/\s+/).forEach(type => {

            if (types.includes(type)) {
                return;
            }

            types.push(type);

            for (let item of listeners) {

                if (item.type === type) {

                    if (this.#useasync) {
                        runAsync(item.listener, event ?? { type, data });

                    } else {
                        item.listener(event ?? { type, data });
                    }

                    if (item.once) {
                        this.off(type, item.listener);
                    }
                }
            }


        });

        return this;


    }


    mixin(binding) {

        if (binding instanceof Object) {
            ['on', 'off', 'one', 'trigger'].forEach(method => {
                Object.defineProperty(binding, method, {
                    enumerable: false, configurable: true,
                    value: (...args) => {
                        this[method](...args);
                        return binding;
                    }
                });
            });

        }

        return this;
    }


    static mixin(binding, useasync = true) {
        return (new EventManager(useasync)).mixin(binding);
    }


    static on(type, listener, once = false) {
        this.#events ??= new EventManager();
        return this.#events.on(type, listener, once);
    }

    static one(type, listener) {
        this.#events ??= new EventManager();
        return this.#events.one(type, listener);
    }

    static off(type, listener) {
        this.#events ??= new EventManager();
        return this.#events.off(type, listener);
    }

    static trigger(type, data = null) {
        this.#events ??= new EventManager();
        return this.#events.trigger(type, data);
    }

}

function styleInject(css, ref) {
  if ( ref === void 0 ) ref = {};
  var insertAt = ref.insertAt;

  if (!css || typeof document === 'undefined') { return; }

  var head = document.head || document.getElementsByTagName('head')[0];
  var style = document.createElement('style');
  style.type = 'text/css';

  if (insertAt === 'top') {
    if (head.firstChild) {
      head.insertBefore(style, head.firstChild);
    } else {
      head.appendChild(style);
    }
  } else {
    head.appendChild(style);
  }

  if (style.styleSheet) {
    style.styleSheet.cssText = css;
  } else {
    style.appendChild(document.createTextNode(css));
  }
}

var css_248z = ".noscroll {\n    position: fixed !important;\n    overflow-y: hidden !important;\n    width: 100% !important;\n    z-index: -1 !important;\n}\n";
styleInject(css_248z);

class NoScroll {


    static #scrollTop = 0
    static #stylesheet

    static get enabled() {
        return document.documentElement.classList.contains('noscroll');
    }

    static #getStylesheet() {

        if (!this.#stylesheet) {


            this.#stylesheet = createElement('style', { type: 'text/css', id: 'no-scroll-component' });
            document.getElementsByTagName('head')[0].appendChild(this.#stylesheet);

        }
        return this.#stylesheet;
    }


    static async enable() {

        if (this.enabled) {
            return true;
        }


        let pos = Math.max(0, document.documentElement.scrollTop);
        this.#scrollTop = pos;
        this.#getStylesheet().innerHTML = `html.noscroll{top:-${pos}px;}`;
        document.documentElement.classList.add('noscroll');
        this.trigger('enabled');
        return true;
    }




    static async disable() {

        if (!this.enabled) {
            return true;
        }

        document.documentElement.classList.remove('noscroll');
        if (this.#scrollTop > 0) {
            document.documentElement.scrollTo(0, this.#scrollTop);
        }
        this.trigger('disabled');
        return true;
    }






}


EventManager.mixin(NoScroll);

class Overlay {

    #container
    get open() {
        return this.#container.hidden !== true;
    }


    constructor(container) {

        if (container instanceof Element === false) {

            container = createElement('div', { class: 'overlay', hidden: true });

            document.body.appendChild(container);
            //throw new TypeError('container not an Element');
        }

        EventManager.mixin(this);
        this.#container = container;

    }


    async toggle(delay = 0) {
        if (this.open) {
            return await this.hide(delay);
        }
        return await this.show(delay);
    }

    #getDelay(delay) {

        if (delay < 31 || isFloat(delay)) {
            delay = intVal(delay * 1000);
        }
        if (!isInt(delay)) {
            throw new TypeError('delay is not an Integer');
        }
        return Math.max(0, delay);

    }


    show(delay = 0) {

        return new Promise(resolve => {

            if (this.open) {
                return resolve(true);
            }
            delay = this.#getDelay(delay);


            this.trigger('show', this.#container);

            NoScroll.enable().then(() => {

                setTimeout(() => {
                    this.#container.hidden = null;
                    this.trigger('open', this.#container);
                    resolve(true);
                }, delay);


            });




        });

    }

    hide(delay = 0) {


        return new Promise(resolve => {
            if (!this.open) {
                return resolve(true);
            }

            delay = this.#getDelay(delay);
            this.trigger('hide', this.#container);

            setTimeout(() => {

                NoScroll.disable().then(() => {
                    this.trigger('close', this.#container);
                    this.#container.hidden = true;
                    resolve(true);
                });

            }, delay);
        });



    }

}

var dist = {};

var formats = {};

Object.defineProperty(formats, "__esModule", {
  value: true
});
formats.FORMAT_PLAIN = formats.FORMAT_HTML = formats.FORMATS = void 0;
var FORMAT_HTML = "html";
formats.FORMAT_HTML = FORMAT_HTML;
var FORMAT_PLAIN = "plain";
formats.FORMAT_PLAIN = FORMAT_PLAIN;
var FORMATS = [FORMAT_HTML, FORMAT_PLAIN];
formats.FORMATS = FORMATS;

var units = {};

Object.defineProperty(units, "__esModule", {
  value: true
});
units.UNIT_WORDS = units.UNIT_WORD = units.UNIT_SENTENCES = units.UNIT_SENTENCE = units.UNIT_PARAGRAPHS = units.UNIT_PARAGRAPH = units.UNITS = void 0;
var UNIT_WORDS = "words";
units.UNIT_WORDS = UNIT_WORDS;
var UNIT_WORD = "word";
units.UNIT_WORD = UNIT_WORD;
var UNIT_SENTENCES = "sentences";
units.UNIT_SENTENCES = UNIT_SENTENCES;
var UNIT_SENTENCE = "sentence";
units.UNIT_SENTENCE = UNIT_SENTENCE;
var UNIT_PARAGRAPHS = "paragraphs";
units.UNIT_PARAGRAPHS = UNIT_PARAGRAPHS;
var UNIT_PARAGRAPH = "paragraph";
units.UNIT_PARAGRAPH = UNIT_PARAGRAPH;
var UNITS = [UNIT_WORDS, UNIT_WORD, UNIT_SENTENCES, UNIT_SENTENCE, UNIT_PARAGRAPHS, UNIT_PARAGRAPH];
units.UNITS = UNITS;

var words = {};

Object.defineProperty(words, "__esModule", {
  value: true
});
words.WORDS = void 0;
var WORDS = ["ad", "adipisicing", "aliqua", "aliquip", "amet", "anim", "aute", "cillum", "commodo", "consectetur", "consequat", "culpa", "cupidatat", "deserunt", "do", "dolor", "dolore", "duis", "ea", "eiusmod", "elit", "enim", "esse", "est", "et", "eu", "ex", "excepteur", "exercitation", "fugiat", "id", "in", "incididunt", "ipsum", "irure", "labore", "laboris", "laborum", "Lorem", "magna", "minim", "mollit", "nisi", "non", "nostrud", "nulla", "occaecat", "officia", "pariatur", "proident", "qui", "quis", "reprehenderit", "sint", "sit", "sunt", "tempor", "ullamco", "ut", "velit", "veniam", "voluptate"];
words.WORDS = WORDS;

var LoremIpsum = {};

var lineEndings = {};

Object.defineProperty(lineEndings, "__esModule", {
  value: true
});
lineEndings.LINE_ENDINGS = void 0;
var LINE_ENDINGS = {
  POSIX: "\n",
  WIN32: "\r\n"
};
lineEndings.LINE_ENDINGS = LINE_ENDINGS;

var generator = {};

var util = {};

var capitalize = {};

(function (exports) {

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports["default"] = void 0;

	/**
	 * @param str  A string that may or may not be capitalized.
	 * @returns    A capitalized string.
	 */
	var capitalize = function capitalize(str) {
	  var trimmed = str.trim();
	  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
	};

	var _default = capitalize;
	exports["default"] = _default;
	
} (capitalize));

var isNodeExports = {};
var isNode = {
  get exports(){ return isNodeExports; },
  set exports(v){ isNodeExports = v; },
};

(function (module, exports) {

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports["default"] = void 0;

	/**
	 * @returns  True if the runtime is NodeJS.
	 */
	var isNode = function isNode() {
	  return !!module.exports;
	};

	var _default = isNode;
	exports["default"] = _default;
	
} (isNode, isNodeExports));

var isReactNative = {};

(function (exports) {

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports["default"] = void 0;

	/**
	 * Check if runtime is ReactNative.
	 * Solution based on https://github.com/knicklabs/lorem-ipsum.js/pull/52/files
	 *
	 * @returns  True if runtime is ReactNative.
	 */
	var isReactNative = function isReactNative() {
	  var isReactNativeResult = false;

	  try {
	    isReactNativeResult = navigator.product === "ReactNative";
	  } catch (e) {
	    isReactNativeResult = false;
	  }

	  return isReactNativeResult;
	};

	var _default = isReactNative;
	exports["default"] = _default;
	
} (isReactNative));

var isWindows = {};

var platforms = {};

Object.defineProperty(platforms, "__esModule", {
  value: true
});
platforms.SUPPORTED_PLATFORMS = void 0;
var SUPPORTED_PLATFORMS = {
  DARWIN: "darwin",
  LINUX: "linux",
  WIN32: "win32"
};
platforms.SUPPORTED_PLATFORMS = SUPPORTED_PLATFORMS;

(function (exports) {

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports["default"] = void 0;

	var _platforms = platforms;

	/**
	 * @returns True if process is windows.
	 */
	var isWindows = function isWindows() {
	  var isWindowsResult = false;

	  try {
	    isWindowsResult = process.platform === _platforms.SUPPORTED_PLATFORMS.WIN32;
	  } catch (e) {
	    isWindowsResult = false;
	  }

	  return isWindowsResult;
	};

	var _default = isWindows;
	exports["default"] = _default;
	
} (isWindows));

var makeArrayOfLength = {};

(function (exports) {

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports["default"] = void 0;

	/**
	 * @param length Length "x".
	 * @returns      An array of indexes of length "x".
	 */
	var makeArrayOfLength = function makeArrayOfLength() {
	  var length = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
	  return Array.apply(null, Array(length)).map(function (item, index) {
	    return index;
	  });
	};

	var _default = makeArrayOfLength;
	exports["default"] = _default;
	
} (makeArrayOfLength));

var makeArrayOfStrings = {};

(function (exports) {

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports["default"] = void 0;

	var _makeArrayOfLength = _interopRequireDefault(makeArrayOfLength);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

	/**
	 * @param length  Length "x".
	 * @returns       An array of strings of length "x".
	 */
	var makeArrayOfStrings = function makeArrayOfStrings(length, makeString) {
	  var arr = (0, _makeArrayOfLength["default"])(length);
	  return arr.map(function () {
	    return makeString();
	  });
	};

	var _default = makeArrayOfStrings;
	exports["default"] = _default;
	
} (makeArrayOfStrings));

(function (exports) {

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	Object.defineProperty(exports, "capitalize", {
	  enumerable: true,
	  get: function get() {
	    return _capitalize["default"];
	  }
	});
	Object.defineProperty(exports, "isNode", {
	  enumerable: true,
	  get: function get() {
	    return _isNode["default"];
	  }
	});
	Object.defineProperty(exports, "isReactNative", {
	  enumerable: true,
	  get: function get() {
	    return _isReactNative["default"];
	  }
	});
	Object.defineProperty(exports, "isWindows", {
	  enumerable: true,
	  get: function get() {
	    return _isWindows["default"];
	  }
	});
	Object.defineProperty(exports, "makeArrayOfLength", {
	  enumerable: true,
	  get: function get() {
	    return _makeArrayOfLength["default"];
	  }
	});
	Object.defineProperty(exports, "makeArrayOfStrings", {
	  enumerable: true,
	  get: function get() {
	    return _makeArrayOfStrings["default"];
	  }
	});

	var _capitalize = _interopRequireDefault(capitalize);

	var _isNode = _interopRequireDefault(isNodeExports);

	var _isReactNative = _interopRequireDefault(isReactNative);

	var _isWindows = _interopRequireDefault(isWindows);

	var _makeArrayOfLength = _interopRequireDefault(makeArrayOfLength);

	var _makeArrayOfStrings = _interopRequireDefault(makeArrayOfStrings);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
	
} (util));

(function (exports) {

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports["default"] = void 0;

	var _words = words;

	var _util = util;

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

	function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }

	function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

	var Generator = /*#__PURE__*/function () {
	  function Generator() {
	    var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
	        _ref$sentencesPerPara = _ref.sentencesPerParagraph,
	        sentencesPerParagraph = _ref$sentencesPerPara === void 0 ? {
	      max: 7,
	      min: 3
	    } : _ref$sentencesPerPara,
	        _ref$wordsPerSentence = _ref.wordsPerSentence,
	        wordsPerSentence = _ref$wordsPerSentence === void 0 ? {
	      max: 15,
	      min: 5
	    } : _ref$wordsPerSentence,
	        random = _ref.random;
	        _ref.seed;
	        var _ref$words = _ref.words,
	        words = _ref$words === void 0 ? _words.WORDS : _ref$words;

	    _classCallCheck(this, Generator);

	    _defineProperty(this, "sentencesPerParagraph", void 0);

	    _defineProperty(this, "wordsPerSentence", void 0);

	    _defineProperty(this, "random", void 0);

	    _defineProperty(this, "words", void 0);

	    if (sentencesPerParagraph.min > sentencesPerParagraph.max) {
	      throw new Error("Minimum number of sentences per paragraph (".concat(sentencesPerParagraph.min, ") cannot exceed maximum (").concat(sentencesPerParagraph.max, ")."));
	    }

	    if (wordsPerSentence.min > wordsPerSentence.max) {
	      throw new Error("Minimum number of words per sentence (".concat(wordsPerSentence.min, ") cannot exceed maximum (").concat(wordsPerSentence.max, ")."));
	    }

	    this.sentencesPerParagraph = sentencesPerParagraph;
	    this.words = words;
	    this.wordsPerSentence = wordsPerSentence;
	    this.random = random || Math.random;
	  }

	  _createClass(Generator, [{
	    key: "generateRandomInteger",
	    value: function generateRandomInteger(min, max) {
	      return Math.floor(this.random() * (max - min + 1) + min);
	    }
	  }, {
	    key: "generateRandomWords",
	    value: function generateRandomWords(num) {
	      var _this = this;

	      var _this$wordsPerSentenc = this.wordsPerSentence,
	          min = _this$wordsPerSentenc.min,
	          max = _this$wordsPerSentenc.max;
	      var length = num || this.generateRandomInteger(min, max);
	      return (0, _util.makeArrayOfLength)(length).reduce(function (accumulator, index) {
	        return "".concat(_this.pluckRandomWord(), " ").concat(accumulator);
	      }, "").trim();
	    }
	  }, {
	    key: "generateRandomSentence",
	    value: function generateRandomSentence(num) {
	      return "".concat((0, _util.capitalize)(this.generateRandomWords(num)), ".");
	    }
	  }, {
	    key: "generateRandomParagraph",
	    value: function generateRandomParagraph(num) {
	      var _this2 = this;

	      var _this$sentencesPerPar = this.sentencesPerParagraph,
	          min = _this$sentencesPerPar.min,
	          max = _this$sentencesPerPar.max;
	      var length = num || this.generateRandomInteger(min, max);
	      return (0, _util.makeArrayOfLength)(length).reduce(function (accumulator, index) {
	        return "".concat(_this2.generateRandomSentence(), " ").concat(accumulator);
	      }, "").trim();
	    }
	  }, {
	    key: "pluckRandomWord",
	    value: function pluckRandomWord() {
	      var min = 0;
	      var max = this.words.length - 1;
	      var index = this.generateRandomInteger(min, max);
	      return this.words[index];
	    }
	  }]);

	  return Generator;
	}();

	var _default = Generator;
	exports["default"] = _default;
	
} (generator));

(function (exports) {

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports["default"] = void 0;

	var _formats = formats;

	var _lineEndings = lineEndings;

	var _generator = _interopRequireDefault(generator);

	var _util = util;

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

	function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }

	function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

	var LoremIpsum = /*#__PURE__*/function () {
	  function LoremIpsum() {
	    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
	    var format = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : _formats.FORMAT_PLAIN;
	    var suffix = arguments.length > 2 ? arguments[2] : undefined;

	    _classCallCheck(this, LoremIpsum);

	    this.format = format;
	    this.suffix = suffix;

	    _defineProperty(this, "generator", void 0);

	    if (_formats.FORMATS.indexOf(format.toLowerCase()) === -1) {
	      throw new Error("".concat(format, " is an invalid format. Please use ").concat(_formats.FORMATS.join(" or "), "."));
	    }

	    this.generator = new _generator["default"](options);
	  }

	  _createClass(LoremIpsum, [{
	    key: "getLineEnding",
	    value: function getLineEnding() {
	      if (this.suffix) {
	        return this.suffix;
	      }

	      if (!(0, _util.isReactNative)() && (0, _util.isNode)() && (0, _util.isWindows)()) {
	        return _lineEndings.LINE_ENDINGS.WIN32;
	      }

	      return _lineEndings.LINE_ENDINGS.POSIX;
	    }
	  }, {
	    key: "formatString",
	    value: function formatString(str) {
	      if (this.format === _formats.FORMAT_HTML) {
	        return "<p>".concat(str, "</p>");
	      }

	      return str;
	    }
	  }, {
	    key: "formatStrings",
	    value: function formatStrings(strings) {
	      var _this = this;

	      return strings.map(function (str) {
	        return _this.formatString(str);
	      });
	    }
	  }, {
	    key: "generateWords",
	    value: function generateWords(num) {
	      return this.formatString(this.generator.generateRandomWords(num));
	    }
	  }, {
	    key: "generateSentences",
	    value: function generateSentences(num) {
	      return this.formatString(this.generator.generateRandomParagraph(num));
	    }
	  }, {
	    key: "generateParagraphs",
	    value: function generateParagraphs(num) {
	      var makeString = this.generator.generateRandomParagraph.bind(this.generator);
	      return this.formatStrings((0, _util.makeArrayOfStrings)(num, makeString)).join(this.getLineEnding());
	    }
	  }]);

	  return LoremIpsum;
	}();

	var _default = LoremIpsum;
	exports["default"] = _default;
	
} (LoremIpsum));

(function (exports) {

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	Object.defineProperty(exports, "LoremIpsum", {
	  enumerable: true,
	  get: function get() {
	    return _LoremIpsum["default"];
	  }
	});
	exports.loremIpsum = void 0;

	var _formats = formats;

	var _units = units;

	var _words = words;

	var _LoremIpsum = _interopRequireDefault(LoremIpsum);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

	var loremIpsum = function loremIpsum() {
	  var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
	      _ref$count = _ref.count,
	      count = _ref$count === void 0 ? 1 : _ref$count,
	      _ref$format = _ref.format,
	      format = _ref$format === void 0 ? _formats.FORMAT_PLAIN : _ref$format,
	      _ref$paragraphLowerBo = _ref.paragraphLowerBound,
	      paragraphLowerBound = _ref$paragraphLowerBo === void 0 ? 3 : _ref$paragraphLowerBo,
	      _ref$paragraphUpperBo = _ref.paragraphUpperBound,
	      paragraphUpperBound = _ref$paragraphUpperBo === void 0 ? 7 : _ref$paragraphUpperBo,
	      random = _ref.random,
	      _ref$sentenceLowerBou = _ref.sentenceLowerBound,
	      sentenceLowerBound = _ref$sentenceLowerBou === void 0 ? 5 : _ref$sentenceLowerBou,
	      _ref$sentenceUpperBou = _ref.sentenceUpperBound,
	      sentenceUpperBound = _ref$sentenceUpperBou === void 0 ? 15 : _ref$sentenceUpperBou,
	      _ref$units = _ref.units,
	      units = _ref$units === void 0 ? _units.UNIT_SENTENCES : _ref$units,
	      _ref$words = _ref.words,
	      words = _ref$words === void 0 ? _words.WORDS : _ref$words,
	      _ref$suffix = _ref.suffix,
	      suffix = _ref$suffix === void 0 ? "" : _ref$suffix;

	  var options = {
	    random: random,
	    sentencesPerParagraph: {
	      max: paragraphUpperBound,
	      min: paragraphLowerBound
	    },
	    words: words,
	    wordsPerSentence: {
	      max: sentenceUpperBound,
	      min: sentenceLowerBound
	    }
	  };
	  var lorem = new _LoremIpsum["default"](options, format, suffix);

	  switch (units) {
	    case _units.UNIT_PARAGRAPHS:
	    case _units.UNIT_PARAGRAPH:
	      return lorem.generateParagraphs(count);

	    case _units.UNIT_SENTENCES:
	    case _units.UNIT_SENTENCE:
	      return lorem.generateSentences(count);

	    case _units.UNIT_WORDS:
	    case _units.UNIT_WORD:
	      return lorem.generateWords(count);

	    default:
	      return "";
	  }
	};

	exports.loremIpsum = loremIpsum;
	
} (dist));

const overlay = new Overlay(document.querySelector('.overlay')), delay = {
    show: 0,
    hide: 1.01,
}, { body } = document, lorem = new dist.LoremIpsum({
    sentencesPerParagraph: {
        min: 1,
        max: 1,
    },
    wordsPerSentence: {
        min: 8,
        max: 8,
    }
}), related = body.querySelector('.related'), card = body.querySelector('.card').cloneNode(true);

let lock = true, cnt = 3, max = 99;

overlay
    .on('hide', () => {

        body.classList.add('menu-closing');
    })
    .on('close', () => {
        body.classList.remove('menu-closing', 'menu-shown');
    })
    .on('show', () => {
        body.classList.remove('menu-closing');
        body.classList.add('menu-showing');
    })
    .on('open', () => {
        body.classList.remove('menu-showing');
        body.classList.add('menu-shown');
    });




addEventListener('click', e => {
    if (e.target.closest('.nav-btn')) {
        e.preventDefault();
        overlay.open ? overlay.hide(delay.hide) : overlay.show(delay.show);
    } else if (e.target.closest('.menu-shown nav a, .menu-shown .logo')) {
        overlay.hide(delay.hide);
    } else if (e.target.closest('.btn-pink')) {
        lock = false;
    }
});


addEventListener("scroll", () => {

    const endOfPage = window.innerHeight + window.pageYOffset >= document.body.offsetHeight - 10;

    if (endOfPage && !lock && related && card) {
        lock = true;

        for (let i = 0; i < 3; i++) {

            if (cnt === max) {
                break;
            }

            cnt++;

            let elem = card.cloneNode(true),
                text = lorem.generateParagraphs(1),
                title = text.split(' ', 3).join(' '),
                cntText = '0' + cnt;

            if (cntText.length > 2) {
                cntText = cntText.slice(1);
            }

            elem.querySelector('.card-text').innerHTML = text;
            elem.querySelector('.card-header').innerHTML = cntText;
            elem.querySelector('.card-title').innerHTML = title;


            related.appendChild(elem);

        }

        setTimeout(() => {
            lock = cnt > max;
            //document.documentElement.scrollTo(0, 0);
        }, 50);

        //console.debug('scroll end');





    }

});

addEventListener('load', () => {
    //lock = false;
});
//# sourceMappingURL=bundle.js.map
