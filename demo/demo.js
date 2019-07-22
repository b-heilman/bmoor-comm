var bmoorComm =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var comm,
	    bmoorComm = __webpack_require__(1),
	    Feed = bmoorComm.connect.Feed,
	    Requestor = bmoorComm.Requestor;

	Requestor.$settings.fetcher = function (url, options) {
		console.log(url, options);
		return fetch(url, options);
	};

	comm = new Feed({
		all: 'http://localhost:10001/test',
		create: 'http://localhost:10001/test-json',
		update: {
			url: 'http://localhost:10001/test-form/{{id}}',
			method: 'POST'
		},
		read: 'http://localhost:10001/test/{{id}}'
	});

	comm.all().then(function (res) {
		console.log('success', res);
	}, function (err) {
		console.log('fail', err);
	});

	comm.create({ 'foo': 'bar' }).then(function (res) {
		console.log('success', res);
	}, function (err) {
		console.log('fail', err);
	});

	var f = new FormData();

	f.set('hello', 'world');

	comm.update({ id: 1 }, f).then(function (res) {
		console.log('success', res);
	}, function (err) {
		console.log('fail', err);
	});

	module.exports = bmoorComm;

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	module.exports = {
		connect: __webpack_require__(2),
		mock: __webpack_require__(32),
		Url: __webpack_require__(26),
		Requestor: __webpack_require__(25),
		restful: __webpack_require__(24),
		Feed: __webpack_require__(4).Feed,
		Stream: __webpack_require__(33).Stream,
		Sitemap: __webpack_require__(135).Sitemap,
		testing: {
			Requestor: __webpack_require__(136)
		}
	};

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	module.exports = {
		model: __webpack_require__(3),
		Feed: __webpack_require__(4).Feed,
		Storage: __webpack_require__(31)
	};

/***/ },
/* 3 */
/***/ function(module, exports) {

	'use strict';

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var Model = function () {
		function Model(model, extend) {
			var _this = this;

			_classCallCheck(this, Model);

			this.mask = Object.create(model);

			if (!this.mask.table) {
				throw new Error('table must be defined');
			}

			this.mask.name = model.table.replace(/[_\s]+/g, '/'); // I'm gonna make this web safe in the future

			if (!this.mask.id) {
				this.mask.id = 'id';
			}

			if (!this.mask.path) {
				this.mask.path = '';
			}

			if (extend) {
				Object.keys(extend).forEach(function (key) {
					_this.set(key, extend[key]);
				});
			}
		}

		_createClass(Model, [{
			key: 'set',
			value: function set(key, value) {
				this.mask[key] = value;
			}
		}, {
			key: 'get',
			value: function get(key) {
				return this.mask[key];
			}
		}]);

		return Model;
	}();

	module.exports = {
		Model: Model
	};

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var _require = __webpack_require__(5),
	    applyRoutes = _require.applyRoutes;

	var index = __webpack_require__(6).Memory.use('comm-feeds');

	var Feed = function () {
		function Feed(ops) {
			var settings = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

			_classCallCheck(this, Feed);

			if (settings.base) {
				Object.assign(this, settings.base);
			}

			if (ops) {
				this.addRoutes(ops, settings);
			}

			if (ops.name) {
				index.register(ops.name, this);
			}
		}

		_createClass(Feed, [{
			key: 'addRoutes',
			value: function addRoutes(ops) {
				var settings = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

				applyRoutes(this, ops, settings);
			}
		}]);

		return Feed;
	}();

	module.exports = {
		Feed: Feed,
		default: Feed,
		index: index
	};

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	/**
	 * Older versions of Node may require
	 * ------------
	 * import { URLSearchParams } from 'url';
	 * global.URLSearchParams = URLSearchParams
	 **/
	var bmoor = __webpack_require__(6);
	var Model = __webpack_require__(3).Model;
	var restful = __webpack_require__(24);

	var _require = __webpack_require__(30),
	    makeSwitchableUrl = _require.makeSwitchableUrl;

	function applyRoutes(target, ops) {
		var settings = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

		// settings => inflate, deflate

		if (ops instanceof Model) {
			settings.id = ops.get('id');

			ops = {
				// GET : access one instance of the collection by id
				read: ops.get('path') + ('/' + ops.get('name') + '/instance/{{' + ops.get('id') + '}}'),
				// GET : access many instances of the collection by id
				readMany: ops.get('path') + ('/' + ops.get('name') + '/many?id[]={{' + ops.get('id') + '}}'),
				// GET : access all instances of the collection
				all: ops.get('path') + ('/' + ops.get('name')),
				// GET : access all instances of a collection, but only an abridged version
				list: ops.get('path') + ('/' + ops.get('name') + '/list'),
				// GET : query the collection
				query: ops.get('path') + ('/' + ops.get('name')),
				// POST : create an instance in the collection
				create: ops.get('path') + ('/' + ops.get('name')),
				// PATCH / PUT : Update an object in the collection
				update: {
					url: ops.get('path') + ('/' + ops.get('name') + '/{{' + ops.get('id') + '}}'),
					method: 'PATCH'
				},
				// DELETE : Delete an instance from the collection
				delete: ops.get('path') + ('/' + ops.get('name') + '/{{' + ops.get('id') + '}}')
			};
		}

		if (ops.read && !bmoor.isObject(ops.read)) {
			ops.read = {
				url: ops.read
			};
		}

		if (ops.readMany && !bmoor.isObject(ops.readMany)) {
			ops.readMany = {
				url: ops.readMany
			};
		}

		if (ops.all && !bmoor.isObject(ops.all)) {
			ops.all = {
				url: ops.all
			};
		}

		if (ops.list && !bmoor.isObject(ops.list)) {
			ops.list = {
				url: ops.list
			};
		}

		if (ops.create && !bmoor.isObject(ops.create)) {
			ops.create = {
				url: ops.create,
				method: 'POST'
			};
		}

		if (ops.update && !bmoor.isObject(ops.update)) {
			ops.update = {
				url: ops.update,
				method: 'PUT'
			};
		}

		if (ops.delete && !bmoor.isObject(ops.delete)) {
			ops.delete = {
				url: ops.delete,
				method: 'DELETE'
			};
		}

		if (ops.search && !bmoor.isObject(ops.search)) {
			ops.search = {
				url: ops.search,
				method: 'GET'
			};
		} else if (bmoor.isObject(ops.search) && !ops.search.url) {
			var generator = null;

			var routes = ops.search;

			if (target.search) {
				generator = target.search.$settings.url;
				ops.search = null;
			} else {
				generator = makeSwitchableUrl();
				ops.search = {
					url: generator,
					method: 'GET'
				};
			}

			for (var key in routes) {
				generator.append(key, routes[key]);
			}
		}

		if (bmoor.isString(ops.query)) {
			var base = ops.query;

			ops.query = {
				url: function url(args) {
					var searchParams = new URLSearchParams('');

					args = bmoor.object.implode(args);

					for (var _key in args) {
						searchParams.append(_key, args[_key]);
					}

					return base + '?' + searchParams.toString();
				},
				method: 'GET'
			};
		}

		if (settings.inflate) {
			var singular = function singular(res) {
				return settings.inflate(res);
			};
			var multiple = function multiple(res) {
				if (bmoor.isArray(res)) {
					return res.map(settings.inflate);
				} else {
					return settings.inflate(res);
				}
			};

			if (ops.read && !ops.read.success) {
				ops.read.success = singular;
			}

			if (ops.all && !ops.all.success) {
				ops.all.success = multiple;
			}

			if (ops.create && !ops.create.success) {
				ops.create.success = singular;
			}

			if (ops.update && !ops.update.success) {
				ops.update.success = singular;
			}

			if (ops.search && !ops.search.success) {
				ops.search.success = multiple;
			}

			if (ops.query && !ops.query.success) {
				ops.query.success = multiple;
			}
		}

		//ops.list
		if (settings.minimize) {
			if (!ops.list) {
				ops.list = {};
			}

			ops.list.intercept = function () {
				return target.all.apply(target, arguments).then(function (d) {
					var i,
					    c,
					    rtn = [];

					for (i = 0, c = d.length; i < c; i++) {
						rtn.push(settings.minimize(d[i]));
					}

					return rtn;
				});
			};
		}

		if (!ops.list && ops.all) {
			ops.list = function () {
				return target.all.apply(target, arguments);
			};
		}

		function encode(datum, args) {
			var d = datum ? datum : args;

			return settings.deflate ? settings.deflate(d) : d;
		}

		//ops.create
		if (ops.create && !ops.create.encode) {
			ops.create.encode = encode;
		}

		//ops.update
		if (ops.update && !ops.update.encode) {
			ops.update.encode = encode;
		}

		//ops.update
		if (ops.delete && !ops.delete.encode) {
			ops.delete.encode = encode;
		}

		function prep(args) {
			var t;

			if (bmoor.isObject(args)) {
				return args;
			} else {
				t = {};
				t[settings.id] = args;

				return t;
			}
		}

		if (settings.id) {
			if (ops.read && !ops.read.prep) {
				ops.read.prep = prep;
			}

			if (ops.update && !ops.update.prep) {
				ops.update.prep = prep;
			}

			if (ops.delete && !ops.delete.prep) {
				ops.delete.prep = prep;
			}

			if (ops.readMany && !ops.readMany.prep) {
				ops.readMany.prep = function (args) {
					if (bmoor.isArray(args)) {
						args.forEach(function (v, i) {
							if (!bmoor.isObject(v)) {
								var t = {};

								t[settings.id] = v;

								args[i] = t;
							}
						});

						return args;
					} else {
						if (bmoor.isObject(args)) {
							return [args];
						} else {
							var t = {};
							t[settings.id] = args;

							return [t];
						}
					}
				};
			}
		}

		restful(target, ops);
	}

	module.exports = {
		applyRoutes: applyRoutes
	};

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var bmoor = Object.create(__webpack_require__(7));

	bmoor.dom = __webpack_require__(8);
	bmoor.data = __webpack_require__(9);
	bmoor.flow = __webpack_require__(10);
	bmoor.array = __webpack_require__(14);
	bmoor.build = __webpack_require__(15);
	bmoor.object = __webpack_require__(19);
	bmoor.string = __webpack_require__(20);
	bmoor.promise = __webpack_require__(21);

	bmoor.Memory = __webpack_require__(22);
	bmoor.Eventing = __webpack_require__(23);

	module.exports = bmoor;

/***/ },
/* 7 */
/***/ function(module, exports) {

	'use strict';

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

	/**
	 * The core of bmoor's usefulness
	 * @module bmoor
	 **/

	/**
	 * Tests if the value is undefined
	 *
	 * @function isUndefined
	 * @param {*} value - The variable to test
	 * @return {boolean}
	 **/
	function isUndefined(value) {
		return value === undefined;
	}

	/**
	 * Tests if the value is not undefined
	 *
	 * @function isDefined
	 * @param {*} value The variable to test
	 * @return {boolean}
	 **/
	function isDefined(value) {
		return value !== undefined;
	}

	/**
	 * Tests if the value is a string
	 *
	 * @function isString
	 * @param {*} value The variable to test
	 * @return {boolean}
	 **/
	function isString(value) {
		return typeof value === 'string';
	}

	/**
	 * Tests if the value is numeric
	 *
	 * @function isNumber
	 * @param {*} value The variable to test
	 * @return {boolean}
	 **/
	function isNumber(value) {
		return typeof value === 'number';
	}

	/**
	 * Tests if the value is a function
	 *
	 * @function isFuncion
	 * @param {*} value The variable to test
	 * @return {boolean}
	 **/
	function isFunction(value) {
		return typeof value === 'function';
	}

	/**
	 * Tests if the value is an object
	 *
	 * @function isObject
	 * @param {*} value The variable to test
	 * @return {boolean}
	 **/
	function isObject(value) {
		return value && (typeof value === 'undefined' ? 'undefined' : _typeof(value)) === 'object';
	}

	/**
	 * Tests if the value is a boolean
	 *
	 * @function isBoolean
	 * @param {*} value The variable to test
	 * @return {boolean}
	 **/
	function isBoolean(value) {
		return typeof value === 'boolean';
	}

	/**
	 * Tests if the value can be used as an array
	 *
	 * @function isArrayLike
	 * @param {*} value The variable to test
	 * @return {boolean}
	 **/
	function isArrayLike(value) {
		// for me, if you have a length, I'm assuming you're array like, might change
		if (value) {
			return isObject(value) && (value.length === 0 || 0 in value && value.length - 1 in value);
		} else {
			return false;
		}
	}

	/**
	 * Tests if the value is an array
	 *
	 * @function isArray
	 * @param {*} value The variable to test
	 * @return {boolean}
	 **/
	function isArray(value) {
		return value instanceof Array;
	}

	/**
	 * Tests if the value has no content.
	 * If an object, has no own properties.
	 * If array, has length == 0.
	 * If other, is not defined
	 *
	 * @function isEmpty
	 * @param {*} value The variable to test
	 * @return {boolean}
	 **/
	function isEmpty(value) {
		var key;

		if (isObject(value)) {
			for (key in value) {
				if (value.hasOwnProperty(key)) {
					return false;
				}
			}
		} else if (isArrayLike(value)) {
			return value.length === 0;
		} else {
			return isUndefined(value);
		}

		return true;
	}

	function parse(path) {
		if (!path) {
			return [];
		} else if (isString(path)) {
			return path.split('.');
		} else if (isArray(path)) {
			return path.slice(0);
		} else {
			throw new Error('unable to parse path: ' + path + ' : ' + (typeof path === 'undefined' ? 'undefined' : _typeof(path)));
		}
	}

	/**
	 * Sets a value to a namespace, returns the old value
	 *
	 * @function set
	 * @param {object} root The root of the namespace, bMoor.namespace.root if not defined
	 * @param {string|array} space The namespace
	 * @param {*} value The value to set the namespace to
	 * @return {*}
	 **/
	function set(root, space, value) {
		var i,
		    c,
		    val,
		    nextSpace,
		    curSpace = root;

		space = parse(space);

		val = space.pop();

		for (i = 0, c = space.length; i < c; i++) {
			nextSpace = space[i];

			if (isUndefined(curSpace[nextSpace])) {
				curSpace[nextSpace] = {};
			}

			curSpace = curSpace[nextSpace];
		}

		curSpace[val] = value;

		return curSpace;
	}

	function _makeSetter(property, next) {
		if (next) {
			return function (ctx, value) {
				var t = ctx[property];

				if (!t) {
					t = ctx[property] = {};
				}

				return next(t, value);
			};
		} else {
			return function (ctx, value) {
				ctx[property] = value;
				return ctx;
			};
		}
	}

	function makeSetter(space) {
		var i,
		    fn,
		    readings = parse(space);

		for (i = readings.length - 1; i > -1; i--) {
			fn = _makeSetter(readings[i], fn);
		}

		return fn;
	}

	/**
	 * get a value from a namespace, if it doesn't exist, the path will be created
	 *
	 * @function get
	 * @param {object} root The root of the namespace, bMoor.namespace.root if not defined
	 * @param {string|array|function} space The namespace
	 * @return {array}
	 **/
	function get(root, path) {
		var i,
		    c,
		    space,
		    nextSpace,
		    curSpace = root;

		if (!root) {
			return root;
		}

		space = parse(path);
		if (space.length) {
			for (i = 0, c = space.length; i < c; i++) {
				nextSpace = space[i];

				if (isUndefined(curSpace[nextSpace])) {
					return;
				}

				curSpace = curSpace[nextSpace];
			}
		}

		return curSpace;
	}

	function _makeGetter(property, next) {
		if (next) {
			return function (obj) {
				try {
					return next(obj[property]);
				} catch (ex) {
					return undefined;
				}
			};
		} else {
			return function (obj) {
				try {
					return obj[property];
				} catch (ex) {
					return undefined;
				}
			};
		}
	}

	function makeGetter(path) {
		var i,
		    fn,
		    space = parse(path);

		if (space.length) {
			for (i = space.length - 1; i > -1; i--) {
				fn = _makeGetter(space[i], fn);
			}
		} else {
			return function (obj) {
				return obj;
			};
		}

		return fn;
	}

	/**
	 * Delete a namespace, returns the old value
	 *
	 * @function del
	 * @param {object} root The root of the namespace, bMoor.namespace.root if not defined
	 * @param {string|array} space The namespace
	 * @return {*}
	 **/
	function del(root, space) {
		var old,
		    val,
		    nextSpace,
		    curSpace = root;

		if (space && (isString(space) || isArrayLike(space))) {
			space = parse(space);

			val = space.pop();

			for (var i = 0; i < space.length; i++) {
				nextSpace = space[i];

				if (isUndefined(curSpace[nextSpace])) {
					return;
				}

				curSpace = curSpace[nextSpace];
			}

			old = curSpace[val];
			delete curSpace[val];
		}

		return old;
	}

	/**
	 * Call a function against all elements of an array like object, from 0 to length.  
	 *
	 * @function loop
	 * @param {array} arr The array to iterate through
	 * @param {function} fn The function to call against each element
	 * @param {object} context The context to call each function against
	 **/
	function loop(arr, fn, context) {
		var i, c;

		if (!context) {
			context = arr;
		}

		if (arr.forEach) {
			arr.forEach(fn, context);
		} else {
			for (i = 0, c = arr.length; i < c; ++i) {
				if (i in arr) {
					fn.call(context, arr[i], i, arr);
				}
			}
		}
	}

	/**
	 * Call a function against all own properties of an object.  
	 *
	 * @function each
	 * @param {object} arr The object to iterate through
	 * @param {function} fn The function to call against each element
	 * @param {object} context The context to call each function against
	 **/
	function each(obj, fn, context) {
		var key;

		if (!context) {
			context = obj;
		}

		for (key in obj) {
			if (obj.hasOwnProperty(key)) {
				fn.call(context, obj[key], key, obj);
			}
		}
	}

	/**
	 * Call a function against all own properties of an object, skipping specific framework properties.
	 * In this framework, $ implies a system function, _ implies private, so skip _
	 *
	 * @function iterate
	 * @param {object} obj The object to iterate through
	 * @param {function} fn The function to call against each element
	 * @param {object} context The scope to call each function against
	 **/
	function iterate(obj, fn, context) {
		var key;

		if (!context) {
			context = obj;
		}

		for (key in obj) {
			if (obj.hasOwnProperty(key) && key.charAt(0) !== '_') {
				fn.call(context, obj[key], key, obj);
			}
		}
	}

	/**
	 * Call a function against all own properties of an object, skipping specific framework properties.
	 * In this framework, $ implies a system function, _ implies private, so skip both
	 *
	 * @function safe
	 * @param {object} obj - The object to iterate through
	 * @param {function} fn - The function to call against each element
	 * @param {object} scope - The scope to call each function against
	 **/
	function safe(obj, fn, context) {
		var key;

		if (!context) {
			context = obj;
		}

		for (key in obj) {
			if (obj.hasOwnProperty(key) && key.charAt(0) !== '_' && key.charAt(0) !== '$') {
				fn.call(context, obj[key], key, obj);
			}
		}
	}

	function naked(obj, fn, context) {
		safe(obj, function (t, k, o) {
			if (!isFunction(t)) {
				fn.call(context, t, k, o);
			}
		});
	}

	module.exports = {
		// booleans
		isUndefined: isUndefined,
		isDefined: isDefined,
		isString: isString,
		isNumber: isNumber,
		isFunction: isFunction,
		isObject: isObject,
		isBoolean: isBoolean,
		isArrayLike: isArrayLike,
		isArray: isArray,
		isEmpty: isEmpty,
		// access
		parse: parse,
		set: set,
		makeSetter: makeSetter,
		get: get,
		makeGetter: makeGetter,
		del: del,
		// controls
		loop: loop,
		each: each,
		iterate: iterate,
		safe: safe,
		naked: naked
	};

/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var bmoor = __webpack_require__(7),
	    regex = {};

	// TODO: put in a polyfill block
	if (typeof window !== 'undefined' && !bmoor.isFunction(window.CustomEvent)) {

		var _CustomEvent = function _CustomEvent(event, params) {
			params = params || { bubbles: false, cancelable: false, detail: undefined };

			var evt = document.createEvent('CustomEvent');

			evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);

			return evt;
		};

		_CustomEvent.prototype = window.Event.prototype;

		window.CustomEvent = _CustomEvent;
	}

	if (typeof Element !== 'undefined' && !Element.prototype.matches) {
		Element.prototype.matches = Element.prototype.msMatchesSelector;
	}

	function getReg(className) {
		var reg = regex[className];

		if (!reg) {
			reg = new RegExp('(?:^|\\s)' + className + '(?!\\S)');
			regex[className] = reg;
		}

		return reg;
	}

	function getScrollPosition(doc) {
		if (!doc) {
			doc = document;
		}

		return {
			left: window.pageXOffset || (doc.documentElement || doc.body).scrollLeft,
			top: window.pageYOffset || (doc.documentElement || doc.body).scrollTop
		};
	}

	function getBoundryBox(element) {
		return element.getBoundingClientRect();
	}

	function centerOn(element, target, doc) {
		var el = getBoundryBox(element),
		    targ = getBoundryBox(target),
		    pos = getScrollPosition(doc);

		if (!doc) {
			doc = document;
		}

		element.style.top = pos.top + targ.top + targ.height / 2 - el.height / 2;
		element.style.left = pos.left + targ.left + targ.width / 2 - el.width / 2;
		element.style.right = '';
		element.style.bottom = '';

		element.style.position = 'absolute';
		doc.body.appendChild(element);
	}

	function showOn(element, target, doc) {
		var direction,
		    targ = getBoundryBox(target),
		    x = targ.x + targ.width / 2,
		    y = targ.y + targ.height / 2,
		    centerX = window.innerWidth / 2,
		    centerY = window.innerHeight / 2,
		    pos = getScrollPosition(doc);

		if (!doc) {
			doc = document;
		}

		if (x < centerX) {
			// right side has more room
			direction = 'r';
			element.style.left = pos.left + targ.right;
			element.style.right = '';
		} else {
			// left side has more room
			//element.style.left = targ.left - el.width - offset;
			direction = 'l';
			element.style.right = window.innerWidth - targ.left - pos.left;
			element.style.left = '';
		}

		if (y < centerY) {
			// more room on bottom
			direction = 'b' + direction;
			element.style.top = pos.top + targ.bottom;
			element.style.bottom = '';
		} else {
			// more room on top
			direction = 't' + direction;
			element.style.bottom = window.innerHeight - targ.top - pos.top;
			element.style.top = '';
		}

		element.style.position = 'absolute';
		doc.body.appendChild(element);

		return direction;
	}

	function massage(elements) {
		if (!bmoor.isArrayLike(elements)) {
			elements = [elements];
		}

		return elements;
	}

	function getDomElement(element, doc) {
		if (!doc) {
			doc = document;
		}

		if (bmoor.isString(element)) {
			return doc.querySelector(element);
		} else {
			return element;
		}
	}

	function getDomCollection(elements, doc) {
		var i,
		    c,
		    j,
		    co,
		    el,
		    selection,
		    els = [];

		if (!doc) {
			doc = document;
		}

		elements = massage(elements);

		for (i = 0, c = elements.length; i < c; i++) {
			el = elements[i];
			if (bmoor.isString(el)) {
				selection = doc.querySelectorAll(el);
				for (j = 0, co = selection.length; j < co; j++) {
					els.push(selection[j]);
				}
			} else {
				els.push(el);
			}
		}

		return els;
	}

	function addClass(elements, className) {
		var i,
		    c,
		    node,
		    baseClass,
		    reg = getReg(className);

		elements = massage(elements);

		for (i = 0, c = elements.length; i < c; i++) {
			node = elements[i];
			baseClass = node.getAttribute('class') || '';

			if (!baseClass.match(reg)) {
				node.setAttribute('class', baseClass + ' ' + className);
			}
		}
	}

	function removeClass(elements, className) {
		var i,
		    c,
		    node,
		    reg = getReg(className);

		elements = massage(elements);

		for (i = 0, c = elements.length; i < c; i++) {
			node = elements[i];
			node.setAttribute('class', (node.getAttribute('class') || '').replace(reg, ''));
		}
	}

	function bringForward(elements) {
		var i, c, node;

		elements = massage(elements);

		for (i = 0, c = elements.length; i < c; i++) {
			node = elements[i];

			if (node.parentNode) {
				node.parentNode.appendChild(node);
			}
		}
	}

	function triggerEvent(node, eventName, eventData, eventSettings) {
		if (node.dispatchEvent) {
			if (!eventSettings) {
				eventSettings = { 'view': window, 'bubbles': true, 'cancelable': true };
			} else {
				if (eventSettings.bubbles === undefined) {
					eventSettings.bubbles = true;
				}
				if (eventSettings.cancelable === undefined) {
					eventSettings.cancelable = true;
				}
			}

			eventSettings.detail = eventData;

			var event = new CustomEvent(eventName, eventSettings);
			event.$bmoor = true; // allow detection of bmoor events

			node.dispatchEvent(event);
		} else if (node.fireEvent) {
			var doc = void 0;

			if (!bmoor.isString(eventName)) {
				throw new Error('Can not throw custom events in IE');
			}

			if (node.ownerDocument) {
				doc = node.ownerDocument;
			} else if (node.nodeType === 9) {
				// the node may be the document itself, nodeType 9 = DOCUMENT_NODE
				doc = node;
			} else if (typeof document !== 'undefined') {
				doc = document;
			} else {
				throw new Error('Invalid node passed to fireEvent: ' + node.id);
			}

			var _event = doc.createEventObject();
			_event.detail = eventData;
			_event.$bmoor = true; // allow detection of bmoor events

			node.fireEvent('on' + eventName, _event);
		} else {
			throw new Error('We can not trigger events here');
		}
	}

	function onEvent(node, eventName, cb, qualifier) {
		node.addEventListener(eventName, function (event) {
			if (qualifier && !(event.target || event.srcElement).matches(qualifier)) {
				return;
			}

			cb(event.detail, event);
		});
	}

	module.exports = {
		getScrollPosition: getScrollPosition,
		getBoundryBox: getBoundryBox,
		getDomElement: getDomElement,
		getDomCollection: getDomCollection,
		showOn: showOn,
		centerOn: centerOn,
		addClass: addClass,
		removeClass: removeClass,
		bringForward: bringForward,
		triggerEvent: triggerEvent,
		onEvent: onEvent,
		on: function on(node, settings) {
			Object.keys(settings).forEach(function (eventName) {
				var ops = settings[eventName];

				if (bmoor.isFunction(ops)) {
					onEvent(node, eventName, ops);
				} else {
					Object.keys(ops).forEach(function (qualifier) {
						var cb = ops[qualifier];

						onEvent(node, eventName, cb, qualifier);
					});
				}
			});
		}
	};

/***/ },
/* 9 */
/***/ function(module, exports) {

	"use strict";

	/**
	 * Array helper functions
	 * @module bmoor.data
	 **/

	var _id = 0;

	function nextUid() {
		return ++_id;
	}

	function setUid(obj) {
		var t = obj.$$bmoorUid;

		if (!t) {
			t = obj.$$bmoorUid = nextUid();
		}

		return t;
	}

	function getUid(obj) {
		if (!obj.$$bmoorUid) {
			setUid(obj);
		}

		return obj.$$bmoorUid;
	}

	module.exports = {
		setUid: setUid,
		getUid: getUid
	};

/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	module.exports = {
		soon: __webpack_require__(11),
		debounce: __webpack_require__(12),
		window: __webpack_require__(13)
	};

/***/ },
/* 11 */
/***/ function(module, exports) {

	"use strict";

	module.exports = function (cb, time, settings) {
		var ctx, args, timeout;

		if (!settings) {
			settings = {};
		}

		function fire() {
			timeout = null;
			cb.apply(settings.context || ctx, args);
		}

		var fn = function sooned() {
			ctx = this;
			args = arguments;

			if (!timeout) {
				timeout = setTimeout(fire, time);
			}
		};

		fn.clear = function () {
			clearTimeout(timeout);
			timeout = null;
		};

		fn.flush = function () {
			fire();
			fn.clear();
		};

		return fn;
	};

/***/ },
/* 12 */
/***/ function(module, exports) {

	"use strict";

	module.exports = function (cb, time, settings) {
		var ctx, args, limit, timeout;

		if (!settings) {
			settings = {};
		}

		function fire() {
			timeout = null;
			cb.apply(settings.context || ctx, args);
		}

		function run() {
			var now = Date.now();

			if (now >= limit) {
				fire();
			} else {
				timeout = setTimeout(run, limit - now);
			}
		}

		var fn = function debounced() {
			var now = Date.now();

			ctx = this;
			args = arguments;
			limit = now + time;

			if (!timeout) {
				timeout = setTimeout(run, time);
			}
		};

		fn.clear = function () {
			clearTimeout(timeout);
			timeout = null;
			limit = null;
		};

		fn.flush = function () {
			fire();
			fn.clear();
		};

		fn.shift = function (diff) {
			limit += diff;
		};

		return fn;
	};

/***/ },
/* 13 */
/***/ function(module, exports) {

	"use strict";

	module.exports = function (cb, min, max, settings) {
		var ctx, args, next, limit, timeout;

		if (!settings) {
			settings = {};
		}

		function fire() {
			limit = null;
			cb.apply(settings.context || ctx, args);
		}

		function run() {
			var now = Date.now();

			if (now >= limit || now >= next) {
				fire();
			} else {
				timeout = setTimeout(run, Math.min(limit, next) - now);
			}
		}

		var fn = function windowed() {
			var now = Date.now();

			ctx = this;
			args = arguments;
			next = now + min;

			if (!limit) {
				limit = now + max;
				timeout = setTimeout(run, min);
			}
		};

		fn.clear = function () {
			clearTimeout(timeout);
			timeout = null;
			limit = null;
		};

		fn.flush = function () {
			fire();
			fn.clear();
		};

		fn.shift = function (diff) {
			limit += diff;
		};

		return fn;
	};

/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	/**
	 * Array helper functions
	 * @module bmoor.array
	 **/

	var bmoor = __webpack_require__(7);

	/**
	 * Search an array for an element and remove it, starting at the begining or a specified location
	 *
	 * @function remove
	 * @param {array} arr An array to be searched
	 * @param {*} searchElement Content for which to be searched
	 * @param {integer} fromIndex The begining index from which to begin the search, defaults to 0
	 * @return {array} array containing removed element
	 **/
	function remove(arr, searchElement, fromIndex) {
		var pos = arr.indexOf(searchElement, fromIndex);

		if (pos > -1) {
			return arr.splice(pos, 1)[0];
		}
	}

	/**
	 * Search an array for an element and remove all instances of it, starting at the begining or a specified location
	 *
	 * @function remove
	 * @param {array} arr An array to be searched
	 * @param {*} searchElement Content for which to be searched
	 * @param {integer} fromIndex The begining index from which to begin the search, defaults to 0
	 * @return {integer} number of elements removed
	 **/
	function removeAll(arr, searchElement, fromIndex) {
		var r,
		    pos = arr.indexOf(searchElement, fromIndex);

		if (pos > -1) {
			r = removeAll(arr, searchElement, pos + 1);
			r.unshift(arr.splice(pos, 1)[0]);

			return r;
		} else {
			return [];
		}
	}

	function bisect(arr, value, func, preSorted) {
		var idx,
		    val,
		    bottom = 0,
		    top = arr.length - 1;

		if (!preSorted) {
			arr.sort(function (a, b) {
				return func(a) - func(b);
			});
		}

		if (func(arr[bottom]) >= value) {
			return {
				left: bottom,
				right: bottom
			};
		}

		if (func(arr[top]) <= value) {
			return {
				left: top,
				right: top
			};
		}

		if (arr.length) {
			while (top - bottom > 1) {
				idx = Math.floor((top + bottom) / 2);
				val = func(arr[idx]);

				if (val === value) {
					top = idx;
					bottom = idx;
				} else if (val > value) {
					top = idx;
				} else {
					bottom = idx;
				}
			}

			// if it is one of the end points, make it that point
			if (top !== idx && func(arr[top]) === value) {
				return {
					left: top,
					right: top
				};
			} else if (bottom !== idx && func(arr[bottom]) === value) {
				return {
					left: bottom,
					right: bottom
				};
			} else {
				return {
					left: bottom,
					right: top
				};
			}
		}
	}

	/**
	 * Compare two arrays.
	 *
	 * @function remove
	 * @param {array} arr1 An array to be compared
	 * @param {array} arr2 An array to be compared
	 * @param {function} func The comparison function
	 * @return {object} an object containing the elements unique to the left, matched, and unqiue to the right
	 **/
	function compare(arr1, arr2, func) {
		var cmp,
		    left = [],
		    right = [],
		    leftI = [],
		    rightI = [];

		arr1 = arr1.slice(0);
		arr2 = arr2.slice(0);

		arr1.sort(func);
		arr2.sort(func);

		while (arr1.length > 0 && arr2.length > 0) {
			cmp = func(arr1[0], arr2[0]);

			if (cmp < 0) {
				left.push(arr1.shift());
			} else if (cmp > 0) {
				right.push(arr2.shift());
			} else {
				leftI.push(arr1.shift());
				rightI.push(arr2.shift());
			}
		}

		while (arr1.length) {
			left.push(arr1.shift());
		}

		while (arr2.length) {
			right.push(arr2.shift());
		}

		return {
			left: left,
			intersection: {
				left: leftI,
				right: rightI
			},
			right: right
		};
	}

	/**
	 * Create a new array that is completely unique
	 *
	 * @function unique
	 * @param {array} arr The array to be made unique
	 * @param {function|boolean} sort If boolean === true, array is presorted.  If function, use to sort
	 **/
	function unique(arr, sort, uniqueFn) {
		var rtn = [];

		if (arr.length) {
			if (sort) {
				// more efficient because I can presort
				if (bmoor.isFunction(sort)) {
					arr = arr.slice(0).sort(sort);
				}

				var last = void 0;

				for (var i = 0, c = arr.length; i < c; i++) {
					var d = arr[i],
					    v = uniqueFn ? uniqueFn(d) : d;

					if (v !== last) {
						last = v;
						rtn.push(d);
					}
				}
			} else if (uniqueFn) {
				var hash = {};

				for (var _i = 0, _c = arr.length; _i < _c; _i++) {
					var _d = arr[_i],
					    _v = uniqueFn(_d);

					if (!hash[_v]) {
						hash[_v] = true;
						rtn.push(_d);
					}
				}
			} else {
				// greedy and inefficient
				for (var _i2 = 0, _c2 = arr.length; _i2 < _c2; _i2++) {
					var _d2 = arr[_i2];

					if (rtn.indexOf(_d2) === -1) {
						rtn.push(_d2);
					}
				}
			}
		}

		return rtn;
	}

	// I could probably make this sexier, like allow uniqueness algorithm, but I'm keeping it simple for now
	function intersection(arr1, arr2) {
		var rtn = [];

		if (arr1.length > arr2.length) {
			var t = arr1;

			arr1 = arr2;
			arr2 = t;
		}

		for (var i = 0, c = arr1.length; i < c; i++) {
			var d = arr1[i];

			if (arr2.indexOf(d) !== -1) {
				rtn.push(d);
			}
		}

		return rtn;
	}

	function difference(arr1, arr2) {
		var rtn = [];

		for (var i = 0, c = arr1.length; i < c; i++) {
			var d = arr1[i];

			if (arr2.indexOf(d) === -1) {
				rtn.push(d);
			}
		}

		return rtn;
	}

	module.exports = {
		remove: remove,
		removeAll: removeAll,
		bisect: bisect,
		compare: compare,
		unique: unique,
		intersection: intersection,
		difference: difference
	};

/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var bmoor = __webpack_require__(7),
	    mixin = __webpack_require__(16),
	    plugin = __webpack_require__(17),
	    decorate = __webpack_require__(18);

	function proc(action, proto, def) {
		var i, c;

		if (bmoor.isArray(def)) {
			for (i = 0, c = def.length; i < c; i++) {
				action(proto, def[i]);
			}
		} else {
			action(proto, def);
		}
	}

	function maker(root, config, base) {
		if (!base) {
			base = function BmoorPrototype() {};

			if (config) {
				if (bmoor.isFunction(root)) {
					base = function BmoorPrototype() {
						root.apply(this, arguments);
					};

					base.prototype = Object.create(root.prototype);
				} else {
					base.prototype = Object.create(root);
				}
			} else {
				config = root;
			}
		}

		if (config.mixin) {
			proc(mixin, base.prototype, config.mixin);
		}

		if (config.decorate) {
			proc(decorate, base.prototype, config.decorate);
		}

		if (config.plugin) {
			proc(plugin, base.prototype, config.plugin);
		}

		return base;
	}

	maker.mixin = mixin;
	maker.decorate = decorate;
	maker.plugin = plugin;

	module.exports = maker;

/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var bmoor = __webpack_require__(7);

	module.exports = function (to, from) {
		bmoor.iterate(from, function (val, key) {
			to[key] = val;
		});
	};

/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

	var bmoor = __webpack_require__(7);

	function override(key, target, action, plugin) {
		var old = target[key];

		if (old === undefined) {
			if (bmoor.isFunction(action)) {
				target[key] = function () {
					return action.apply(plugin, arguments);
				};
			} else {
				target[key] = action;
			}
		} else {
			if (bmoor.isFunction(action)) {
				if (bmoor.isFunction(old)) {
					target[key] = function () {
						var backup = plugin.$old,
						    reference = plugin.$target,
						    rtn;

						plugin.$target = target;
						plugin.$old = function () {
							return old.apply(target, arguments);
						};

						rtn = action.apply(plugin, arguments);

						plugin.$old = backup;
						plugin.$target = reference;

						return rtn;
					};
				} else {
					console.log('attempting to plug-n-play ' + key + ' an instance of ' + (typeof old === 'undefined' ? 'undefined' : _typeof(old)));
				}
			} else {
				console.log('attempting to plug-n-play with ' + key + ' and instance of ' + (typeof action === 'undefined' ? 'undefined' : _typeof(action)));
			}
		}
	}

	module.exports = function (to, from, ctx) {
		bmoor.iterate(from, function (val, key) {
			override(key, to, val, ctx);
		});
	};

/***/ },
/* 18 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

	var bmoor = __webpack_require__(7);

	function override(key, target, action) {
		var old = target[key];

		if (old === undefined) {
			target[key] = action;
		} else {
			if (bmoor.isFunction(action)) {
				if (bmoor.isFunction(old)) {
					target[key] = function () {
						var backup = this.$old,
						    rtn;

						this.$old = old;

						rtn = action.apply(this, arguments);

						this.$old = backup;

						return rtn;
					};
				} else {
					console.log('attempting to decorate ' + key + ' an instance of ' + (typeof old === 'undefined' ? 'undefined' : _typeof(old)));
				}
			} else {
				console.log('attempting to decorate with ' + key + ' and instance of ' + (typeof action === 'undefined' ? 'undefined' : _typeof(action)));
			}
		}
	}

	module.exports = function (to, from) {
		bmoor.iterate(from, function (val, key) {
			override(key, to, val);
		});
	};

/***/ },
/* 19 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

	/**
	 * Object helper functions
	 * @module bmoor.object
	 **/

	var bmoor = __webpack_require__(7);

	function values(obj) {
		var res = [];

		bmoor.naked(obj, function (v) {
			res.push(v);
		});

		return res;
	}

	function keys(obj) {
		var res = [];

		if (Object.keys) {
			return Object.keys(obj);
		} else {
			bmoor.naked(obj, function (v, key) {
				res.push(key);
			});

			return res;
		}
	}

	/**
	 * Takes a hash and uses the indexs as namespaces to add properties to an objs
	 *
	 * @function explode
	 * @param {object} target The object to map the variables onto
	 * @param {object} mappings An object orientended as [ namespace ] => value
	 * @return {object} The object that has had content mapped into it
	 **/
	function explode(target, mappings) {
		if (!mappings) {
			mappings = target;
			target = {};
		}

		bmoor.iterate(mappings, function (val, mapping) {
			bmoor.set(target, mapping, val);
		});

		return target;
	}

	function makeExploder(paths) {
		var fn;

		paths.forEach(function (path) {
			var old = fn,
			    setter = bmoor.makeSetter(path);

			if (old) {
				fn = function fn(ctx, obj) {
					setter(ctx, obj[path]);
					old(ctx, obj);
				};
			} else {
				fn = function fn(ctx, obj) {
					setter(ctx, obj[path]);
				};
			}
		});

		return function (obj) {
			var rtn = {};

			fn(rtn, obj);

			return rtn;
		};
	}

	function implode(obj, ignore) {
		var rtn = {};

		if (!ignore) {
			ignore = {};
		}

		bmoor.iterate(obj, function (val, key) {
			var t = ignore[key];

			if (bmoor.isObject(val)) {
				if (t === false) {
					rtn[key] = val;
				} else if (!t || bmoor.isObject(t)) {
					bmoor.iterate(implode(val, t), function (v, k) {
						rtn[key + '.' + k] = v;
					});
				}
			} else if (!t) {
				rtn[key] = val;
			}
		});

		return rtn;
	}

	/**
	 * Create a new instance from an object and some arguments
	 *
	 * @function mask
	 * @param {function} obj The basis for the constructor
	 * @param {array} args The arguments to pass to the constructor
	 * @return {object} The new object that has been constructed
	 **/
	function mask(obj) {
		if (Object.create) {
			var T = function Masked() {};

			T.prototype = obj;

			return new T();
		} else {
			return Object.create(obj);
		}
	}

	/**
	 * Create a new instance from an object and some arguments.  This is a shallow copy to <- from[...]
	 * 
	 * @function extend
	 * @param {object} to Destination object.
	 * @param {...object} src Source object(s).
	 * @returns {object} Reference to `dst`.
	 **/
	function extend(to) {
		bmoor.loop(arguments, function (cpy) {
			if (cpy !== to) {
				if (to && to.extend) {
					to.extend(cpy);
				} else {
					bmoor.iterate(cpy, function (value, key) {
						to[key] = value;
					});
				}
			}
		});

		return to;
	}

	function empty(to) {
		bmoor.iterate(to, function (v, k) {
			delete to[k]; // TODO : would it be ok to set it to undefined?
		});
	}

	function copy(to) {
		empty(to);

		return extend.apply(undefined, arguments);
	}

	// Deep copy version of extend
	function merge(to) {
		var from,
		    i,
		    c,
		    m = function m(val, key) {
			to[key] = merge(to[key], val);
		};

		for (i = 1, c = arguments.length; i < c; i++) {
			from = arguments[i];

			if (to === from) {
				continue;
			} else if (to && to.merge) {
				to.merge(from);
			} else if (!bmoor.isObject(from)) {
				to = from;
			} else if (!bmoor.isObject(to)) {
				to = merge({}, from);
			} else {
				bmoor.safe(from, m);
			}
		}

		return to;
	}

	/**
	 * A general comparison algorithm to test if two objects are equal
	 *
	 * @function equals
	 * @param {object} obj1 The object to copy the content from
	 * @param {object} obj2 The object into which to copy the content
	 * @preturns {boolean}
	 **/
	function equals(obj1, obj2) {
		var t1 = typeof obj1 === 'undefined' ? 'undefined' : _typeof(obj1),
		    t2 = typeof obj2 === 'undefined' ? 'undefined' : _typeof(obj2),
		    c,
		    i,
		    keyCheck;

		if (obj1 === obj2) {
			return true;
		} else if (obj1 !== obj1 && obj2 !== obj2) {
			return true; // silly NaN
		} else if (obj1 === null || obj1 === undefined || obj2 === null || obj2 === undefined) {
			return false; // undefined or null
		} else if (obj1.equals) {
			return obj1.equals(obj2);
		} else if (obj2.equals) {
			return obj2.equals(obj1); // because maybe somene wants a class to be able to equal a simple object
		} else if (t1 === t2) {
			if (t1 === 'object') {
				if (bmoor.isArrayLike(obj1)) {
					if (!bmoor.isArrayLike(obj2)) {
						return false;
					}

					if ((c = obj1.length) === obj2.length) {
						for (i = 0; i < c; i++) {
							if (!equals(obj1[i], obj2[i])) {
								return false;
							}
						}

						return true;
					}
				} else if (!bmoor.isArrayLike(obj2)) {
					keyCheck = {};
					for (i in obj1) {
						if (obj1.hasOwnProperty(i)) {
							if (!equals(obj1[i], obj2[i])) {
								return false;
							}

							keyCheck[i] = true;
						}
					}

					for (i in obj2) {
						if (obj2.hasOwnProperty(i)) {
							if (!keyCheck && obj2[i] !== undefined) {
								return false;
							}
						}
					}
				}
			}
		}

		return false;
	}

	module.exports = {
		keys: keys,
		values: values,
		explode: explode,
		makeExploder: makeExploder,
		implode: implode,
		mask: mask,
		extend: extend,
		empty: empty,
		copy: copy,
		merge: merge,
		equals: equals
	};

/***/ },
/* 20 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var bmoor = __webpack_require__(7);

	/**
	 * Array helper functions
	 * @module bmoor.string
	 **/

	function trim(str, chr) {
		if (!chr) {
			chr = '\\s';
		}
		return str.replace(new RegExp('^' + chr + '+|' + chr + '+$', 'g'), '');
	}

	function ltrim(str, chr) {
		if (!chr) {
			chr = '\\s';
		}
		return str.replace(new RegExp('^' + chr + '+', 'g'), '');
	}

	function rtrim(str, chr) {
		if (!chr) {
			chr = '\\s';
		}
		return str.replace(new RegExp(chr + '+$', 'g'), '');
	}

	// TODO : eventually I will make getCommands and getFormatter more complicated, but for now
	//        they work by staying simple
	function getCommands(str) {
		var commands = str.split('|');

		commands.forEach(function (command, key) {
			var args = command.split(':');

			args.forEach(function (arg, k) {
				args[k] = trim(arg);
			});

			commands[key] = {
				command: command,
				method: args.shift(),
				args: args
			};
		});

		return commands;
	}

	function stackFunctions(newer, older) {
		return function (o) {
			return older(newer(o));
		};
	}

	var filters = {
		precision: function precision(dec) {
			dec = parseInt(dec, 10);

			return function (num) {
				return parseFloat(num, 10).toFixed(dec);
			};
		},
		currency: function currency() {
			return function (num) {
				return '$' + num;
			};
		},
		url: function url() {
			return function (param) {
				return encodeURIComponent(param);
			};
		}
	};

	function doFilters(ters) {
		var fn, command, filter;

		while (ters.length) {
			command = ters.pop();
			fn = filters[command.method];

			if (fn) {
				fn = fn.apply(null, command.args);

				if (filter) {
					filter = stackFunctions(fn, filter);
				} else {
					filter = fn;
				}
			}
		}

		return filter;
	}

	function doVariable(lines) {
		var fn, rtn, dex, line, getter, command, commands, remainder;

		if (!lines.length) {
			return null;
		} else {
			line = lines.shift();
			dex = line.indexOf('}}');
			fn = doVariable(lines);

			if (dex === -1) {
				return function () {
					return '| no close |';
				};
			} else if (dex === 0) {
				// is looks like this {{}}
				remainder = line.substr(2);
				getter = function getter(o) {
					if (bmoor.isObject(o)) {
						return JSON.stringify(o);
					} else {
						return o;
					}
				};
			} else {
				commands = getCommands(line.substr(0, dex));
				command = commands.shift().command;
				remainder = line.substr(dex + 2);
				getter = bmoor.makeGetter(command);

				if (commands.length) {
					commands = doFilters(commands, getter);

					if (commands) {
						getter = stackFunctions(getter, commands);
					}
				}
			}

			//let's optimize this a bit
			if (fn) {
				// we have a child method
				rtn = function rtn(obj) {
					return getter(obj) + remainder + fn(obj);
				};
				rtn.$vars = fn.$vars;
			} else {
				// this is the last variable
				rtn = function rtn(obj) {
					return getter(obj) + remainder;
				};
				rtn.$vars = [];
			}

			if (command) {
				rtn.$vars.push(command);
			}

			return rtn;
		}
	}

	function getFormatter(str) {
		var fn,
		    rtn,
		    lines = str.split(/{{/g);

		if (lines.length > 1) {
			str = lines.shift();
			fn = doVariable(lines);
			rtn = function rtn(obj) {
				return str + fn(obj);
			};
			rtn.$vars = fn.$vars;
		} else {
			rtn = function rtn() {
				return str;
			};
			rtn.$vars = [];
		}

		return rtn;
	}

	getFormatter.filters = filters;

	module.exports = {
		trim: trim,
		ltrim: ltrim,
		rtrim: rtrim,
		getCommands: getCommands,
		getFormatter: getFormatter
	};

/***/ },
/* 21 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var window = __webpack_require__(13);

	function always(promise, func) {
		promise.then(func, func);
		return promise;
	}

	function stack(calls, settings) {

		if (!calls) {
			throw new Error('calling stack with no call?');
		}

		if (!settings) {
			settings = {};
		}

		var min = settings.min || 1,
		    max = settings.max || 10,
		    limit = settings.limit || 5,
		    update = window(settings.update || function () {}, min, max);

		return new Promise(function (resolve, reject) {
			var run,
			    timeout,
			    errors = [],
			    active = 0,
			    callStack = calls.slice(0);

			function registerError(err) {
				errors.push(err);
			}

			function next() {
				active--;

				update({ active: active, remaining: callStack.length });

				if (callStack.length) {
					if (!timeout) {
						timeout = setTimeout(run, 1);
					}
				} else if (!active) {
					if (errors.length) {
						reject(errors);
					} else {
						resolve();
					}
				}
			}

			run = function run() {
				timeout = null;

				while (active < limit && callStack.length) {
					var fn = callStack.pop();

					active++;

					fn().catch(registerError).then(next);
				}
			};

			run();
		});
	}

	function hash(obj) {
		var rtn = {};

		return Promise.all(Object.keys(obj).map(function (key) {
			var p = obj[key];

			if (p && p.then) {
				p.then(function (v) {
					rtn[key] = v;
				});
			} else {
				rtn[key] = p;
			}

			return p;
		})).then(function () {
			return rtn;
		});
	}

	module.exports = {
		hash: hash,
		stack: stack,
		always: always
	};

/***/ },
/* 22 */
/***/ function(module, exports) {

	'use strict';

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var master = {};

	var Memory = function () {
		function Memory(name) {
			_classCallCheck(this, Memory);

			var index = {};

			this.name = name;
			this.get = function (name) {
				return index[name];
			};

			this.check = function (name) {
				console.log('Memory::check will soon removed');
				return index[name];
			};

			this.isSet = function (name) {
				return !!index[name];
			};

			this.register = function (name, obj) {
				index[name] = obj;
			};

			this.clear = function (name) {
				if (name in index) {
					delete index[name];
				}
			};

			this.keys = function () {
				return Object.keys(index);
			};
		}

		_createClass(Memory, [{
			key: 'import',
			value: function _import(json) {
				var _this = this;

				Object.keys(json).forEach(function (key) {
					_this.register(key, json[key]);
				});
			}
		}, {
			key: 'export',
			value: function _export() {
				var _this2 = this;

				return this.keys().reduce(function (rtn, key) {
					rtn[key] = _this2.get(key);

					return rtn;
				}, {});
			}
		}]);

		return Memory;
	}();

	module.exports = {
		Memory: Memory,
		use: function use(title) {
			var rtn = master[title];

			if (rtn) {
				throw new Error('Memory already exists ' + title);
			} else {
				rtn = master[title] = new Memory(title);
			}

			return rtn;
		}
	};

/***/ },
/* 23 */
/***/ function(module, exports) {

	"use strict";

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var Eventing = function () {
		function Eventing() {
			_classCallCheck(this, Eventing);

			this._listeners = {};
		}

		_createClass(Eventing, [{
			key: "on",
			value: function on(event, cb) {
				var listeners;

				if (!this._listeners[event]) {
					this._listeners[event] = [];
				}

				listeners = this._listeners[event];

				listeners.push(cb);

				return function clear$on() {
					listeners.splice(listeners.indexOf(cb), 1);
				};
			}
		}, {
			key: "once",
			value: function once(event, cb) {
				var clear,
				    fn = function fn() {
					clear();
					cb.apply(this, arguments);
				};

				clear = this.on(event, fn);

				return clear;
			}
		}, {
			key: "subscribe",
			value: function subscribe(subscriptions) {
				var dis = this,
				    kills = [],
				    events = Object.keys(subscriptions);

				events.forEach(function (event) {
					var action = subscriptions[event];

					kills.push(dis.on(event, action));
				});

				return function killAll() {
					kills.forEach(function (kill) {
						kill();
					});
				};
			}
		}, {
			key: "trigger",
			value: function trigger(event) {
				var _this = this;

				var args = Array.prototype.slice.call(arguments, 1);

				if (this.hasWaiting(event)) {
					this._listeners[event].slice(0).forEach(function (cb) {
						cb.apply(_this, args);
					});
				}
			}
		}, {
			key: "hasWaiting",
			value: function hasWaiting(event) {
				return !!this._listeners[event];
			}
		}]);

		return Eventing;
	}();

	module.exports = Eventing;

/***/ },
/* 24 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var bmoor = __webpack_require__(6),
	    Requestor = __webpack_require__(25);

	module.exports = function (obj, definition) {
		bmoor.each(definition, function (def, name) {
			var defaults = {};
			var fn, req;

			if (def) {
				// at least protect from undefined and null
				if (bmoor.isFunction(def)) {
					obj[name] = def;
				} else {
					if (bmoor.isString(def)) {
						def = { url: def };
					}

					if (def.defaultSettings) {
						defaults = def.defaultSettings;
					}

					req = new Requestor(def);

					if (def.interface) {
						fn = function restfulRequest() {
							var commands = def.interface.apply(this, arguments);

							return req.go(commands.args, commands.datum, Object.assign({}, defaults, commands.settings));
						};
					} else {
						fn = function restfulRequest(args, datum, settings) {
							return req.go(args, datum, Object.assign({}, defaults, settings));
						};
					}

					fn.$settings = def;

					obj[name] = fn;
				}
			}
		});
	};

/***/ },
/* 25 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var Url = __webpack_require__(26),
	    bmoor = __webpack_require__(6),
	    Promise = __webpack_require__(27).Promise,
	    Eventing = bmoor.Eventing;

	/*
	settings :
		message sending
		- url
		- method
		- encode : process the parsed in args
		- preload : run against ctx before send
		- cached : should the request be cached, cached never clear
		- batched : requests made closely together can be batched use the same promise
		- linger : how long does a batch take to clear

		request settings
		- fetcher : the fetching object, uses api from window.fetch 
		- headers
		- data : generate the content to send to the server
		- comm : per request settings
		- intercept : don't send external request, instead stub with this

		response handing
		- decode : covert response 
		- always
		- validation
		- success
		- failure

		close
		
	*/

	var events = new Eventing(),
	    requestors = [],
	    defaultSettings = {
		comm: {},
		linger: null,
		headers: {},
		method: 'GET',
		cached: false,
		batched: true
	};

	var Requestor = function () {
		function Requestor(settings) {
			_classCallCheck(this, Requestor);

			var mine;

			mine = Object.create(settings || {});

			if (!mine.cache) {
				mine.cache = {};
			}

			if (!mine.deferred) {
				mine.deferred = {};
			}

			this.getSetting = function (setting) {
				if (setting in mine) {
					return mine[setting];
				} else {
					return defaultSettings[setting];
				}
			};

			this.clearCache = function () {
				Object.keys(mine.cache).forEach(function (k) {
					mine.cache[k] = null;
				});
			};

			this.clearRoute = function (method, url) {
				var u = method.toUpperCase() + '::' + url;

				mine.cache[u] = null;
				mine.deferred[u] = null;
			};

			requestors.push(this);
		}

		_createClass(Requestor, [{
			key: 'go',
			value: function go(args, datum, settings) {
				var _this = this;

				var ctx,
				    cached,
				    batched,
				    reference,
				    url = this.getSetting('url'),
				    prep = this.getSetting('prep'),
				    cache = this.getSetting('cache'),
				    method = this.getSetting('method').toUpperCase(),
				    deferred = this.getSetting('deferred');

				if (!args) {
					args = {};
				}

				if (!settings) {
					settings = {};
				}

				if (prep) {
					ctx = Object.create(prep(args));
					ctx.args = args;
				} else if (args) {
					ctx = { args: args || {} };
				}

				ctx.settings = settings;

				// some helping functions
				ctx.getSetting = function (setting) {
					if (setting in settings) {
						return settings[setting];
					} else {
						return _this.getSetting(setting);
					}
				};

				// allowed to be overridden on a per call level
				cached = ctx.getSetting('cached');
				batched = ctx.getSetting('batched');

				ctx.evalSetting = function (setting) {
					var v = ctx.getSetting(setting);

					if (bmoor.isFunction(v)) {
						return v(ctx.args, datum, ctx);
					} else {
						return v;
					}
				};

				// translate the url for request
				url = ctx.getSetting('url');
				if (bmoor.isFunction(url)) {
					url = url(ctx.args, datum, ctx);
				}

				// allow all strings to be called via formatter
				url = new Url(url).go(ctx.args, datum, ctx);

				reference = method + '::' + url;

				ctx.ref = reference;

				return Promise.resolve(ctx.evalSetting('preload')).then(function () {
					var res;

					if (cached && cache[reference]) {
						return cache[reference];
					} else if (batched && deferred[reference]) {
						return deferred[reference];
					} else {
						res = _this.response(_this.request(ctx, datum, url, method), ctx);

						if (batched && method === 'GET') {
							deferred[reference] = res;
						}

						if (cached) {
							cache[reference] = res;
						}

						bmoor.promise.always(res, function () {
							_this.close(ctx);
						});

						return res;
					}
				});
			}
		}, {
			key: 'request',
			value: function request(ctx, datum, url, method) {
				var req,
				    fetched,
				    comm = ctx.getSetting('comm'),
				    code = ctx.getSetting('code'),
				    encode = ctx.getSetting('encode'),
				    fetcher = this.getSetting('fetcher'),
				    headers = ctx.evalSetting('headers'),
				    intercept = ctx.getSetting('intercept');

				if (encode) {
					datum = encode(datum, ctx.args, ctx);
				}
				ctx.payload = datum;

				events.trigger('request', url, datum, ctx.settings, ctx);

				if (intercept) {
					if (bmoor.isFunction(intercept)) {
						intercept = intercept(datum, ctx);
					}

					// here we intercept the request, and respond back with a fetch like object
					if (intercept.then) {
						return intercept.then(function (v) {
							return {
								json: function json() {
									return Promise.resolve(v);
								},
								status: code || 200
							};
						});
					} else {
						return Promise.resolve({
							json: function json() {
								return Promise.resolve(intercept);
							},
							status: code || 200
						});
					}
				} else {
					req = bmoor.object.extend({
						'method': method,
						'headers': bmoor.object.extend({}, headers)
					}, comm);

					if (datum) {
						if (datum instanceof FormData) {
							req.body = datum;
							delete req.headers['content-type'];
						} else {
							req.body = JSON.stringify(datum);
							if (!req.headers['content-type']) {
								req.headers['content-type'] = 'application/json';
							}
						}
					}

					fetched = fetcher(url, req);

					return Promise.resolve(fetched);
				}
			}
		}, {
			key: 'response',
			value: function response(q, ctx) {
				var t,
				    response,
				    decode = ctx.getSetting('decode'),
				    always = ctx.getSetting('always'),
				    success = ctx.getSetting('success'),
				    failure = ctx.getSetting('failure'),
				    validation = ctx.getSetting('validation');

				t = bmoor.promise.always(q, function () {
					events.trigger('response', ctx.settings, ctx);

					if (always) {
						always(ctx);
					}
				}).then(function (fetched) {
					// we hava successful transmition
					var req,
					    code = ctx.getSetting('code');

					response = fetched;

					if (code && fetched.status !== code) {
						throw new Error('Requestor::code');
					} else if (fetched.status && (fetched.status < 200 || 299 < fetched.status)) {
						throw new Error('Requestor::status');
					}

					if (decode) {
						req = decode(fetched);
					} else if (fetched.text) {
						req = fetched.text().then(function (t) {
							try {
								return JSON.parse(t);
							} catch (ex) {
								return t;
							}
						});
					} else if (fetched.json) {
						// this is a fake fetched object gaurenteed to return json
						req = fetched.json();
					} else {
						throw new Error('fetched response must have text or json');
					}

					return Promise.resolve(req).then(function (res) {
						if (validation && !validation(res, ctx, fetched)) {
							throw new Error('Requestor::validation');
						}

						return success ? success(res, ctx) : res;
					});
				});

				t.then(function (res) {
					events.trigger('success', res, response, ctx.settings, ctx);
				}, function (error) {
					events.trigger('failure', error, response, ctx.settings, ctx);

					if (failure) {
						error.response = response;

						failure(error, ctx);
					}
				});

				return t;
			}
		}, {
			key: 'close',
			value: function close(ctx) {
				var linger = ctx.getSetting('linger'),
				    deferred = this.getSetting('deferred');

				if (linger !== null) {
					setTimeout(function () {
						deferred[ctx.ref] = null;
					}, linger);
				} else {
					deferred[ctx.ref] = null;
				}
			}
		}]);

		return Requestor;
	}();

	Requestor.events = events;
	Requestor.settings = defaultSettings;
	Requestor.clearCache = function () {
		requestors.forEach(function (r) {
			r.clearCache();
		});
	};

	module.exports = Requestor;

/***/ },
/* 26 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var bmoor = __webpack_require__(6);
	var parser = /[\?&;]([^=]+)\=([^&;#]+)/g;
	var getFormatter = bmoor.string.getFormatter;

	function stack(old, variable, value) {
		var rtn = null;

		var format = getFormatter(value);

		function fn(value) {
			if (Array.isArray(value)) {
				return format(value.join(','));
			} else {
				return format(value);
			}
		}

		if (old) {
			rtn = function rtn(obj) {
				return old(obj) + '&' + variable + '=' + fn(obj);
			};
		} else {
			rtn = function rtn(obj) {
				return variable + '=' + fn(obj);
			};
		}

		return rtn;
	}

	// TODO : I want to convert this to using and generating native URL.
	/****
	 * var url = new URL("https://geo.example.org/api"),
	 * params = {lat:35.696233, long:139.570431}
	 * Object.keys(params).forEach(key => url.searchParams.append(key, params[key]))
	 * fetch(url).then(...)
	 */

	var Url = function () {
		function Url(url) {
			_classCallCheck(this, Url);

			var pos, path, query;

			if (!url || url.indexOf('{{') === -1) {
				path = function path() {
					return url;
				};
				query = null;
			} else {
				url = url.replace(/\}\}/g, '|url}}');

				pos = url.indexOf('?');

				if (pos === -1) {
					path = getFormatter(url);
					query = null;
				} else {
					path = getFormatter(url.substring(0, pos));
					url = url.substring(pos);

					var match = void 0;
					while ((match = parser.exec(url)) !== null) {
						query = stack(query, match[1], match[2]);
					}
				}
			}

			this.path = path;
			this.query = query;
		}

		_createClass(Url, [{
			key: 'go',
			value: function go(obj) {
				var _this = this;

				var u = this.path(obj);

				if (this.query) {
					if (bmoor.isArray(obj)) {
						obj.forEach(function (v, i) {
							if (i) {
								u += '&';
							} else {
								u += '?';
							}

							u += _this.query(v);
						});
					} else {
						u += '?' + this.query(obj);
					}
				}

				return u;
			}
		}]);

		return Url;
	}();

	module.exports = Url;

/***/ },
/* 27 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_RESULT__;var require;/* WEBPACK VAR INJECTION */(function(process, global) {'use strict';

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

	/*!
	 * @overview es6-promise - a tiny implementation of Promises/A+.
	 * @copyright Copyright (c) 2014 Yehuda Katz, Tom Dale, Stefan Penner and contributors (Conversion to ES6 API by Jake Archibald)
	 * @license   Licensed under MIT license
	 *            See https://raw.githubusercontent.com/stefanpenner/es6-promise/master/LICENSE
	 * @version   4.1.0
	 */

	(function (global, factory) {
	  ( false ? 'undefined' : _typeof(exports)) === 'object' && typeof module !== 'undefined' ? module.exports = factory() :  true ? !(__WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.call(exports, __webpack_require__, exports, module)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)) : global.ES6Promise = factory();
	})(undefined, function () {
	  'use strict';

	  function objectOrFunction(x) {
	    return typeof x === 'function' || (typeof x === 'undefined' ? 'undefined' : _typeof(x)) === 'object' && x !== null;
	  }

	  function isFunction(x) {
	    return typeof x === 'function';
	  }

	  var _isArray = undefined;
	  if (!Array.isArray) {
	    _isArray = function _isArray(x) {
	      return Object.prototype.toString.call(x) === '[object Array]';
	    };
	  } else {
	    _isArray = Array.isArray;
	  }

	  var isArray = _isArray;

	  var len = 0;
	  var vertxNext = undefined;
	  var customSchedulerFn = undefined;

	  var asap = function asap(callback, arg) {
	    queue[len] = callback;
	    queue[len + 1] = arg;
	    len += 2;
	    if (len === 2) {
	      // If len is 2, that means that we need to schedule an async flush.
	      // If additional callbacks are queued before the queue is flushed, they
	      // will be processed by this flush that we are scheduling.
	      if (customSchedulerFn) {
	        customSchedulerFn(flush);
	      } else {
	        scheduleFlush();
	      }
	    }
	  };

	  function setScheduler(scheduleFn) {
	    customSchedulerFn = scheduleFn;
	  }

	  function setAsap(asapFn) {
	    asap = asapFn;
	  }

	  var browserWindow = typeof window !== 'undefined' ? window : undefined;
	  var browserGlobal = browserWindow || {};
	  var BrowserMutationObserver = browserGlobal.MutationObserver || browserGlobal.WebKitMutationObserver;
	  var isNode = typeof self === 'undefined' && typeof process !== 'undefined' && {}.toString.call(process) === '[object process]';

	  // test for web worker but not in IE10
	  var isWorker = typeof Uint8ClampedArray !== 'undefined' && typeof importScripts !== 'undefined' && typeof MessageChannel !== 'undefined';

	  // node
	  function useNextTick() {
	    // node version 0.10.x displays a deprecation warning when nextTick is used recursively
	    // see https://github.com/cujojs/when/issues/410 for details
	    return function () {
	      return process.nextTick(flush);
	    };
	  }

	  // vertx
	  function useVertxTimer() {
	    if (typeof vertxNext !== 'undefined') {
	      return function () {
	        vertxNext(flush);
	      };
	    }

	    return useSetTimeout();
	  }

	  function useMutationObserver() {
	    var iterations = 0;
	    var observer = new BrowserMutationObserver(flush);
	    var node = document.createTextNode('');
	    observer.observe(node, { characterData: true });

	    return function () {
	      node.data = iterations = ++iterations % 2;
	    };
	  }

	  // web worker
	  function useMessageChannel() {
	    var channel = new MessageChannel();
	    channel.port1.onmessage = flush;
	    return function () {
	      return channel.port2.postMessage(0);
	    };
	  }

	  function useSetTimeout() {
	    // Store setTimeout reference so es6-promise will be unaffected by
	    // other code modifying setTimeout (like sinon.useFakeTimers())
	    var globalSetTimeout = setTimeout;
	    return function () {
	      return globalSetTimeout(flush, 1);
	    };
	  }

	  var queue = new Array(1000);
	  function flush() {
	    for (var i = 0; i < len; i += 2) {
	      var callback = queue[i];
	      var arg = queue[i + 1];

	      callback(arg);

	      queue[i] = undefined;
	      queue[i + 1] = undefined;
	    }

	    len = 0;
	  }

	  function attemptVertx() {
	    try {
	      var r = require;
	      var vertx = __webpack_require__(29);
	      vertxNext = vertx.runOnLoop || vertx.runOnContext;
	      return useVertxTimer();
	    } catch (e) {
	      return useSetTimeout();
	    }
	  }

	  var scheduleFlush = undefined;
	  // Decide what async method to use to triggering processing of queued callbacks:
	  if (isNode) {
	    scheduleFlush = useNextTick();
	  } else if (BrowserMutationObserver) {
	    scheduleFlush = useMutationObserver();
	  } else if (isWorker) {
	    scheduleFlush = useMessageChannel();
	  } else if (browserWindow === undefined && "function" === 'function') {
	    scheduleFlush = attemptVertx();
	  } else {
	    scheduleFlush = useSetTimeout();
	  }

	  function then(onFulfillment, onRejection) {
	    var _arguments = arguments;

	    var parent = this;

	    var child = new this.constructor(noop);

	    if (child[PROMISE_ID] === undefined) {
	      makePromise(child);
	    }

	    var _state = parent._state;

	    if (_state) {
	      (function () {
	        var callback = _arguments[_state - 1];
	        asap(function () {
	          return invokeCallback(_state, child, callback, parent._result);
	        });
	      })();
	    } else {
	      subscribe(parent, child, onFulfillment, onRejection);
	    }

	    return child;
	  }

	  /**
	    `Promise.resolve` returns a promise that will become resolved with the
	    passed `value`. It is shorthand for the following:
	  
	    ```javascript
	    let promise = new Promise(function(resolve, reject){
	      resolve(1);
	    });
	  
	    promise.then(function(value){
	      // value === 1
	    });
	    ```
	  
	    Instead of writing the above, your code now simply becomes the following:
	  
	    ```javascript
	    let promise = Promise.resolve(1);
	  
	    promise.then(function(value){
	      // value === 1
	    });
	    ```
	  
	    @method resolve
	    @static
	    @param {Any} value value that the returned promise will be resolved with
	    Useful for tooling.
	    @return {Promise} a promise that will become fulfilled with the given
	    `value`
	  */
	  function resolve(object) {
	    /*jshint validthis:true */
	    var Constructor = this;

	    if (object && (typeof object === 'undefined' ? 'undefined' : _typeof(object)) === 'object' && object.constructor === Constructor) {
	      return object;
	    }

	    var promise = new Constructor(noop);
	    _resolve(promise, object);
	    return promise;
	  }

	  var PROMISE_ID = Math.random().toString(36).substring(16);

	  function noop() {}

	  var PENDING = void 0;
	  var FULFILLED = 1;
	  var REJECTED = 2;

	  var GET_THEN_ERROR = new ErrorObject();

	  function selfFulfillment() {
	    return new TypeError("You cannot resolve a promise with itself");
	  }

	  function cannotReturnOwn() {
	    return new TypeError('A promises callback cannot return that same promise.');
	  }

	  function getThen(promise) {
	    try {
	      return promise.then;
	    } catch (error) {
	      GET_THEN_ERROR.error = error;
	      return GET_THEN_ERROR;
	    }
	  }

	  function tryThen(then, value, fulfillmentHandler, rejectionHandler) {
	    try {
	      then.call(value, fulfillmentHandler, rejectionHandler);
	    } catch (e) {
	      return e;
	    }
	  }

	  function handleForeignThenable(promise, thenable, then) {
	    asap(function (promise) {
	      var sealed = false;
	      var error = tryThen(then, thenable, function (value) {
	        if (sealed) {
	          return;
	        }
	        sealed = true;
	        if (thenable !== value) {
	          _resolve(promise, value);
	        } else {
	          fulfill(promise, value);
	        }
	      }, function (reason) {
	        if (sealed) {
	          return;
	        }
	        sealed = true;

	        _reject(promise, reason);
	      }, 'Settle: ' + (promise._label || ' unknown promise'));

	      if (!sealed && error) {
	        sealed = true;
	        _reject(promise, error);
	      }
	    }, promise);
	  }

	  function handleOwnThenable(promise, thenable) {
	    if (thenable._state === FULFILLED) {
	      fulfill(promise, thenable._result);
	    } else if (thenable._state === REJECTED) {
	      _reject(promise, thenable._result);
	    } else {
	      subscribe(thenable, undefined, function (value) {
	        return _resolve(promise, value);
	      }, function (reason) {
	        return _reject(promise, reason);
	      });
	    }
	  }

	  function handleMaybeThenable(promise, maybeThenable, then$$) {
	    if (maybeThenable.constructor === promise.constructor && then$$ === then && maybeThenable.constructor.resolve === resolve) {
	      handleOwnThenable(promise, maybeThenable);
	    } else {
	      if (then$$ === GET_THEN_ERROR) {
	        _reject(promise, GET_THEN_ERROR.error);
	        GET_THEN_ERROR.error = null;
	      } else if (then$$ === undefined) {
	        fulfill(promise, maybeThenable);
	      } else if (isFunction(then$$)) {
	        handleForeignThenable(promise, maybeThenable, then$$);
	      } else {
	        fulfill(promise, maybeThenable);
	      }
	    }
	  }

	  function _resolve(promise, value) {
	    if (promise === value) {
	      _reject(promise, selfFulfillment());
	    } else if (objectOrFunction(value)) {
	      handleMaybeThenable(promise, value, getThen(value));
	    } else {
	      fulfill(promise, value);
	    }
	  }

	  function publishRejection(promise) {
	    if (promise._onerror) {
	      promise._onerror(promise._result);
	    }

	    publish(promise);
	  }

	  function fulfill(promise, value) {
	    if (promise._state !== PENDING) {
	      return;
	    }

	    promise._result = value;
	    promise._state = FULFILLED;

	    if (promise._subscribers.length !== 0) {
	      asap(publish, promise);
	    }
	  }

	  function _reject(promise, reason) {
	    if (promise._state !== PENDING) {
	      return;
	    }
	    promise._state = REJECTED;
	    promise._result = reason;

	    asap(publishRejection, promise);
	  }

	  function subscribe(parent, child, onFulfillment, onRejection) {
	    var _subscribers = parent._subscribers;
	    var length = _subscribers.length;

	    parent._onerror = null;

	    _subscribers[length] = child;
	    _subscribers[length + FULFILLED] = onFulfillment;
	    _subscribers[length + REJECTED] = onRejection;

	    if (length === 0 && parent._state) {
	      asap(publish, parent);
	    }
	  }

	  function publish(promise) {
	    var subscribers = promise._subscribers;
	    var settled = promise._state;

	    if (subscribers.length === 0) {
	      return;
	    }

	    var child = undefined,
	        callback = undefined,
	        detail = promise._result;

	    for (var i = 0; i < subscribers.length; i += 3) {
	      child = subscribers[i];
	      callback = subscribers[i + settled];

	      if (child) {
	        invokeCallback(settled, child, callback, detail);
	      } else {
	        callback(detail);
	      }
	    }

	    promise._subscribers.length = 0;
	  }

	  function ErrorObject() {
	    this.error = null;
	  }

	  var TRY_CATCH_ERROR = new ErrorObject();

	  function tryCatch(callback, detail) {
	    try {
	      return callback(detail);
	    } catch (e) {
	      TRY_CATCH_ERROR.error = e;
	      return TRY_CATCH_ERROR;
	    }
	  }

	  function invokeCallback(settled, promise, callback, detail) {
	    var hasCallback = isFunction(callback),
	        value = undefined,
	        error = undefined,
	        succeeded = undefined,
	        failed = undefined;

	    if (hasCallback) {
	      value = tryCatch(callback, detail);

	      if (value === TRY_CATCH_ERROR) {
	        failed = true;
	        error = value.error;
	        value.error = null;
	      } else {
	        succeeded = true;
	      }

	      if (promise === value) {
	        _reject(promise, cannotReturnOwn());
	        return;
	      }
	    } else {
	      value = detail;
	      succeeded = true;
	    }

	    if (promise._state !== PENDING) {
	      // noop
	    } else if (hasCallback && succeeded) {
	      _resolve(promise, value);
	    } else if (failed) {
	      _reject(promise, error);
	    } else if (settled === FULFILLED) {
	      fulfill(promise, value);
	    } else if (settled === REJECTED) {
	      _reject(promise, value);
	    }
	  }

	  function initializePromise(promise, resolver) {
	    try {
	      resolver(function resolvePromise(value) {
	        _resolve(promise, value);
	      }, function rejectPromise(reason) {
	        _reject(promise, reason);
	      });
	    } catch (e) {
	      _reject(promise, e);
	    }
	  }

	  var id = 0;
	  function nextId() {
	    return id++;
	  }

	  function makePromise(promise) {
	    promise[PROMISE_ID] = id++;
	    promise._state = undefined;
	    promise._result = undefined;
	    promise._subscribers = [];
	  }

	  function Enumerator(Constructor, input) {
	    this._instanceConstructor = Constructor;
	    this.promise = new Constructor(noop);

	    if (!this.promise[PROMISE_ID]) {
	      makePromise(this.promise);
	    }

	    if (isArray(input)) {
	      this._input = input;
	      this.length = input.length;
	      this._remaining = input.length;

	      this._result = new Array(this.length);

	      if (this.length === 0) {
	        fulfill(this.promise, this._result);
	      } else {
	        this.length = this.length || 0;
	        this._enumerate();
	        if (this._remaining === 0) {
	          fulfill(this.promise, this._result);
	        }
	      }
	    } else {
	      _reject(this.promise, validationError());
	    }
	  }

	  function validationError() {
	    return new Error('Array Methods must be provided an Array');
	  };

	  Enumerator.prototype._enumerate = function () {
	    var length = this.length;
	    var _input = this._input;

	    for (var i = 0; this._state === PENDING && i < length; i++) {
	      this._eachEntry(_input[i], i);
	    }
	  };

	  Enumerator.prototype._eachEntry = function (entry, i) {
	    var c = this._instanceConstructor;
	    var resolve$$ = c.resolve;

	    if (resolve$$ === resolve) {
	      var _then = getThen(entry);

	      if (_then === then && entry._state !== PENDING) {
	        this._settledAt(entry._state, i, entry._result);
	      } else if (typeof _then !== 'function') {
	        this._remaining--;
	        this._result[i] = entry;
	      } else if (c === Promise) {
	        var promise = new c(noop);
	        handleMaybeThenable(promise, entry, _then);
	        this._willSettleAt(promise, i);
	      } else {
	        this._willSettleAt(new c(function (resolve$$) {
	          return resolve$$(entry);
	        }), i);
	      }
	    } else {
	      this._willSettleAt(resolve$$(entry), i);
	    }
	  };

	  Enumerator.prototype._settledAt = function (state, i, value) {
	    var promise = this.promise;

	    if (promise._state === PENDING) {
	      this._remaining--;

	      if (state === REJECTED) {
	        _reject(promise, value);
	      } else {
	        this._result[i] = value;
	      }
	    }

	    if (this._remaining === 0) {
	      fulfill(promise, this._result);
	    }
	  };

	  Enumerator.prototype._willSettleAt = function (promise, i) {
	    var enumerator = this;

	    subscribe(promise, undefined, function (value) {
	      return enumerator._settledAt(FULFILLED, i, value);
	    }, function (reason) {
	      return enumerator._settledAt(REJECTED, i, reason);
	    });
	  };

	  /**
	    `Promise.all` accepts an array of promises, and returns a new promise which
	    is fulfilled with an array of fulfillment values for the passed promises, or
	    rejected with the reason of the first passed promise to be rejected. It casts all
	    elements of the passed iterable to promises as it runs this algorithm.
	  
	    Example:
	  
	    ```javascript
	    let promise1 = resolve(1);
	    let promise2 = resolve(2);
	    let promise3 = resolve(3);
	    let promises = [ promise1, promise2, promise3 ];
	  
	    Promise.all(promises).then(function(array){
	      // The array here would be [ 1, 2, 3 ];
	    });
	    ```
	  
	    If any of the `promises` given to `all` are rejected, the first promise
	    that is rejected will be given as an argument to the returned promises's
	    rejection handler. For example:
	  
	    Example:
	  
	    ```javascript
	    let promise1 = resolve(1);
	    let promise2 = reject(new Error("2"));
	    let promise3 = reject(new Error("3"));
	    let promises = [ promise1, promise2, promise3 ];
	  
	    Promise.all(promises).then(function(array){
	      // Code here never runs because there are rejected promises!
	    }, function(error) {
	      // error.message === "2"
	    });
	    ```
	  
	    @method all
	    @static
	    @param {Array} entries array of promises
	    @param {String} label optional string for labeling the promise.
	    Useful for tooling.
	    @return {Promise} promise that is fulfilled when all `promises` have been
	    fulfilled, or rejected if any of them become rejected.
	    @static
	  */
	  function all(entries) {
	    return new Enumerator(this, entries).promise;
	  }

	  /**
	    `Promise.race` returns a new promise which is settled in the same way as the
	    first passed promise to settle.
	  
	    Example:
	  
	    ```javascript
	    let promise1 = new Promise(function(resolve, reject){
	      setTimeout(function(){
	        resolve('promise 1');
	      }, 200);
	    });
	  
	    let promise2 = new Promise(function(resolve, reject){
	      setTimeout(function(){
	        resolve('promise 2');
	      }, 100);
	    });
	  
	    Promise.race([promise1, promise2]).then(function(result){
	      // result === 'promise 2' because it was resolved before promise1
	      // was resolved.
	    });
	    ```
	  
	    `Promise.race` is deterministic in that only the state of the first
	    settled promise matters. For example, even if other promises given to the
	    `promises` array argument are resolved, but the first settled promise has
	    become rejected before the other promises became fulfilled, the returned
	    promise will become rejected:
	  
	    ```javascript
	    let promise1 = new Promise(function(resolve, reject){
	      setTimeout(function(){
	        resolve('promise 1');
	      }, 200);
	    });
	  
	    let promise2 = new Promise(function(resolve, reject){
	      setTimeout(function(){
	        reject(new Error('promise 2'));
	      }, 100);
	    });
	  
	    Promise.race([promise1, promise2]).then(function(result){
	      // Code here never runs
	    }, function(reason){
	      // reason.message === 'promise 2' because promise 2 became rejected before
	      // promise 1 became fulfilled
	    });
	    ```
	  
	    An example real-world use case is implementing timeouts:
	  
	    ```javascript
	    Promise.race([ajax('foo.json'), timeout(5000)])
	    ```
	  
	    @method race
	    @static
	    @param {Array} promises array of promises to observe
	    Useful for tooling.
	    @return {Promise} a promise which settles in the same way as the first passed
	    promise to settle.
	  */
	  function race(entries) {
	    /*jshint validthis:true */
	    var Constructor = this;

	    if (!isArray(entries)) {
	      return new Constructor(function (_, reject) {
	        return reject(new TypeError('You must pass an array to race.'));
	      });
	    } else {
	      return new Constructor(function (resolve, reject) {
	        var length = entries.length;
	        for (var i = 0; i < length; i++) {
	          Constructor.resolve(entries[i]).then(resolve, reject);
	        }
	      });
	    }
	  }

	  /**
	    `Promise.reject` returns a promise rejected with the passed `reason`.
	    It is shorthand for the following:
	  
	    ```javascript
	    let promise = new Promise(function(resolve, reject){
	      reject(new Error('WHOOPS'));
	    });
	  
	    promise.then(function(value){
	      // Code here doesn't run because the promise is rejected!
	    }, function(reason){
	      // reason.message === 'WHOOPS'
	    });
	    ```
	  
	    Instead of writing the above, your code now simply becomes the following:
	  
	    ```javascript
	    let promise = Promise.reject(new Error('WHOOPS'));
	  
	    promise.then(function(value){
	      // Code here doesn't run because the promise is rejected!
	    }, function(reason){
	      // reason.message === 'WHOOPS'
	    });
	    ```
	  
	    @method reject
	    @static
	    @param {Any} reason value that the returned promise will be rejected with.
	    Useful for tooling.
	    @return {Promise} a promise rejected with the given `reason`.
	  */
	  function reject(reason) {
	    /*jshint validthis:true */
	    var Constructor = this;
	    var promise = new Constructor(noop);
	    _reject(promise, reason);
	    return promise;
	  }

	  function needsResolver() {
	    throw new TypeError('You must pass a resolver function as the first argument to the promise constructor');
	  }

	  function needsNew() {
	    throw new TypeError("Failed to construct 'Promise': Please use the 'new' operator, this object constructor cannot be called as a function.");
	  }

	  /**
	    Promise objects represent the eventual result of an asynchronous operation. The
	    primary way of interacting with a promise is through its `then` method, which
	    registers callbacks to receive either a promise's eventual value or the reason
	    why the promise cannot be fulfilled.
	  
	    Terminology
	    -----------
	  
	    - `promise` is an object or function with a `then` method whose behavior conforms to this specification.
	    - `thenable` is an object or function that defines a `then` method.
	    - `value` is any legal JavaScript value (including undefined, a thenable, or a promise).
	    - `exception` is a value that is thrown using the throw statement.
	    - `reason` is a value that indicates why a promise was rejected.
	    - `settled` the final resting state of a promise, fulfilled or rejected.
	  
	    A promise can be in one of three states: pending, fulfilled, or rejected.
	  
	    Promises that are fulfilled have a fulfillment value and are in the fulfilled
	    state.  Promises that are rejected have a rejection reason and are in the
	    rejected state.  A fulfillment value is never a thenable.
	  
	    Promises can also be said to *resolve* a value.  If this value is also a
	    promise, then the original promise's settled state will match the value's
	    settled state.  So a promise that *resolves* a promise that rejects will
	    itself reject, and a promise that *resolves* a promise that fulfills will
	    itself fulfill.
	  
	  
	    Basic Usage:
	    ------------
	  
	    ```js
	    let promise = new Promise(function(resolve, reject) {
	      // on success
	      resolve(value);
	  
	      // on failure
	      reject(reason);
	    });
	  
	    promise.then(function(value) {
	      // on fulfillment
	    }, function(reason) {
	      // on rejection
	    });
	    ```
	  
	    Advanced Usage:
	    ---------------
	  
	    Promises shine when abstracting away asynchronous interactions such as
	    `XMLHttpRequest`s.
	  
	    ```js
	    function getJSON(url) {
	      return new Promise(function(resolve, reject){
	        let xhr = new XMLHttpRequest();
	  
	        xhr.open('GET', url);
	        xhr.onreadystatechange = handler;
	        xhr.responseType = 'json';
	        xhr.setRequestHeader('Accept', 'application/json');
	        xhr.send();
	  
	        function handler() {
	          if (this.readyState === this.DONE) {
	            if (this.status === 200) {
	              resolve(this.response);
	            } else {
	              reject(new Error('getJSON: `' + url + '` failed with status: [' + this.status + ']'));
	            }
	          }
	        };
	      });
	    }
	  
	    getJSON('/posts.json').then(function(json) {
	      // on fulfillment
	    }, function(reason) {
	      // on rejection
	    });
	    ```
	  
	    Unlike callbacks, promises are great composable primitives.
	  
	    ```js
	    Promise.all([
	      getJSON('/posts'),
	      getJSON('/comments')
	    ]).then(function(values){
	      values[0] // => postsJSON
	      values[1] // => commentsJSON
	  
	      return values;
	    });
	    ```
	  
	    @class Promise
	    @param {function} resolver
	    Useful for tooling.
	    @constructor
	  */
	  function Promise(resolver) {
	    this[PROMISE_ID] = nextId();
	    this._result = this._state = undefined;
	    this._subscribers = [];

	    if (noop !== resolver) {
	      typeof resolver !== 'function' && needsResolver();
	      this instanceof Promise ? initializePromise(this, resolver) : needsNew();
	    }
	  }

	  Promise.all = all;
	  Promise.race = race;
	  Promise.resolve = resolve;
	  Promise.reject = reject;
	  Promise._setScheduler = setScheduler;
	  Promise._setAsap = setAsap;
	  Promise._asap = asap;

	  Promise.prototype = {
	    constructor: Promise,

	    /**
	      The primary way of interacting with a promise is through its `then` method,
	      which registers callbacks to receive either a promise's eventual value or the
	      reason why the promise cannot be fulfilled.
	    
	      ```js
	      findUser().then(function(user){
	        // user is available
	      }, function(reason){
	        // user is unavailable, and you are given the reason why
	      });
	      ```
	    
	      Chaining
	      --------
	    
	      The return value of `then` is itself a promise.  This second, 'downstream'
	      promise is resolved with the return value of the first promise's fulfillment
	      or rejection handler, or rejected if the handler throws an exception.
	    
	      ```js
	      findUser().then(function (user) {
	        return user.name;
	      }, function (reason) {
	        return 'default name';
	      }).then(function (userName) {
	        // If `findUser` fulfilled, `userName` will be the user's name, otherwise it
	        // will be `'default name'`
	      });
	    
	      findUser().then(function (user) {
	        throw new Error('Found user, but still unhappy');
	      }, function (reason) {
	        throw new Error('`findUser` rejected and we're unhappy');
	      }).then(function (value) {
	        // never reached
	      }, function (reason) {
	        // if `findUser` fulfilled, `reason` will be 'Found user, but still unhappy'.
	        // If `findUser` rejected, `reason` will be '`findUser` rejected and we're unhappy'.
	      });
	      ```
	      If the downstream promise does not specify a rejection handler, rejection reasons will be propagated further downstream.
	    
	      ```js
	      findUser().then(function (user) {
	        throw new PedagogicalException('Upstream error');
	      }).then(function (value) {
	        // never reached
	      }).then(function (value) {
	        // never reached
	      }, function (reason) {
	        // The `PedgagocialException` is propagated all the way down to here
	      });
	      ```
	    
	      Assimilation
	      ------------
	    
	      Sometimes the value you want to propagate to a downstream promise can only be
	      retrieved asynchronously. This can be achieved by returning a promise in the
	      fulfillment or rejection handler. The downstream promise will then be pending
	      until the returned promise is settled. This is called *assimilation*.
	    
	      ```js
	      findUser().then(function (user) {
	        return findCommentsByAuthor(user);
	      }).then(function (comments) {
	        // The user's comments are now available
	      });
	      ```
	    
	      If the assimliated promise rejects, then the downstream promise will also reject.
	    
	      ```js
	      findUser().then(function (user) {
	        return findCommentsByAuthor(user);
	      }).then(function (comments) {
	        // If `findCommentsByAuthor` fulfills, we'll have the value here
	      }, function (reason) {
	        // If `findCommentsByAuthor` rejects, we'll have the reason here
	      });
	      ```
	    
	      Simple Example
	      --------------
	    
	      Synchronous Example
	    
	      ```javascript
	      let result;
	    
	      try {
	        result = findResult();
	        // success
	      } catch(reason) {
	        // failure
	      }
	      ```
	    
	      Errback Example
	    
	      ```js
	      findResult(function(result, err){
	        if (err) {
	          // failure
	        } else {
	          // success
	        }
	      });
	      ```
	    
	      Promise Example;
	    
	      ```javascript
	      findResult().then(function(result){
	        // success
	      }, function(reason){
	        // failure
	      });
	      ```
	    
	      Advanced Example
	      --------------
	    
	      Synchronous Example
	    
	      ```javascript
	      let author, books;
	    
	      try {
	        author = findAuthor();
	        books  = findBooksByAuthor(author);
	        // success
	      } catch(reason) {
	        // failure
	      }
	      ```
	    
	      Errback Example
	    
	      ```js
	    
	      function foundBooks(books) {
	    
	      }
	    
	      function failure(reason) {
	    
	      }
	    
	      findAuthor(function(author, err){
	        if (err) {
	          failure(err);
	          // failure
	        } else {
	          try {
	            findBoooksByAuthor(author, function(books, err) {
	              if (err) {
	                failure(err);
	              } else {
	                try {
	                  foundBooks(books);
	                } catch(reason) {
	                  failure(reason);
	                }
	              }
	            });
	          } catch(error) {
	            failure(err);
	          }
	          // success
	        }
	      });
	      ```
	    
	      Promise Example;
	    
	      ```javascript
	      findAuthor().
	        then(findBooksByAuthor).
	        then(function(books){
	          // found books
	      }).catch(function(reason){
	        // something went wrong
	      });
	      ```
	    
	      @method then
	      @param {Function} onFulfilled
	      @param {Function} onRejected
	      Useful for tooling.
	      @return {Promise}
	    */
	    then: then,

	    /**
	      `catch` is simply sugar for `then(undefined, onRejection)` which makes it the same
	      as the catch block of a try/catch statement.
	    
	      ```js
	      function findAuthor(){
	        throw new Error('couldn't find that author');
	      }
	    
	      // synchronous
	      try {
	        findAuthor();
	      } catch(reason) {
	        // something went wrong
	      }
	    
	      // async with promises
	      findAuthor().catch(function(reason){
	        // something went wrong
	      });
	      ```
	    
	      @method catch
	      @param {Function} onRejection
	      Useful for tooling.
	      @return {Promise}
	    */
	    'catch': function _catch(onRejection) {
	      return this.then(null, onRejection);
	    }
	  };

	  function polyfill() {
	    var local = undefined;

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

	    if (P) {
	      var promiseToString = null;
	      try {
	        promiseToString = Object.prototype.toString.call(P.resolve());
	      } catch (e) {
	        // silently ignored
	      }

	      if (promiseToString === '[object Promise]' && !P.cast) {
	        return;
	      }
	    }

	    local.Promise = Promise;
	  }

	  // Strange compat..
	  Promise.polyfill = polyfill;
	  Promise.Promise = Promise;

	  return Promise;
	});
	//# sourceMappingURL=es6-promise.map
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(28), (function() { return this; }())))

/***/ },
/* 28 */
/***/ function(module, exports) {

	'use strict';

	// shim for using process in browser
	var process = module.exports = {};

	// cached from whatever global is present so that test runners that stub it
	// don't break things.  But we need to wrap it in a try catch in case it is
	// wrapped in strict mode code which doesn't define any globals.  It's inside a
	// function because try/catches deoptimize in certain engines.

	var cachedSetTimeout;
	var cachedClearTimeout;

	function defaultSetTimout() {
	    throw new Error('setTimeout has not been defined');
	}
	function defaultClearTimeout() {
	    throw new Error('clearTimeout has not been defined');
	}
	(function () {
	    try {
	        if (typeof setTimeout === 'function') {
	            cachedSetTimeout = setTimeout;
	        } else {
	            cachedSetTimeout = defaultSetTimout;
	        }
	    } catch (e) {
	        cachedSetTimeout = defaultSetTimout;
	    }
	    try {
	        if (typeof clearTimeout === 'function') {
	            cachedClearTimeout = clearTimeout;
	        } else {
	            cachedClearTimeout = defaultClearTimeout;
	        }
	    } catch (e) {
	        cachedClearTimeout = defaultClearTimeout;
	    }
	})();
	function runTimeout(fun) {
	    if (cachedSetTimeout === setTimeout) {
	        //normal enviroments in sane situations
	        return setTimeout(fun, 0);
	    }
	    // if setTimeout wasn't available but was latter defined
	    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
	        cachedSetTimeout = setTimeout;
	        return setTimeout(fun, 0);
	    }
	    try {
	        // when when somebody has screwed with setTimeout but no I.E. maddness
	        return cachedSetTimeout(fun, 0);
	    } catch (e) {
	        try {
	            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
	            return cachedSetTimeout.call(null, fun, 0);
	        } catch (e) {
	            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
	            return cachedSetTimeout.call(this, fun, 0);
	        }
	    }
	}
	function runClearTimeout(marker) {
	    if (cachedClearTimeout === clearTimeout) {
	        //normal enviroments in sane situations
	        return clearTimeout(marker);
	    }
	    // if clearTimeout wasn't available but was latter defined
	    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
	        cachedClearTimeout = clearTimeout;
	        return clearTimeout(marker);
	    }
	    try {
	        // when when somebody has screwed with setTimeout but no I.E. maddness
	        return cachedClearTimeout(marker);
	    } catch (e) {
	        try {
	            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
	            return cachedClearTimeout.call(null, marker);
	        } catch (e) {
	            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
	            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
	            return cachedClearTimeout.call(this, marker);
	        }
	    }
	}
	var queue = [];
	var draining = false;
	var currentQueue;
	var queueIndex = -1;

	function cleanUpNextTick() {
	    if (!draining || !currentQueue) {
	        return;
	    }
	    draining = false;
	    if (currentQueue.length) {
	        queue = currentQueue.concat(queue);
	    } else {
	        queueIndex = -1;
	    }
	    if (queue.length) {
	        drainQueue();
	    }
	}

	function drainQueue() {
	    if (draining) {
	        return;
	    }
	    var timeout = runTimeout(cleanUpNextTick);
	    draining = true;

	    var len = queue.length;
	    while (len) {
	        currentQueue = queue;
	        queue = [];
	        while (++queueIndex < len) {
	            if (currentQueue) {
	                currentQueue[queueIndex].run();
	            }
	        }
	        queueIndex = -1;
	        len = queue.length;
	    }
	    currentQueue = null;
	    draining = false;
	    runClearTimeout(timeout);
	}

	process.nextTick = function (fun) {
	    var args = new Array(arguments.length - 1);
	    if (arguments.length > 1) {
	        for (var i = 1; i < arguments.length; i++) {
	            args[i - 1] = arguments[i];
	        }
	    }
	    queue.push(new Item(fun, args));
	    if (queue.length === 1 && !draining) {
	        runTimeout(drainQueue);
	    }
	};

	// v8 likes predictible objects
	function Item(fun, array) {
	    this.fun = fun;
	    this.array = array;
	}
	Item.prototype.run = function () {
	    this.fun.apply(null, this.array);
	};
	process.title = 'browser';
	process.browser = true;
	process.env = {};
	process.argv = [];
	process.version = ''; // empty string to avoid regexp issues
	process.versions = {};

	function noop() {}

	process.on = noop;
	process.addListener = noop;
	process.once = noop;
	process.off = noop;
	process.removeListener = noop;
	process.removeAllListeners = noop;
	process.emit = noop;
	process.prependListener = noop;
	process.prependOnceListener = noop;

	process.listeners = function (name) {
	    return [];
	};

	process.binding = function (name) {
	    throw new Error('process.binding is not supported');
	};

	process.cwd = function () {
	    return '/';
	};
	process.chdir = function (dir) {
	    throw new Error('process.chdir is not supported');
	};
	process.umask = function () {
	    return 0;
	};

/***/ },
/* 29 */
/***/ function(module, exports) {

	/* (ignored) */

/***/ },
/* 30 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var bmoor = __webpack_require__(6);

	function makeSwitchableUrl() {
		var ctx = {};
		var keys = [];

		var fn = function fn(args) {
			var dex = null;

			for (var i = 0, c = keys.length; i < c && !dex; i++) {
				if (keys[i] in args) {
					dex = keys[i];
				}
			}

			var rtn = ctx[dex];

			if (bmoor.isFunction(rtn)) {
				rtn = rtn(args);
			}

			return rtn;
		};

		fn.append = function (key, urlGenerator) {
			ctx[key] = urlGenerator;
			keys.push(key);
		};

		return fn;
	}

	module.exports = {
		makeSwitchableUrl: makeSwitchableUrl
	};

/***/ },
/* 31 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var bmoor = __webpack_require__(6),
	    uhaul = __webpack_require__(4).index,
	    Promise = __webpack_require__(27).Promise;

	/*
	function mimic( dis, feed, field ){
		if ( feed && feed[field] ){
			dis[field].$settings = feed[field].$settings;
		}else{
			dis[field].$settings = {};
		}
	}
	*/

	var Storage = function () {
		function Storage(name, ops) {
			var _this = this;

			_classCallCheck(this, Storage);

			var store,
			    collection,
			    settings = ops || {},
			    id = settings.id || 'id',
			    feed = settings.feed;

			store = settings.session ? sessionStorage : localStorage;

			this.id = id;
			this.feed = feed;

			this.$index = {};
			this.$collection = settings.prepop || [];

			uhaul.register(name, ops);

			this.save = function () {
				store.setItem(name, JSON.stringify(this.$collection));
			};

			collection = settings.clear ? null : store.getItem(name);

			try {
				if (collection) {
					collection = JSON.parse(collection);

					collection.forEach(function (obj) {
						_this.$index[obj[id]] = obj;
						_this.$collection.push(obj);
					});
				}
			} catch (ex) {
				store.removeItem(name);
			}

			// let's try to mimic a Crud object a bit
			/*
	  mimic( this, feed, 'read' );
	  mimic( this, feed, 'all' );
	  mimic( this, feed, 'list' );
	  mimic( this, feed, 'create' );
	  mimic( this, feed, 'update' );
	  mimic( this, feed, 'delete' );
	  mimic( this, feed, 'search' );
	  */
		}

		_createClass(Storage, [{
			key: '_insert',
			value: function _insert(obj) {
				var id = Date.now() + '-' + this.$collection.length;

				obj[this.id] = id;

				this.$index[obj[this.id]] = obj;
				this.$collection.push(obj);

				this.save();

				return obj;
			}

			// return only one

		}, {
			key: 'read',
			value: function read(qry) {
				var _this2 = this;

				var key, rtn;

				if (bmoor.isObject(qry)) {
					key = qry[this.id];
				} else {
					key = qry;
				}

				rtn = this.$index[key];

				if (rtn) {
					return Promise.resolve(rtn);
				} else if (this.feed.all) {
					return this.all().then(function () {
						var t = _this2.$index[key];

						if (t) {
							return t;
						} else {
							return _this2.feed.read(qry).then(function (res) {
								return _this2._insert(res);
							});
						}
					});
				} else {
					return this.feed.read(qry).then(function (res) {
						return _this2._insert(res);
					});
				}
			}

			// return an unedited list of all

		}, {
			key: 'all',
			value: function all(qry) {
				var _this3 = this;

				if (!this.$collection.length && this.feed && this.feed.all) {
					return this.feed.all(qry).then(function (res) {
						res.forEach(function (obj) {
							_this3.$index[obj[_this3.id]] = obj;
							_this3.$collection.push(obj);
						});

						return _this3.$collection;
					});
				} else {
					return Promise.resolve(this.$collection);
				}
			}

			// return possibly truncated list of all

		}, {
			key: 'list',
			value: function list(qry) {
				return this.all(qry);
			}
		}, {
			key: 'create',
			value: function create(obj) {
				var _this4 = this;

				if (this.feed) {
					return this.feed.create(obj).then(function () {
						return _this4._insert(obj);
					});
				} else {
					return Promise.resolve(this._insert(obj));
				}
			}
		}, {
			key: 'update',
			value: function update(qry, obj) {
				var _this5 = this;

				var t;

				if (this.feed) {
					t = this.feed.update(qry, obj);
				} else {
					t = Promise.resolve('OK');
				}

				return t.then(function () {
					if (obj) {
						return _this5.read(qry).then(function (res) {
							if (res) {
								bmoor.object.extend(res, obj);
							}

							_this5.save();

							return 'OK';
						});
					} else {
						_this5.save();

						return 'OK';
					}
				});
			}
		}, {
			key: 'delete',
			value: function _delete(qry) {
				var _this6 = this;

				var t,
				    trg = this.read(qry);

				if (this.feed) {
					t = this.feed.delete(qry).then(function () {
						return trg;
					});
				} else {
					t = trg;
				}

				return t.then(function () {
					bmoor.array.remove(_this6.$collection, trg);
					_this6.$index[trg[_this6.id]] = undefined;

					_this6.save();

					return 'OK';
				});
			}

			// expect array returned

		}, {
			key: 'search',
			value: function search(qry) {
				var rtn = [],
				    keys = Object.keys(qry);

				return this.all().then(function (res) {
					res.forEach(function (obj) {
						var miss = false;

						keys.forEach(function (k) {
							if (obj[k] !== qry[k]) {
								miss = true;
							}
						});

						if (!miss) {
							rtn.push(obj);
						}
					});

					return rtn;
				});
			}
		}]);

		return Storage;
	}();

	module.exports = Storage;

/***/ },
/* 32 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var bmoor = __webpack_require__(6);

	module.exports = function (obj, interceptions) {
		var orig = {};

		// copy original values to allow disable
		bmoor.iterate(interceptions, function (intercept, name) {
			var fn = obj[name];

			if (fn.$settings) {
				orig[name] = fn.$settings.intercept;
			}
		});

		return {
			disable: function disable() {
				bmoor.iterate(interceptions, function (intercept, name) {
					var fn = obj[name];

					if (fn.$settings) {
						fn.$settings.intercept = orig[name];
					}
				});
			},
			enable: function enable() {
				bmoor.iterate(interceptions, function (intercept, name) {
					var fn = obj[name];

					if (fn.$settings) {
						fn.$settings.intercept = intercept;
					}
				});
			}
		};
	};

/***/ },
/* 33 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var _require = __webpack_require__(34),
	    defer = _require.defer;

	var index = __webpack_require__(6).Memory.use('comm-streams');

	var overrides = ['read', 'readMany', 'all', 'list', 'query', 'search', 'create', 'update', 'delete'];
	function mapFeed(feed, stream) {
		overrides.forEach(function (method) {
			if (feed[method]) {
				stream[method] = function () {
					for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
						args[_key] = arguments[_key];
					}

					return defer(function () {
						return feed[method].apply(feed, args);
					});
				};
			}
		});
	}

	var Stream = function Stream(feed) {
		var settings = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

		_classCallCheck(this, Stream);

		if (settings.base) {
			Object.assign(this, settings.base);
		}

		mapFeed(feed, this);

		if (settings.name) {
			index.register(settings.name, this);
		}
	};

	module.exports = {
		Stream: Stream,
		default: Stream,
		index: index
	};

/***/ },
/* 34 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", { value: true });
	var Observable_1 = __webpack_require__(35);
	exports.Observable = Observable_1.Observable;
	var ConnectableObservable_1 = __webpack_require__(51);
	exports.ConnectableObservable = ConnectableObservable_1.ConnectableObservable;
	var groupBy_1 = __webpack_require__(56);
	exports.GroupedObservable = groupBy_1.GroupedObservable;
	var observable_1 = __webpack_require__(48);
	exports.observable = observable_1.observable;
	var Subject_1 = __webpack_require__(52);
	exports.Subject = Subject_1.Subject;
	var BehaviorSubject_1 = __webpack_require__(57);
	exports.BehaviorSubject = BehaviorSubject_1.BehaviorSubject;
	var ReplaySubject_1 = __webpack_require__(58);
	exports.ReplaySubject = ReplaySubject_1.ReplaySubject;
	var AsyncSubject_1 = __webpack_require__(75);
	exports.AsyncSubject = AsyncSubject_1.AsyncSubject;
	var asap_1 = __webpack_require__(76);
	exports.asapScheduler = asap_1.asap;
	var async_1 = __webpack_require__(80);
	exports.asyncScheduler = async_1.async;
	var queue_1 = __webpack_require__(59);
	exports.queueScheduler = queue_1.queue;
	var animationFrame_1 = __webpack_require__(81);
	exports.animationFrameScheduler = animationFrame_1.animationFrame;
	var VirtualTimeScheduler_1 = __webpack_require__(84);
	exports.VirtualTimeScheduler = VirtualTimeScheduler_1.VirtualTimeScheduler;
	exports.VirtualAction = VirtualTimeScheduler_1.VirtualAction;
	var Scheduler_1 = __webpack_require__(65);
	exports.Scheduler = Scheduler_1.Scheduler;
	var Subscription_1 = __webpack_require__(42);
	exports.Subscription = Subscription_1.Subscription;
	var Subscriber_1 = __webpack_require__(37);
	exports.Subscriber = Subscriber_1.Subscriber;
	var Notification_1 = __webpack_require__(67);
	exports.Notification = Notification_1.Notification;
	exports.NotificationKind = Notification_1.NotificationKind;
	var pipe_1 = __webpack_require__(49);
	exports.pipe = pipe_1.pipe;
	var noop_1 = __webpack_require__(50);
	exports.noop = noop_1.noop;
	var identity_1 = __webpack_require__(85);
	exports.identity = identity_1.identity;
	var isObservable_1 = __webpack_require__(86);
	exports.isObservable = isObservable_1.isObservable;
	var ArgumentOutOfRangeError_1 = __webpack_require__(87);
	exports.ArgumentOutOfRangeError = ArgumentOutOfRangeError_1.ArgumentOutOfRangeError;
	var EmptyError_1 = __webpack_require__(88);
	exports.EmptyError = EmptyError_1.EmptyError;
	var ObjectUnsubscribedError_1 = __webpack_require__(53);
	exports.ObjectUnsubscribedError = ObjectUnsubscribedError_1.ObjectUnsubscribedError;
	var UnsubscriptionError_1 = __webpack_require__(45);
	exports.UnsubscriptionError = UnsubscriptionError_1.UnsubscriptionError;
	var TimeoutError_1 = __webpack_require__(89);
	exports.TimeoutError = TimeoutError_1.TimeoutError;
	var bindCallback_1 = __webpack_require__(90);
	exports.bindCallback = bindCallback_1.bindCallback;
	var bindNodeCallback_1 = __webpack_require__(92);
	exports.bindNodeCallback = bindNodeCallback_1.bindNodeCallback;
	var combineLatest_1 = __webpack_require__(93);
	exports.combineLatest = combineLatest_1.combineLatest;
	var concat_1 = __webpack_require__(104);
	exports.concat = concat_1.concat;
	var defer_1 = __webpack_require__(115);
	exports.defer = defer_1.defer;
	var empty_1 = __webpack_require__(68);
	exports.empty = empty_1.empty;
	var forkJoin_1 = __webpack_require__(116);
	exports.forkJoin = forkJoin_1.forkJoin;
	var from_1 = __webpack_require__(108);
	exports.from = from_1.from;
	var fromEvent_1 = __webpack_require__(117);
	exports.fromEvent = fromEvent_1.fromEvent;
	var fromEventPattern_1 = __webpack_require__(118);
	exports.fromEventPattern = fromEventPattern_1.fromEventPattern;
	var generate_1 = __webpack_require__(119);
	exports.generate = generate_1.generate;
	var iif_1 = __webpack_require__(120);
	exports.iif = iif_1.iif;
	var interval_1 = __webpack_require__(121);
	exports.interval = interval_1.interval;
	var merge_1 = __webpack_require__(123);
	exports.merge = merge_1.merge;
	var never_1 = __webpack_require__(124);
	exports.never = never_1.never;
	var of_1 = __webpack_require__(69);
	exports.of = of_1.of;
	var onErrorResumeNext_1 = __webpack_require__(125);
	exports.onErrorResumeNext = onErrorResumeNext_1.onErrorResumeNext;
	var pairs_1 = __webpack_require__(126);
	exports.pairs = pairs_1.pairs;
	var partition_1 = __webpack_require__(127);
	exports.partition = partition_1.partition;
	var race_1 = __webpack_require__(130);
	exports.race = race_1.race;
	var range_1 = __webpack_require__(131);
	exports.range = range_1.range;
	var throwError_1 = __webpack_require__(74);
	exports.throwError = throwError_1.throwError;
	var timer_1 = __webpack_require__(132);
	exports.timer = timer_1.timer;
	var using_1 = __webpack_require__(133);
	exports.using = using_1.using;
	var zip_1 = __webpack_require__(134);
	exports.zip = zip_1.zip;
	var scheduled_1 = __webpack_require__(109);
	exports.scheduled = scheduled_1.scheduled;
	var empty_2 = __webpack_require__(68);
	exports.EMPTY = empty_2.EMPTY;
	var never_2 = __webpack_require__(124);
	exports.NEVER = never_2.NEVER;
	var config_1 = __webpack_require__(40);
	exports.config = config_1.config;
	//# sourceMappingURL=index.js.map

/***/ },
/* 35 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", { value: true });
	var canReportError_1 = __webpack_require__(36);
	var toSubscriber_1 = __webpack_require__(47);
	var observable_1 = __webpack_require__(48);
	var pipe_1 = __webpack_require__(49);
	var config_1 = __webpack_require__(40);
	var Observable = function () {
	    function Observable(subscribe) {
	        this._isScalar = false;
	        if (subscribe) {
	            this._subscribe = subscribe;
	        }
	    }
	    Observable.prototype.lift = function (operator) {
	        var observable = new Observable();
	        observable.source = this;
	        observable.operator = operator;
	        return observable;
	    };
	    Observable.prototype.subscribe = function (observerOrNext, error, complete) {
	        var operator = this.operator;
	        var sink = toSubscriber_1.toSubscriber(observerOrNext, error, complete);
	        if (operator) {
	            sink.add(operator.call(sink, this.source));
	        } else {
	            sink.add(this.source || config_1.config.useDeprecatedSynchronousErrorHandling && !sink.syncErrorThrowable ? this._subscribe(sink) : this._trySubscribe(sink));
	        }
	        if (config_1.config.useDeprecatedSynchronousErrorHandling) {
	            if (sink.syncErrorThrowable) {
	                sink.syncErrorThrowable = false;
	                if (sink.syncErrorThrown) {
	                    throw sink.syncErrorValue;
	                }
	            }
	        }
	        return sink;
	    };
	    Observable.prototype._trySubscribe = function (sink) {
	        try {
	            return this._subscribe(sink);
	        } catch (err) {
	            if (config_1.config.useDeprecatedSynchronousErrorHandling) {
	                sink.syncErrorThrown = true;
	                sink.syncErrorValue = err;
	            }
	            if (canReportError_1.canReportError(sink)) {
	                sink.error(err);
	            } else {
	                console.warn(err);
	            }
	        }
	    };
	    Observable.prototype.forEach = function (next, promiseCtor) {
	        var _this = this;
	        promiseCtor = getPromiseCtor(promiseCtor);
	        return new promiseCtor(function (resolve, reject) {
	            var subscription;
	            subscription = _this.subscribe(function (value) {
	                try {
	                    next(value);
	                } catch (err) {
	                    reject(err);
	                    if (subscription) {
	                        subscription.unsubscribe();
	                    }
	                }
	            }, reject, resolve);
	        });
	    };
	    Observable.prototype._subscribe = function (subscriber) {
	        var source = this.source;
	        return source && source.subscribe(subscriber);
	    };
	    Observable.prototype[observable_1.observable] = function () {
	        return this;
	    };
	    Observable.prototype.pipe = function () {
	        var operations = [];
	        for (var _i = 0; _i < arguments.length; _i++) {
	            operations[_i] = arguments[_i];
	        }
	        if (operations.length === 0) {
	            return this;
	        }
	        return pipe_1.pipeFromArray(operations)(this);
	    };
	    Observable.prototype.toPromise = function (promiseCtor) {
	        var _this = this;
	        promiseCtor = getPromiseCtor(promiseCtor);
	        return new promiseCtor(function (resolve, reject) {
	            var value;
	            _this.subscribe(function (x) {
	                return value = x;
	            }, function (err) {
	                return reject(err);
	            }, function () {
	                return resolve(value);
	            });
	        });
	    };
	    Observable.create = function (subscribe) {
	        return new Observable(subscribe);
	    };
	    return Observable;
	}();
	exports.Observable = Observable;
	function getPromiseCtor(promiseCtor) {
	    if (!promiseCtor) {
	        promiseCtor = config_1.config.Promise || Promise;
	    }
	    if (!promiseCtor) {
	        throw new Error('no Promise impl found');
	    }
	    return promiseCtor;
	}
	//# sourceMappingURL=Observable.js.map

/***/ },
/* 36 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", { value: true });
	var Subscriber_1 = __webpack_require__(37);
	function canReportError(observer) {
	    while (observer) {
	        var _a = observer,
	            closed_1 = _a.closed,
	            destination = _a.destination,
	            isStopped = _a.isStopped;
	        if (closed_1 || isStopped) {
	            return false;
	        } else if (destination && destination instanceof Subscriber_1.Subscriber) {
	            observer = destination;
	        } else {
	            observer = null;
	        }
	    }
	    return true;
	}
	exports.canReportError = canReportError;
	//# sourceMappingURL=canReportError.js.map

/***/ },
/* 37 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

	var __extends = undefined && undefined.__extends || function () {
	    var _extendStatics = function extendStatics(d, b) {
	        _extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function (d, b) {
	            d.__proto__ = b;
	        } || function (d, b) {
	            for (var p in b) {
	                if (b.hasOwnProperty(p)) d[p] = b[p];
	            }
	        };
	        return _extendStatics(d, b);
	    };
	    return function (d, b) {
	        _extendStatics(d, b);
	        function __() {
	            this.constructor = d;
	        }
	        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	    };
	}();
	Object.defineProperty(exports, "__esModule", { value: true });
	var isFunction_1 = __webpack_require__(38);
	var Observer_1 = __webpack_require__(39);
	var Subscription_1 = __webpack_require__(42);
	var rxSubscriber_1 = __webpack_require__(46);
	var config_1 = __webpack_require__(40);
	var hostReportError_1 = __webpack_require__(41);
	var Subscriber = function (_super) {
	    __extends(Subscriber, _super);
	    function Subscriber(destinationOrNext, error, complete) {
	        var _this = _super.call(this) || this;
	        _this.syncErrorValue = null;
	        _this.syncErrorThrown = false;
	        _this.syncErrorThrowable = false;
	        _this.isStopped = false;
	        switch (arguments.length) {
	            case 0:
	                _this.destination = Observer_1.empty;
	                break;
	            case 1:
	                if (!destinationOrNext) {
	                    _this.destination = Observer_1.empty;
	                    break;
	                }
	                if ((typeof destinationOrNext === "undefined" ? "undefined" : _typeof(destinationOrNext)) === 'object') {
	                    if (destinationOrNext instanceof Subscriber) {
	                        _this.syncErrorThrowable = destinationOrNext.syncErrorThrowable;
	                        _this.destination = destinationOrNext;
	                        destinationOrNext.add(_this);
	                    } else {
	                        _this.syncErrorThrowable = true;
	                        _this.destination = new SafeSubscriber(_this, destinationOrNext);
	                    }
	                    break;
	                }
	            default:
	                _this.syncErrorThrowable = true;
	                _this.destination = new SafeSubscriber(_this, destinationOrNext, error, complete);
	                break;
	        }
	        return _this;
	    }
	    Subscriber.prototype[rxSubscriber_1.rxSubscriber] = function () {
	        return this;
	    };
	    Subscriber.create = function (next, error, complete) {
	        var subscriber = new Subscriber(next, error, complete);
	        subscriber.syncErrorThrowable = false;
	        return subscriber;
	    };
	    Subscriber.prototype.next = function (value) {
	        if (!this.isStopped) {
	            this._next(value);
	        }
	    };
	    Subscriber.prototype.error = function (err) {
	        if (!this.isStopped) {
	            this.isStopped = true;
	            this._error(err);
	        }
	    };
	    Subscriber.prototype.complete = function () {
	        if (!this.isStopped) {
	            this.isStopped = true;
	            this._complete();
	        }
	    };
	    Subscriber.prototype.unsubscribe = function () {
	        if (this.closed) {
	            return;
	        }
	        this.isStopped = true;
	        _super.prototype.unsubscribe.call(this);
	    };
	    Subscriber.prototype._next = function (value) {
	        this.destination.next(value);
	    };
	    Subscriber.prototype._error = function (err) {
	        this.destination.error(err);
	        this.unsubscribe();
	    };
	    Subscriber.prototype._complete = function () {
	        this.destination.complete();
	        this.unsubscribe();
	    };
	    Subscriber.prototype._unsubscribeAndRecycle = function () {
	        var _parentOrParents = this._parentOrParents;
	        this._parentOrParents = null;
	        this.unsubscribe();
	        this.closed = false;
	        this.isStopped = false;
	        this._parentOrParents = _parentOrParents;
	        return this;
	    };
	    return Subscriber;
	}(Subscription_1.Subscription);
	exports.Subscriber = Subscriber;
	var SafeSubscriber = function (_super) {
	    __extends(SafeSubscriber, _super);
	    function SafeSubscriber(_parentSubscriber, observerOrNext, error, complete) {
	        var _this = _super.call(this) || this;
	        _this._parentSubscriber = _parentSubscriber;
	        var next;
	        var context = _this;
	        if (isFunction_1.isFunction(observerOrNext)) {
	            next = observerOrNext;
	        } else if (observerOrNext) {
	            next = observerOrNext.next;
	            error = observerOrNext.error;
	            complete = observerOrNext.complete;
	            if (observerOrNext !== Observer_1.empty) {
	                context = Object.create(observerOrNext);
	                if (isFunction_1.isFunction(context.unsubscribe)) {
	                    _this.add(context.unsubscribe.bind(context));
	                }
	                context.unsubscribe = _this.unsubscribe.bind(_this);
	            }
	        }
	        _this._context = context;
	        _this._next = next;
	        _this._error = error;
	        _this._complete = complete;
	        return _this;
	    }
	    SafeSubscriber.prototype.next = function (value) {
	        if (!this.isStopped && this._next) {
	            var _parentSubscriber = this._parentSubscriber;
	            if (!config_1.config.useDeprecatedSynchronousErrorHandling || !_parentSubscriber.syncErrorThrowable) {
	                this.__tryOrUnsub(this._next, value);
	            } else if (this.__tryOrSetError(_parentSubscriber, this._next, value)) {
	                this.unsubscribe();
	            }
	        }
	    };
	    SafeSubscriber.prototype.error = function (err) {
	        if (!this.isStopped) {
	            var _parentSubscriber = this._parentSubscriber;
	            var useDeprecatedSynchronousErrorHandling = config_1.config.useDeprecatedSynchronousErrorHandling;
	            if (this._error) {
	                if (!useDeprecatedSynchronousErrorHandling || !_parentSubscriber.syncErrorThrowable) {
	                    this.__tryOrUnsub(this._error, err);
	                    this.unsubscribe();
	                } else {
	                    this.__tryOrSetError(_parentSubscriber, this._error, err);
	                    this.unsubscribe();
	                }
	            } else if (!_parentSubscriber.syncErrorThrowable) {
	                this.unsubscribe();
	                if (useDeprecatedSynchronousErrorHandling) {
	                    throw err;
	                }
	                hostReportError_1.hostReportError(err);
	            } else {
	                if (useDeprecatedSynchronousErrorHandling) {
	                    _parentSubscriber.syncErrorValue = err;
	                    _parentSubscriber.syncErrorThrown = true;
	                } else {
	                    hostReportError_1.hostReportError(err);
	                }
	                this.unsubscribe();
	            }
	        }
	    };
	    SafeSubscriber.prototype.complete = function () {
	        var _this = this;
	        if (!this.isStopped) {
	            var _parentSubscriber = this._parentSubscriber;
	            if (this._complete) {
	                var wrappedComplete = function wrappedComplete() {
	                    return _this._complete.call(_this._context);
	                };
	                if (!config_1.config.useDeprecatedSynchronousErrorHandling || !_parentSubscriber.syncErrorThrowable) {
	                    this.__tryOrUnsub(wrappedComplete);
	                    this.unsubscribe();
	                } else {
	                    this.__tryOrSetError(_parentSubscriber, wrappedComplete);
	                    this.unsubscribe();
	                }
	            } else {
	                this.unsubscribe();
	            }
	        }
	    };
	    SafeSubscriber.prototype.__tryOrUnsub = function (fn, value) {
	        try {
	            fn.call(this._context, value);
	        } catch (err) {
	            this.unsubscribe();
	            if (config_1.config.useDeprecatedSynchronousErrorHandling) {
	                throw err;
	            } else {
	                hostReportError_1.hostReportError(err);
	            }
	        }
	    };
	    SafeSubscriber.prototype.__tryOrSetError = function (parent, fn, value) {
	        if (!config_1.config.useDeprecatedSynchronousErrorHandling) {
	            throw new Error('bad call');
	        }
	        try {
	            fn.call(this._context, value);
	        } catch (err) {
	            if (config_1.config.useDeprecatedSynchronousErrorHandling) {
	                parent.syncErrorValue = err;
	                parent.syncErrorThrown = true;
	                return true;
	            } else {
	                hostReportError_1.hostReportError(err);
	                return true;
	            }
	        }
	        return false;
	    };
	    SafeSubscriber.prototype._unsubscribe = function () {
	        var _parentSubscriber = this._parentSubscriber;
	        this._context = null;
	        this._parentSubscriber = null;
	        _parentSubscriber.unsubscribe();
	    };
	    return SafeSubscriber;
	}(Subscriber);
	exports.SafeSubscriber = SafeSubscriber;
	//# sourceMappingURL=Subscriber.js.map

/***/ },
/* 38 */
/***/ function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", { value: true });
	function isFunction(x) {
	    return typeof x === 'function';
	}
	exports.isFunction = isFunction;
	//# sourceMappingURL=isFunction.js.map

/***/ },
/* 39 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", { value: true });
	var config_1 = __webpack_require__(40);
	var hostReportError_1 = __webpack_require__(41);
	exports.empty = {
	    closed: true,
	    next: function next(value) {},
	    error: function error(err) {
	        if (config_1.config.useDeprecatedSynchronousErrorHandling) {
	            throw err;
	        } else {
	            hostReportError_1.hostReportError(err);
	        }
	    },
	    complete: function complete() {}
	};
	//# sourceMappingURL=Observer.js.map

/***/ },
/* 40 */
/***/ function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", { value: true });
	var _enable_super_gross_mode_that_will_cause_bad_things = false;
	exports.config = {
	    Promise: undefined,
	    set useDeprecatedSynchronousErrorHandling(value) {
	        if (value) {
	            var error = new Error();
	            console.warn('DEPRECATED! RxJS was set to use deprecated synchronous error handling behavior by code at: \n' + error.stack);
	        } else if (_enable_super_gross_mode_that_will_cause_bad_things) {
	            console.log('RxJS: Back to a better error behavior. Thank you. <3');
	        }
	        _enable_super_gross_mode_that_will_cause_bad_things = value;
	    },
	    get useDeprecatedSynchronousErrorHandling() {
	        return _enable_super_gross_mode_that_will_cause_bad_things;
	    }
	};
	//# sourceMappingURL=config.js.map

/***/ },
/* 41 */
/***/ function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", { value: true });
	function hostReportError(err) {
	    setTimeout(function () {
	        throw err;
	    }, 0);
	}
	exports.hostReportError = hostReportError;
	//# sourceMappingURL=hostReportError.js.map

/***/ },
/* 42 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

	Object.defineProperty(exports, "__esModule", { value: true });
	var isArray_1 = __webpack_require__(43);
	var isObject_1 = __webpack_require__(44);
	var isFunction_1 = __webpack_require__(38);
	var UnsubscriptionError_1 = __webpack_require__(45);
	var Subscription = function () {
	    function Subscription(unsubscribe) {
	        this.closed = false;
	        this._parentOrParents = null;
	        this._subscriptions = null;
	        if (unsubscribe) {
	            this._unsubscribe = unsubscribe;
	        }
	    }
	    Subscription.prototype.unsubscribe = function () {
	        var errors;
	        if (this.closed) {
	            return;
	        }
	        var _a = this,
	            _parentOrParents = _a._parentOrParents,
	            _unsubscribe = _a._unsubscribe,
	            _subscriptions = _a._subscriptions;
	        this.closed = true;
	        this._parentOrParents = null;
	        this._subscriptions = null;
	        if (_parentOrParents instanceof Subscription) {
	            _parentOrParents.remove(this);
	        } else if (_parentOrParents !== null) {
	            for (var index = 0; index < _parentOrParents.length; ++index) {
	                var parent_1 = _parentOrParents[index];
	                parent_1.remove(this);
	            }
	        }
	        if (isFunction_1.isFunction(_unsubscribe)) {
	            try {
	                _unsubscribe.call(this);
	            } catch (e) {
	                errors = e instanceof UnsubscriptionError_1.UnsubscriptionError ? flattenUnsubscriptionErrors(e.errors) : [e];
	            }
	        }
	        if (isArray_1.isArray(_subscriptions)) {
	            var index = -1;
	            var len = _subscriptions.length;
	            while (++index < len) {
	                var sub = _subscriptions[index];
	                if (isObject_1.isObject(sub)) {
	                    try {
	                        sub.unsubscribe();
	                    } catch (e) {
	                        errors = errors || [];
	                        if (e instanceof UnsubscriptionError_1.UnsubscriptionError) {
	                            errors = errors.concat(flattenUnsubscriptionErrors(e.errors));
	                        } else {
	                            errors.push(e);
	                        }
	                    }
	                }
	            }
	        }
	        if (errors) {
	            throw new UnsubscriptionError_1.UnsubscriptionError(errors);
	        }
	    };
	    Subscription.prototype.add = function (teardown) {
	        var subscription = teardown;
	        if (!teardown) {
	            return Subscription.EMPTY;
	        }
	        switch (typeof teardown === "undefined" ? "undefined" : _typeof(teardown)) {
	            case 'function':
	                subscription = new Subscription(teardown);
	            case 'object':
	                if (subscription === this || subscription.closed || typeof subscription.unsubscribe !== 'function') {
	                    return subscription;
	                } else if (this.closed) {
	                    subscription.unsubscribe();
	                    return subscription;
	                } else if (!(subscription instanceof Subscription)) {
	                    var tmp = subscription;
	                    subscription = new Subscription();
	                    subscription._subscriptions = [tmp];
	                }
	                break;
	            default:
	                {
	                    throw new Error('unrecognized teardown ' + teardown + ' added to Subscription.');
	                }
	        }
	        var _parentOrParents = subscription._parentOrParents;
	        if (_parentOrParents === null) {
	            subscription._parentOrParents = this;
	        } else if (_parentOrParents instanceof Subscription) {
	            if (_parentOrParents === this) {
	                return subscription;
	            }
	            subscription._parentOrParents = [_parentOrParents, this];
	        } else if (_parentOrParents.indexOf(this) === -1) {
	            _parentOrParents.push(this);
	        } else {
	            return subscription;
	        }
	        var subscriptions = this._subscriptions;
	        if (subscriptions === null) {
	            this._subscriptions = [subscription];
	        } else {
	            subscriptions.push(subscription);
	        }
	        return subscription;
	    };
	    Subscription.prototype.remove = function (subscription) {
	        var subscriptions = this._subscriptions;
	        if (subscriptions) {
	            var subscriptionIndex = subscriptions.indexOf(subscription);
	            if (subscriptionIndex !== -1) {
	                subscriptions.splice(subscriptionIndex, 1);
	            }
	        }
	    };
	    Subscription.EMPTY = function (empty) {
	        empty.closed = true;
	        return empty;
	    }(new Subscription());
	    return Subscription;
	}();
	exports.Subscription = Subscription;
	function flattenUnsubscriptionErrors(errors) {
	    return errors.reduce(function (errs, err) {
	        return errs.concat(err instanceof UnsubscriptionError_1.UnsubscriptionError ? err.errors : err);
	    }, []);
	}
	//# sourceMappingURL=Subscription.js.map

/***/ },
/* 43 */
/***/ function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", { value: true });
	exports.isArray = Array.isArray || function (x) {
	  return x && typeof x.length === 'number';
	};
	//# sourceMappingURL=isArray.js.map

/***/ },
/* 44 */
/***/ function(module, exports) {

	"use strict";

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

	Object.defineProperty(exports, "__esModule", { value: true });
	function isObject(x) {
	    return x !== null && (typeof x === "undefined" ? "undefined" : _typeof(x)) === 'object';
	}
	exports.isObject = isObject;
	//# sourceMappingURL=isObject.js.map

/***/ },
/* 45 */
/***/ function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", { value: true });
	function UnsubscriptionErrorImpl(errors) {
	    Error.call(this);
	    this.message = errors ? errors.length + " errors occurred during unsubscription:\n" + errors.map(function (err, i) {
	        return i + 1 + ") " + err.toString();
	    }).join('\n  ') : '';
	    this.name = 'UnsubscriptionError';
	    this.errors = errors;
	    return this;
	}
	UnsubscriptionErrorImpl.prototype = Object.create(Error.prototype);
	exports.UnsubscriptionError = UnsubscriptionErrorImpl;
	//# sourceMappingURL=UnsubscriptionError.js.map

/***/ },
/* 46 */
/***/ function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", { value: true });
	exports.rxSubscriber = typeof Symbol === 'function' ? Symbol('rxSubscriber') : '@@rxSubscriber_' + Math.random();
	exports.$$rxSubscriber = exports.rxSubscriber;
	//# sourceMappingURL=rxSubscriber.js.map

/***/ },
/* 47 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", { value: true });
	var Subscriber_1 = __webpack_require__(37);
	var rxSubscriber_1 = __webpack_require__(46);
	var Observer_1 = __webpack_require__(39);
	function toSubscriber(nextOrObserver, error, complete) {
	    if (nextOrObserver) {
	        if (nextOrObserver instanceof Subscriber_1.Subscriber) {
	            return nextOrObserver;
	        }
	        if (nextOrObserver[rxSubscriber_1.rxSubscriber]) {
	            return nextOrObserver[rxSubscriber_1.rxSubscriber]();
	        }
	    }
	    if (!nextOrObserver && !error && !complete) {
	        return new Subscriber_1.Subscriber(Observer_1.empty);
	    }
	    return new Subscriber_1.Subscriber(nextOrObserver, error, complete);
	}
	exports.toSubscriber = toSubscriber;
	//# sourceMappingURL=toSubscriber.js.map

/***/ },
/* 48 */
/***/ function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", { value: true });
	exports.observable = typeof Symbol === 'function' && Symbol.observable || '@@observable';
	//# sourceMappingURL=observable.js.map

/***/ },
/* 49 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", { value: true });
	var noop_1 = __webpack_require__(50);
	function pipe() {
	    var fns = [];
	    for (var _i = 0; _i < arguments.length; _i++) {
	        fns[_i] = arguments[_i];
	    }
	    return pipeFromArray(fns);
	}
	exports.pipe = pipe;
	function pipeFromArray(fns) {
	    if (!fns) {
	        return noop_1.noop;
	    }
	    if (fns.length === 1) {
	        return fns[0];
	    }
	    return function piped(input) {
	        return fns.reduce(function (prev, fn) {
	            return fn(prev);
	        }, input);
	    };
	}
	exports.pipeFromArray = pipeFromArray;
	//# sourceMappingURL=pipe.js.map

/***/ },
/* 50 */
/***/ function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", { value: true });
	function noop() {}
	exports.noop = noop;
	//# sourceMappingURL=noop.js.map

/***/ },
/* 51 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var __extends = undefined && undefined.__extends || function () {
	    var _extendStatics = function extendStatics(d, b) {
	        _extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function (d, b) {
	            d.__proto__ = b;
	        } || function (d, b) {
	            for (var p in b) {
	                if (b.hasOwnProperty(p)) d[p] = b[p];
	            }
	        };
	        return _extendStatics(d, b);
	    };
	    return function (d, b) {
	        _extendStatics(d, b);
	        function __() {
	            this.constructor = d;
	        }
	        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	    };
	}();
	Object.defineProperty(exports, "__esModule", { value: true });
	var Subject_1 = __webpack_require__(52);
	var Observable_1 = __webpack_require__(35);
	var Subscriber_1 = __webpack_require__(37);
	var Subscription_1 = __webpack_require__(42);
	var refCount_1 = __webpack_require__(55);
	var ConnectableObservable = function (_super) {
	    __extends(ConnectableObservable, _super);
	    function ConnectableObservable(source, subjectFactory) {
	        var _this = _super.call(this) || this;
	        _this.source = source;
	        _this.subjectFactory = subjectFactory;
	        _this._refCount = 0;
	        _this._isComplete = false;
	        return _this;
	    }
	    ConnectableObservable.prototype._subscribe = function (subscriber) {
	        return this.getSubject().subscribe(subscriber);
	    };
	    ConnectableObservable.prototype.getSubject = function () {
	        var subject = this._subject;
	        if (!subject || subject.isStopped) {
	            this._subject = this.subjectFactory();
	        }
	        return this._subject;
	    };
	    ConnectableObservable.prototype.connect = function () {
	        var connection = this._connection;
	        if (!connection) {
	            this._isComplete = false;
	            connection = this._connection = new Subscription_1.Subscription();
	            connection.add(this.source.subscribe(new ConnectableSubscriber(this.getSubject(), this)));
	            if (connection.closed) {
	                this._connection = null;
	                connection = Subscription_1.Subscription.EMPTY;
	            }
	        }
	        return connection;
	    };
	    ConnectableObservable.prototype.refCount = function () {
	        return refCount_1.refCount()(this);
	    };
	    return ConnectableObservable;
	}(Observable_1.Observable);
	exports.ConnectableObservable = ConnectableObservable;
	var connectableProto = ConnectableObservable.prototype;
	exports.connectableObservableDescriptor = {
	    operator: { value: null },
	    _refCount: { value: 0, writable: true },
	    _subject: { value: null, writable: true },
	    _connection: { value: null, writable: true },
	    _subscribe: { value: connectableProto._subscribe },
	    _isComplete: { value: connectableProto._isComplete, writable: true },
	    getSubject: { value: connectableProto.getSubject },
	    connect: { value: connectableProto.connect },
	    refCount: { value: connectableProto.refCount }
	};
	var ConnectableSubscriber = function (_super) {
	    __extends(ConnectableSubscriber, _super);
	    function ConnectableSubscriber(destination, connectable) {
	        var _this = _super.call(this, destination) || this;
	        _this.connectable = connectable;
	        return _this;
	    }
	    ConnectableSubscriber.prototype._error = function (err) {
	        this._unsubscribe();
	        _super.prototype._error.call(this, err);
	    };
	    ConnectableSubscriber.prototype._complete = function () {
	        this.connectable._isComplete = true;
	        this._unsubscribe();
	        _super.prototype._complete.call(this);
	    };
	    ConnectableSubscriber.prototype._unsubscribe = function () {
	        var connectable = this.connectable;
	        if (connectable) {
	            this.connectable = null;
	            var connection = connectable._connection;
	            connectable._refCount = 0;
	            connectable._subject = null;
	            connectable._connection = null;
	            if (connection) {
	                connection.unsubscribe();
	            }
	        }
	    };
	    return ConnectableSubscriber;
	}(Subject_1.SubjectSubscriber);
	var RefCountOperator = function () {
	    function RefCountOperator(connectable) {
	        this.connectable = connectable;
	    }
	    RefCountOperator.prototype.call = function (subscriber, source) {
	        var connectable = this.connectable;
	        connectable._refCount++;
	        var refCounter = new RefCountSubscriber(subscriber, connectable);
	        var subscription = source.subscribe(refCounter);
	        if (!refCounter.closed) {
	            refCounter.connection = connectable.connect();
	        }
	        return subscription;
	    };
	    return RefCountOperator;
	}();
	var RefCountSubscriber = function (_super) {
	    __extends(RefCountSubscriber, _super);
	    function RefCountSubscriber(destination, connectable) {
	        var _this = _super.call(this, destination) || this;
	        _this.connectable = connectable;
	        return _this;
	    }
	    RefCountSubscriber.prototype._unsubscribe = function () {
	        var connectable = this.connectable;
	        if (!connectable) {
	            this.connection = null;
	            return;
	        }
	        this.connectable = null;
	        var refCount = connectable._refCount;
	        if (refCount <= 0) {
	            this.connection = null;
	            return;
	        }
	        connectable._refCount = refCount - 1;
	        if (refCount > 1) {
	            this.connection = null;
	            return;
	        }
	        var connection = this.connection;
	        var sharedConnection = connectable._connection;
	        this.connection = null;
	        if (sharedConnection && (!connection || sharedConnection === connection)) {
	            sharedConnection.unsubscribe();
	        }
	    };
	    return RefCountSubscriber;
	}(Subscriber_1.Subscriber);
	//# sourceMappingURL=ConnectableObservable.js.map

/***/ },
/* 52 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var __extends = undefined && undefined.__extends || function () {
	    var _extendStatics = function extendStatics(d, b) {
	        _extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function (d, b) {
	            d.__proto__ = b;
	        } || function (d, b) {
	            for (var p in b) {
	                if (b.hasOwnProperty(p)) d[p] = b[p];
	            }
	        };
	        return _extendStatics(d, b);
	    };
	    return function (d, b) {
	        _extendStatics(d, b);
	        function __() {
	            this.constructor = d;
	        }
	        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	    };
	}();
	Object.defineProperty(exports, "__esModule", { value: true });
	var Observable_1 = __webpack_require__(35);
	var Subscriber_1 = __webpack_require__(37);
	var Subscription_1 = __webpack_require__(42);
	var ObjectUnsubscribedError_1 = __webpack_require__(53);
	var SubjectSubscription_1 = __webpack_require__(54);
	var rxSubscriber_1 = __webpack_require__(46);
	var SubjectSubscriber = function (_super) {
	    __extends(SubjectSubscriber, _super);
	    function SubjectSubscriber(destination) {
	        var _this = _super.call(this, destination) || this;
	        _this.destination = destination;
	        return _this;
	    }
	    return SubjectSubscriber;
	}(Subscriber_1.Subscriber);
	exports.SubjectSubscriber = SubjectSubscriber;
	var Subject = function (_super) {
	    __extends(Subject, _super);
	    function Subject() {
	        var _this = _super.call(this) || this;
	        _this.observers = [];
	        _this.closed = false;
	        _this.isStopped = false;
	        _this.hasError = false;
	        _this.thrownError = null;
	        return _this;
	    }
	    Subject.prototype[rxSubscriber_1.rxSubscriber] = function () {
	        return new SubjectSubscriber(this);
	    };
	    Subject.prototype.lift = function (operator) {
	        var subject = new AnonymousSubject(this, this);
	        subject.operator = operator;
	        return subject;
	    };
	    Subject.prototype.next = function (value) {
	        if (this.closed) {
	            throw new ObjectUnsubscribedError_1.ObjectUnsubscribedError();
	        }
	        if (!this.isStopped) {
	            var observers = this.observers;
	            var len = observers.length;
	            var copy = observers.slice();
	            for (var i = 0; i < len; i++) {
	                copy[i].next(value);
	            }
	        }
	    };
	    Subject.prototype.error = function (err) {
	        if (this.closed) {
	            throw new ObjectUnsubscribedError_1.ObjectUnsubscribedError();
	        }
	        this.hasError = true;
	        this.thrownError = err;
	        this.isStopped = true;
	        var observers = this.observers;
	        var len = observers.length;
	        var copy = observers.slice();
	        for (var i = 0; i < len; i++) {
	            copy[i].error(err);
	        }
	        this.observers.length = 0;
	    };
	    Subject.prototype.complete = function () {
	        if (this.closed) {
	            throw new ObjectUnsubscribedError_1.ObjectUnsubscribedError();
	        }
	        this.isStopped = true;
	        var observers = this.observers;
	        var len = observers.length;
	        var copy = observers.slice();
	        for (var i = 0; i < len; i++) {
	            copy[i].complete();
	        }
	        this.observers.length = 0;
	    };
	    Subject.prototype.unsubscribe = function () {
	        this.isStopped = true;
	        this.closed = true;
	        this.observers = null;
	    };
	    Subject.prototype._trySubscribe = function (subscriber) {
	        if (this.closed) {
	            throw new ObjectUnsubscribedError_1.ObjectUnsubscribedError();
	        } else {
	            return _super.prototype._trySubscribe.call(this, subscriber);
	        }
	    };
	    Subject.prototype._subscribe = function (subscriber) {
	        if (this.closed) {
	            throw new ObjectUnsubscribedError_1.ObjectUnsubscribedError();
	        } else if (this.hasError) {
	            subscriber.error(this.thrownError);
	            return Subscription_1.Subscription.EMPTY;
	        } else if (this.isStopped) {
	            subscriber.complete();
	            return Subscription_1.Subscription.EMPTY;
	        } else {
	            this.observers.push(subscriber);
	            return new SubjectSubscription_1.SubjectSubscription(this, subscriber);
	        }
	    };
	    Subject.prototype.asObservable = function () {
	        var observable = new Observable_1.Observable();
	        observable.source = this;
	        return observable;
	    };
	    Subject.create = function (destination, source) {
	        return new AnonymousSubject(destination, source);
	    };
	    return Subject;
	}(Observable_1.Observable);
	exports.Subject = Subject;
	var AnonymousSubject = function (_super) {
	    __extends(AnonymousSubject, _super);
	    function AnonymousSubject(destination, source) {
	        var _this = _super.call(this) || this;
	        _this.destination = destination;
	        _this.source = source;
	        return _this;
	    }
	    AnonymousSubject.prototype.next = function (value) {
	        var destination = this.destination;
	        if (destination && destination.next) {
	            destination.next(value);
	        }
	    };
	    AnonymousSubject.prototype.error = function (err) {
	        var destination = this.destination;
	        if (destination && destination.error) {
	            this.destination.error(err);
	        }
	    };
	    AnonymousSubject.prototype.complete = function () {
	        var destination = this.destination;
	        if (destination && destination.complete) {
	            this.destination.complete();
	        }
	    };
	    AnonymousSubject.prototype._subscribe = function (subscriber) {
	        var source = this.source;
	        if (source) {
	            return this.source.subscribe(subscriber);
	        } else {
	            return Subscription_1.Subscription.EMPTY;
	        }
	    };
	    return AnonymousSubject;
	}(Subject);
	exports.AnonymousSubject = AnonymousSubject;
	//# sourceMappingURL=Subject.js.map

/***/ },
/* 53 */
/***/ function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", { value: true });
	function ObjectUnsubscribedErrorImpl() {
	    Error.call(this);
	    this.message = 'object unsubscribed';
	    this.name = 'ObjectUnsubscribedError';
	    return this;
	}
	ObjectUnsubscribedErrorImpl.prototype = Object.create(Error.prototype);
	exports.ObjectUnsubscribedError = ObjectUnsubscribedErrorImpl;
	//# sourceMappingURL=ObjectUnsubscribedError.js.map

/***/ },
/* 54 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var __extends = undefined && undefined.__extends || function () {
	    var _extendStatics = function extendStatics(d, b) {
	        _extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function (d, b) {
	            d.__proto__ = b;
	        } || function (d, b) {
	            for (var p in b) {
	                if (b.hasOwnProperty(p)) d[p] = b[p];
	            }
	        };
	        return _extendStatics(d, b);
	    };
	    return function (d, b) {
	        _extendStatics(d, b);
	        function __() {
	            this.constructor = d;
	        }
	        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	    };
	}();
	Object.defineProperty(exports, "__esModule", { value: true });
	var Subscription_1 = __webpack_require__(42);
	var SubjectSubscription = function (_super) {
	    __extends(SubjectSubscription, _super);
	    function SubjectSubscription(subject, subscriber) {
	        var _this = _super.call(this) || this;
	        _this.subject = subject;
	        _this.subscriber = subscriber;
	        _this.closed = false;
	        return _this;
	    }
	    SubjectSubscription.prototype.unsubscribe = function () {
	        if (this.closed) {
	            return;
	        }
	        this.closed = true;
	        var subject = this.subject;
	        var observers = subject.observers;
	        this.subject = null;
	        if (!observers || observers.length === 0 || subject.isStopped || subject.closed) {
	            return;
	        }
	        var subscriberIndex = observers.indexOf(this.subscriber);
	        if (subscriberIndex !== -1) {
	            observers.splice(subscriberIndex, 1);
	        }
	    };
	    return SubjectSubscription;
	}(Subscription_1.Subscription);
	exports.SubjectSubscription = SubjectSubscription;
	//# sourceMappingURL=SubjectSubscription.js.map

/***/ },
/* 55 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var __extends = undefined && undefined.__extends || function () {
	    var _extendStatics = function extendStatics(d, b) {
	        _extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function (d, b) {
	            d.__proto__ = b;
	        } || function (d, b) {
	            for (var p in b) {
	                if (b.hasOwnProperty(p)) d[p] = b[p];
	            }
	        };
	        return _extendStatics(d, b);
	    };
	    return function (d, b) {
	        _extendStatics(d, b);
	        function __() {
	            this.constructor = d;
	        }
	        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	    };
	}();
	Object.defineProperty(exports, "__esModule", { value: true });
	var Subscriber_1 = __webpack_require__(37);
	function refCount() {
	    return function refCountOperatorFunction(source) {
	        return source.lift(new RefCountOperator(source));
	    };
	}
	exports.refCount = refCount;
	var RefCountOperator = function () {
	    function RefCountOperator(connectable) {
	        this.connectable = connectable;
	    }
	    RefCountOperator.prototype.call = function (subscriber, source) {
	        var connectable = this.connectable;
	        connectable._refCount++;
	        var refCounter = new RefCountSubscriber(subscriber, connectable);
	        var subscription = source.subscribe(refCounter);
	        if (!refCounter.closed) {
	            refCounter.connection = connectable.connect();
	        }
	        return subscription;
	    };
	    return RefCountOperator;
	}();
	var RefCountSubscriber = function (_super) {
	    __extends(RefCountSubscriber, _super);
	    function RefCountSubscriber(destination, connectable) {
	        var _this = _super.call(this, destination) || this;
	        _this.connectable = connectable;
	        return _this;
	    }
	    RefCountSubscriber.prototype._unsubscribe = function () {
	        var connectable = this.connectable;
	        if (!connectable) {
	            this.connection = null;
	            return;
	        }
	        this.connectable = null;
	        var refCount = connectable._refCount;
	        if (refCount <= 0) {
	            this.connection = null;
	            return;
	        }
	        connectable._refCount = refCount - 1;
	        if (refCount > 1) {
	            this.connection = null;
	            return;
	        }
	        var connection = this.connection;
	        var sharedConnection = connectable._connection;
	        this.connection = null;
	        if (sharedConnection && (!connection || sharedConnection === connection)) {
	            sharedConnection.unsubscribe();
	        }
	    };
	    return RefCountSubscriber;
	}(Subscriber_1.Subscriber);
	//# sourceMappingURL=refCount.js.map

/***/ },
/* 56 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var __extends = undefined && undefined.__extends || function () {
	    var _extendStatics = function extendStatics(d, b) {
	        _extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function (d, b) {
	            d.__proto__ = b;
	        } || function (d, b) {
	            for (var p in b) {
	                if (b.hasOwnProperty(p)) d[p] = b[p];
	            }
	        };
	        return _extendStatics(d, b);
	    };
	    return function (d, b) {
	        _extendStatics(d, b);
	        function __() {
	            this.constructor = d;
	        }
	        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	    };
	}();
	Object.defineProperty(exports, "__esModule", { value: true });
	var Subscriber_1 = __webpack_require__(37);
	var Subscription_1 = __webpack_require__(42);
	var Observable_1 = __webpack_require__(35);
	var Subject_1 = __webpack_require__(52);
	function groupBy(keySelector, elementSelector, durationSelector, subjectSelector) {
	    return function (source) {
	        return source.lift(new GroupByOperator(keySelector, elementSelector, durationSelector, subjectSelector));
	    };
	}
	exports.groupBy = groupBy;
	var GroupByOperator = function () {
	    function GroupByOperator(keySelector, elementSelector, durationSelector, subjectSelector) {
	        this.keySelector = keySelector;
	        this.elementSelector = elementSelector;
	        this.durationSelector = durationSelector;
	        this.subjectSelector = subjectSelector;
	    }
	    GroupByOperator.prototype.call = function (subscriber, source) {
	        return source.subscribe(new GroupBySubscriber(subscriber, this.keySelector, this.elementSelector, this.durationSelector, this.subjectSelector));
	    };
	    return GroupByOperator;
	}();
	var GroupBySubscriber = function (_super) {
	    __extends(GroupBySubscriber, _super);
	    function GroupBySubscriber(destination, keySelector, elementSelector, durationSelector, subjectSelector) {
	        var _this = _super.call(this, destination) || this;
	        _this.keySelector = keySelector;
	        _this.elementSelector = elementSelector;
	        _this.durationSelector = durationSelector;
	        _this.subjectSelector = subjectSelector;
	        _this.groups = null;
	        _this.attemptedToUnsubscribe = false;
	        _this.count = 0;
	        return _this;
	    }
	    GroupBySubscriber.prototype._next = function (value) {
	        var key;
	        try {
	            key = this.keySelector(value);
	        } catch (err) {
	            this.error(err);
	            return;
	        }
	        this._group(value, key);
	    };
	    GroupBySubscriber.prototype._group = function (value, key) {
	        var groups = this.groups;
	        if (!groups) {
	            groups = this.groups = new Map();
	        }
	        var group = groups.get(key);
	        var element;
	        if (this.elementSelector) {
	            try {
	                element = this.elementSelector(value);
	            } catch (err) {
	                this.error(err);
	            }
	        } else {
	            element = value;
	        }
	        if (!group) {
	            group = this.subjectSelector ? this.subjectSelector() : new Subject_1.Subject();
	            groups.set(key, group);
	            var groupedObservable = new GroupedObservable(key, group, this);
	            this.destination.next(groupedObservable);
	            if (this.durationSelector) {
	                var duration = void 0;
	                try {
	                    duration = this.durationSelector(new GroupedObservable(key, group));
	                } catch (err) {
	                    this.error(err);
	                    return;
	                }
	                this.add(duration.subscribe(new GroupDurationSubscriber(key, group, this)));
	            }
	        }
	        if (!group.closed) {
	            group.next(element);
	        }
	    };
	    GroupBySubscriber.prototype._error = function (err) {
	        var groups = this.groups;
	        if (groups) {
	            groups.forEach(function (group, key) {
	                group.error(err);
	            });
	            groups.clear();
	        }
	        this.destination.error(err);
	    };
	    GroupBySubscriber.prototype._complete = function () {
	        var groups = this.groups;
	        if (groups) {
	            groups.forEach(function (group, key) {
	                group.complete();
	            });
	            groups.clear();
	        }
	        this.destination.complete();
	    };
	    GroupBySubscriber.prototype.removeGroup = function (key) {
	        this.groups.delete(key);
	    };
	    GroupBySubscriber.prototype.unsubscribe = function () {
	        if (!this.closed) {
	            this.attemptedToUnsubscribe = true;
	            if (this.count === 0) {
	                _super.prototype.unsubscribe.call(this);
	            }
	        }
	    };
	    return GroupBySubscriber;
	}(Subscriber_1.Subscriber);
	var GroupDurationSubscriber = function (_super) {
	    __extends(GroupDurationSubscriber, _super);
	    function GroupDurationSubscriber(key, group, parent) {
	        var _this = _super.call(this, group) || this;
	        _this.key = key;
	        _this.group = group;
	        _this.parent = parent;
	        return _this;
	    }
	    GroupDurationSubscriber.prototype._next = function (value) {
	        this.complete();
	    };
	    GroupDurationSubscriber.prototype._unsubscribe = function () {
	        var _a = this,
	            parent = _a.parent,
	            key = _a.key;
	        this.key = this.parent = null;
	        if (parent) {
	            parent.removeGroup(key);
	        }
	    };
	    return GroupDurationSubscriber;
	}(Subscriber_1.Subscriber);
	var GroupedObservable = function (_super) {
	    __extends(GroupedObservable, _super);
	    function GroupedObservable(key, groupSubject, refCountSubscription) {
	        var _this = _super.call(this) || this;
	        _this.key = key;
	        _this.groupSubject = groupSubject;
	        _this.refCountSubscription = refCountSubscription;
	        return _this;
	    }
	    GroupedObservable.prototype._subscribe = function (subscriber) {
	        var subscription = new Subscription_1.Subscription();
	        var _a = this,
	            refCountSubscription = _a.refCountSubscription,
	            groupSubject = _a.groupSubject;
	        if (refCountSubscription && !refCountSubscription.closed) {
	            subscription.add(new InnerRefCountSubscription(refCountSubscription));
	        }
	        subscription.add(groupSubject.subscribe(subscriber));
	        return subscription;
	    };
	    return GroupedObservable;
	}(Observable_1.Observable);
	exports.GroupedObservable = GroupedObservable;
	var InnerRefCountSubscription = function (_super) {
	    __extends(InnerRefCountSubscription, _super);
	    function InnerRefCountSubscription(parent) {
	        var _this = _super.call(this) || this;
	        _this.parent = parent;
	        parent.count++;
	        return _this;
	    }
	    InnerRefCountSubscription.prototype.unsubscribe = function () {
	        var parent = this.parent;
	        if (!parent.closed && !this.closed) {
	            _super.prototype.unsubscribe.call(this);
	            parent.count -= 1;
	            if (parent.count === 0 && parent.attemptedToUnsubscribe) {
	                parent.unsubscribe();
	            }
	        }
	    };
	    return InnerRefCountSubscription;
	}(Subscription_1.Subscription);
	//# sourceMappingURL=groupBy.js.map

/***/ },
/* 57 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var __extends = undefined && undefined.__extends || function () {
	    var _extendStatics = function extendStatics(d, b) {
	        _extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function (d, b) {
	            d.__proto__ = b;
	        } || function (d, b) {
	            for (var p in b) {
	                if (b.hasOwnProperty(p)) d[p] = b[p];
	            }
	        };
	        return _extendStatics(d, b);
	    };
	    return function (d, b) {
	        _extendStatics(d, b);
	        function __() {
	            this.constructor = d;
	        }
	        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	    };
	}();
	Object.defineProperty(exports, "__esModule", { value: true });
	var Subject_1 = __webpack_require__(52);
	var ObjectUnsubscribedError_1 = __webpack_require__(53);
	var BehaviorSubject = function (_super) {
	    __extends(BehaviorSubject, _super);
	    function BehaviorSubject(_value) {
	        var _this = _super.call(this) || this;
	        _this._value = _value;
	        return _this;
	    }
	    Object.defineProperty(BehaviorSubject.prototype, "value", {
	        get: function get() {
	            return this.getValue();
	        },
	        enumerable: true,
	        configurable: true
	    });
	    BehaviorSubject.prototype._subscribe = function (subscriber) {
	        var subscription = _super.prototype._subscribe.call(this, subscriber);
	        if (subscription && !subscription.closed) {
	            subscriber.next(this._value);
	        }
	        return subscription;
	    };
	    BehaviorSubject.prototype.getValue = function () {
	        if (this.hasError) {
	            throw this.thrownError;
	        } else if (this.closed) {
	            throw new ObjectUnsubscribedError_1.ObjectUnsubscribedError();
	        } else {
	            return this._value;
	        }
	    };
	    BehaviorSubject.prototype.next = function (value) {
	        _super.prototype.next.call(this, this._value = value);
	    };
	    return BehaviorSubject;
	}(Subject_1.Subject);
	exports.BehaviorSubject = BehaviorSubject;
	//# sourceMappingURL=BehaviorSubject.js.map

/***/ },
/* 58 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var __extends = undefined && undefined.__extends || function () {
	    var _extendStatics = function extendStatics(d, b) {
	        _extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function (d, b) {
	            d.__proto__ = b;
	        } || function (d, b) {
	            for (var p in b) {
	                if (b.hasOwnProperty(p)) d[p] = b[p];
	            }
	        };
	        return _extendStatics(d, b);
	    };
	    return function (d, b) {
	        _extendStatics(d, b);
	        function __() {
	            this.constructor = d;
	        }
	        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	    };
	}();
	Object.defineProperty(exports, "__esModule", { value: true });
	var Subject_1 = __webpack_require__(52);
	var queue_1 = __webpack_require__(59);
	var Subscription_1 = __webpack_require__(42);
	var observeOn_1 = __webpack_require__(66);
	var ObjectUnsubscribedError_1 = __webpack_require__(53);
	var SubjectSubscription_1 = __webpack_require__(54);
	var ReplaySubject = function (_super) {
	    __extends(ReplaySubject, _super);
	    function ReplaySubject(bufferSize, windowTime, scheduler) {
	        if (bufferSize === void 0) {
	            bufferSize = Number.POSITIVE_INFINITY;
	        }
	        if (windowTime === void 0) {
	            windowTime = Number.POSITIVE_INFINITY;
	        }
	        var _this = _super.call(this) || this;
	        _this.scheduler = scheduler;
	        _this._events = [];
	        _this._infiniteTimeWindow = false;
	        _this._bufferSize = bufferSize < 1 ? 1 : bufferSize;
	        _this._windowTime = windowTime < 1 ? 1 : windowTime;
	        if (windowTime === Number.POSITIVE_INFINITY) {
	            _this._infiniteTimeWindow = true;
	            _this.next = _this.nextInfiniteTimeWindow;
	        } else {
	            _this.next = _this.nextTimeWindow;
	        }
	        return _this;
	    }
	    ReplaySubject.prototype.nextInfiniteTimeWindow = function (value) {
	        var _events = this._events;
	        _events.push(value);
	        if (_events.length > this._bufferSize) {
	            _events.shift();
	        }
	        _super.prototype.next.call(this, value);
	    };
	    ReplaySubject.prototype.nextTimeWindow = function (value) {
	        this._events.push(new ReplayEvent(this._getNow(), value));
	        this._trimBufferThenGetEvents();
	        _super.prototype.next.call(this, value);
	    };
	    ReplaySubject.prototype._subscribe = function (subscriber) {
	        var _infiniteTimeWindow = this._infiniteTimeWindow;
	        var _events = _infiniteTimeWindow ? this._events : this._trimBufferThenGetEvents();
	        var scheduler = this.scheduler;
	        var len = _events.length;
	        var subscription;
	        if (this.closed) {
	            throw new ObjectUnsubscribedError_1.ObjectUnsubscribedError();
	        } else if (this.isStopped || this.hasError) {
	            subscription = Subscription_1.Subscription.EMPTY;
	        } else {
	            this.observers.push(subscriber);
	            subscription = new SubjectSubscription_1.SubjectSubscription(this, subscriber);
	        }
	        if (scheduler) {
	            subscriber.add(subscriber = new observeOn_1.ObserveOnSubscriber(subscriber, scheduler));
	        }
	        if (_infiniteTimeWindow) {
	            for (var i = 0; i < len && !subscriber.closed; i++) {
	                subscriber.next(_events[i]);
	            }
	        } else {
	            for (var i = 0; i < len && !subscriber.closed; i++) {
	                subscriber.next(_events[i].value);
	            }
	        }
	        if (this.hasError) {
	            subscriber.error(this.thrownError);
	        } else if (this.isStopped) {
	            subscriber.complete();
	        }
	        return subscription;
	    };
	    ReplaySubject.prototype._getNow = function () {
	        return (this.scheduler || queue_1.queue).now();
	    };
	    ReplaySubject.prototype._trimBufferThenGetEvents = function () {
	        var now = this._getNow();
	        var _bufferSize = this._bufferSize;
	        var _windowTime = this._windowTime;
	        var _events = this._events;
	        var eventsCount = _events.length;
	        var spliceCount = 0;
	        while (spliceCount < eventsCount) {
	            if (now - _events[spliceCount].time < _windowTime) {
	                break;
	            }
	            spliceCount++;
	        }
	        if (eventsCount > _bufferSize) {
	            spliceCount = Math.max(spliceCount, eventsCount - _bufferSize);
	        }
	        if (spliceCount > 0) {
	            _events.splice(0, spliceCount);
	        }
	        return _events;
	    };
	    return ReplaySubject;
	}(Subject_1.Subject);
	exports.ReplaySubject = ReplaySubject;
	var ReplayEvent = function () {
	    function ReplayEvent(time, value) {
	        this.time = time;
	        this.value = value;
	    }
	    return ReplayEvent;
	}();
	//# sourceMappingURL=ReplaySubject.js.map

/***/ },
/* 59 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", { value: true });
	var QueueAction_1 = __webpack_require__(60);
	var QueueScheduler_1 = __webpack_require__(63);
	exports.queue = new QueueScheduler_1.QueueScheduler(QueueAction_1.QueueAction);
	//# sourceMappingURL=queue.js.map

/***/ },
/* 60 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var __extends = undefined && undefined.__extends || function () {
	    var _extendStatics = function extendStatics(d, b) {
	        _extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function (d, b) {
	            d.__proto__ = b;
	        } || function (d, b) {
	            for (var p in b) {
	                if (b.hasOwnProperty(p)) d[p] = b[p];
	            }
	        };
	        return _extendStatics(d, b);
	    };
	    return function (d, b) {
	        _extendStatics(d, b);
	        function __() {
	            this.constructor = d;
	        }
	        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	    };
	}();
	Object.defineProperty(exports, "__esModule", { value: true });
	var AsyncAction_1 = __webpack_require__(61);
	var QueueAction = function (_super) {
	    __extends(QueueAction, _super);
	    function QueueAction(scheduler, work) {
	        var _this = _super.call(this, scheduler, work) || this;
	        _this.scheduler = scheduler;
	        _this.work = work;
	        return _this;
	    }
	    QueueAction.prototype.schedule = function (state, delay) {
	        if (delay === void 0) {
	            delay = 0;
	        }
	        if (delay > 0) {
	            return _super.prototype.schedule.call(this, state, delay);
	        }
	        this.delay = delay;
	        this.state = state;
	        this.scheduler.flush(this);
	        return this;
	    };
	    QueueAction.prototype.execute = function (state, delay) {
	        return delay > 0 || this.closed ? _super.prototype.execute.call(this, state, delay) : this._execute(state, delay);
	    };
	    QueueAction.prototype.requestAsyncId = function (scheduler, id, delay) {
	        if (delay === void 0) {
	            delay = 0;
	        }
	        if (delay !== null && delay > 0 || delay === null && this.delay > 0) {
	            return _super.prototype.requestAsyncId.call(this, scheduler, id, delay);
	        }
	        return scheduler.flush(this);
	    };
	    return QueueAction;
	}(AsyncAction_1.AsyncAction);
	exports.QueueAction = QueueAction;
	//# sourceMappingURL=QueueAction.js.map

/***/ },
/* 61 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var __extends = undefined && undefined.__extends || function () {
	    var _extendStatics = function extendStatics(d, b) {
	        _extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function (d, b) {
	            d.__proto__ = b;
	        } || function (d, b) {
	            for (var p in b) {
	                if (b.hasOwnProperty(p)) d[p] = b[p];
	            }
	        };
	        return _extendStatics(d, b);
	    };
	    return function (d, b) {
	        _extendStatics(d, b);
	        function __() {
	            this.constructor = d;
	        }
	        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	    };
	}();
	Object.defineProperty(exports, "__esModule", { value: true });
	var Action_1 = __webpack_require__(62);
	var AsyncAction = function (_super) {
	    __extends(AsyncAction, _super);
	    function AsyncAction(scheduler, work) {
	        var _this = _super.call(this, scheduler, work) || this;
	        _this.scheduler = scheduler;
	        _this.work = work;
	        _this.pending = false;
	        return _this;
	    }
	    AsyncAction.prototype.schedule = function (state, delay) {
	        if (delay === void 0) {
	            delay = 0;
	        }
	        if (this.closed) {
	            return this;
	        }
	        this.state = state;
	        var id = this.id;
	        var scheduler = this.scheduler;
	        if (id != null) {
	            this.id = this.recycleAsyncId(scheduler, id, delay);
	        }
	        this.pending = true;
	        this.delay = delay;
	        this.id = this.id || this.requestAsyncId(scheduler, this.id, delay);
	        return this;
	    };
	    AsyncAction.prototype.requestAsyncId = function (scheduler, id, delay) {
	        if (delay === void 0) {
	            delay = 0;
	        }
	        return setInterval(scheduler.flush.bind(scheduler, this), delay);
	    };
	    AsyncAction.prototype.recycleAsyncId = function (scheduler, id, delay) {
	        if (delay === void 0) {
	            delay = 0;
	        }
	        if (delay !== null && this.delay === delay && this.pending === false) {
	            return id;
	        }
	        clearInterval(id);
	        return undefined;
	    };
	    AsyncAction.prototype.execute = function (state, delay) {
	        if (this.closed) {
	            return new Error('executing a cancelled action');
	        }
	        this.pending = false;
	        var error = this._execute(state, delay);
	        if (error) {
	            return error;
	        } else if (this.pending === false && this.id != null) {
	            this.id = this.recycleAsyncId(this.scheduler, this.id, null);
	        }
	    };
	    AsyncAction.prototype._execute = function (state, delay) {
	        var errored = false;
	        var errorValue = undefined;
	        try {
	            this.work(state);
	        } catch (e) {
	            errored = true;
	            errorValue = !!e && e || new Error(e);
	        }
	        if (errored) {
	            this.unsubscribe();
	            return errorValue;
	        }
	    };
	    AsyncAction.prototype._unsubscribe = function () {
	        var id = this.id;
	        var scheduler = this.scheduler;
	        var actions = scheduler.actions;
	        var index = actions.indexOf(this);
	        this.work = null;
	        this.state = null;
	        this.pending = false;
	        this.scheduler = null;
	        if (index !== -1) {
	            actions.splice(index, 1);
	        }
	        if (id != null) {
	            this.id = this.recycleAsyncId(scheduler, id, null);
	        }
	        this.delay = null;
	    };
	    return AsyncAction;
	}(Action_1.Action);
	exports.AsyncAction = AsyncAction;
	//# sourceMappingURL=AsyncAction.js.map

/***/ },
/* 62 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var __extends = undefined && undefined.__extends || function () {
	    var _extendStatics = function extendStatics(d, b) {
	        _extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function (d, b) {
	            d.__proto__ = b;
	        } || function (d, b) {
	            for (var p in b) {
	                if (b.hasOwnProperty(p)) d[p] = b[p];
	            }
	        };
	        return _extendStatics(d, b);
	    };
	    return function (d, b) {
	        _extendStatics(d, b);
	        function __() {
	            this.constructor = d;
	        }
	        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	    };
	}();
	Object.defineProperty(exports, "__esModule", { value: true });
	var Subscription_1 = __webpack_require__(42);
	var Action = function (_super) {
	    __extends(Action, _super);
	    function Action(scheduler, work) {
	        return _super.call(this) || this;
	    }
	    Action.prototype.schedule = function (state, delay) {
	        if (delay === void 0) {
	            delay = 0;
	        }
	        return this;
	    };
	    return Action;
	}(Subscription_1.Subscription);
	exports.Action = Action;
	//# sourceMappingURL=Action.js.map

/***/ },
/* 63 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var __extends = undefined && undefined.__extends || function () {
	    var _extendStatics = function extendStatics(d, b) {
	        _extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function (d, b) {
	            d.__proto__ = b;
	        } || function (d, b) {
	            for (var p in b) {
	                if (b.hasOwnProperty(p)) d[p] = b[p];
	            }
	        };
	        return _extendStatics(d, b);
	    };
	    return function (d, b) {
	        _extendStatics(d, b);
	        function __() {
	            this.constructor = d;
	        }
	        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	    };
	}();
	Object.defineProperty(exports, "__esModule", { value: true });
	var AsyncScheduler_1 = __webpack_require__(64);
	var QueueScheduler = function (_super) {
	    __extends(QueueScheduler, _super);
	    function QueueScheduler() {
	        return _super !== null && _super.apply(this, arguments) || this;
	    }
	    return QueueScheduler;
	}(AsyncScheduler_1.AsyncScheduler);
	exports.QueueScheduler = QueueScheduler;
	//# sourceMappingURL=QueueScheduler.js.map

/***/ },
/* 64 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var __extends = undefined && undefined.__extends || function () {
	    var _extendStatics = function extendStatics(d, b) {
	        _extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function (d, b) {
	            d.__proto__ = b;
	        } || function (d, b) {
	            for (var p in b) {
	                if (b.hasOwnProperty(p)) d[p] = b[p];
	            }
	        };
	        return _extendStatics(d, b);
	    };
	    return function (d, b) {
	        _extendStatics(d, b);
	        function __() {
	            this.constructor = d;
	        }
	        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	    };
	}();
	Object.defineProperty(exports, "__esModule", { value: true });
	var Scheduler_1 = __webpack_require__(65);
	var AsyncScheduler = function (_super) {
	    __extends(AsyncScheduler, _super);
	    function AsyncScheduler(SchedulerAction, now) {
	        if (now === void 0) {
	            now = Scheduler_1.Scheduler.now;
	        }
	        var _this = _super.call(this, SchedulerAction, function () {
	            if (AsyncScheduler.delegate && AsyncScheduler.delegate !== _this) {
	                return AsyncScheduler.delegate.now();
	            } else {
	                return now();
	            }
	        }) || this;
	        _this.actions = [];
	        _this.active = false;
	        _this.scheduled = undefined;
	        return _this;
	    }
	    AsyncScheduler.prototype.schedule = function (work, delay, state) {
	        if (delay === void 0) {
	            delay = 0;
	        }
	        if (AsyncScheduler.delegate && AsyncScheduler.delegate !== this) {
	            return AsyncScheduler.delegate.schedule(work, delay, state);
	        } else {
	            return _super.prototype.schedule.call(this, work, delay, state);
	        }
	    };
	    AsyncScheduler.prototype.flush = function (action) {
	        var actions = this.actions;
	        if (this.active) {
	            actions.push(action);
	            return;
	        }
	        var error;
	        this.active = true;
	        do {
	            if (error = action.execute(action.state, action.delay)) {
	                break;
	            }
	        } while (action = actions.shift());
	        this.active = false;
	        if (error) {
	            while (action = actions.shift()) {
	                action.unsubscribe();
	            }
	            throw error;
	        }
	    };
	    return AsyncScheduler;
	}(Scheduler_1.Scheduler);
	exports.AsyncScheduler = AsyncScheduler;
	//# sourceMappingURL=AsyncScheduler.js.map

/***/ },
/* 65 */
/***/ function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", { value: true });
	var Scheduler = function () {
	    function Scheduler(SchedulerAction, now) {
	        if (now === void 0) {
	            now = Scheduler.now;
	        }
	        this.SchedulerAction = SchedulerAction;
	        this.now = now;
	    }
	    Scheduler.prototype.schedule = function (work, delay, state) {
	        if (delay === void 0) {
	            delay = 0;
	        }
	        return new this.SchedulerAction(this, work).schedule(state, delay);
	    };
	    Scheduler.now = function () {
	        return Date.now();
	    };
	    return Scheduler;
	}();
	exports.Scheduler = Scheduler;
	//# sourceMappingURL=Scheduler.js.map

/***/ },
/* 66 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var __extends = undefined && undefined.__extends || function () {
	    var _extendStatics = function extendStatics(d, b) {
	        _extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function (d, b) {
	            d.__proto__ = b;
	        } || function (d, b) {
	            for (var p in b) {
	                if (b.hasOwnProperty(p)) d[p] = b[p];
	            }
	        };
	        return _extendStatics(d, b);
	    };
	    return function (d, b) {
	        _extendStatics(d, b);
	        function __() {
	            this.constructor = d;
	        }
	        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	    };
	}();
	Object.defineProperty(exports, "__esModule", { value: true });
	var Subscriber_1 = __webpack_require__(37);
	var Notification_1 = __webpack_require__(67);
	function observeOn(scheduler, delay) {
	    if (delay === void 0) {
	        delay = 0;
	    }
	    return function observeOnOperatorFunction(source) {
	        return source.lift(new ObserveOnOperator(scheduler, delay));
	    };
	}
	exports.observeOn = observeOn;
	var ObserveOnOperator = function () {
	    function ObserveOnOperator(scheduler, delay) {
	        if (delay === void 0) {
	            delay = 0;
	        }
	        this.scheduler = scheduler;
	        this.delay = delay;
	    }
	    ObserveOnOperator.prototype.call = function (subscriber, source) {
	        return source.subscribe(new ObserveOnSubscriber(subscriber, this.scheduler, this.delay));
	    };
	    return ObserveOnOperator;
	}();
	exports.ObserveOnOperator = ObserveOnOperator;
	var ObserveOnSubscriber = function (_super) {
	    __extends(ObserveOnSubscriber, _super);
	    function ObserveOnSubscriber(destination, scheduler, delay) {
	        if (delay === void 0) {
	            delay = 0;
	        }
	        var _this = _super.call(this, destination) || this;
	        _this.scheduler = scheduler;
	        _this.delay = delay;
	        return _this;
	    }
	    ObserveOnSubscriber.dispatch = function (arg) {
	        var notification = arg.notification,
	            destination = arg.destination;
	        notification.observe(destination);
	        this.unsubscribe();
	    };
	    ObserveOnSubscriber.prototype.scheduleMessage = function (notification) {
	        var destination = this.destination;
	        destination.add(this.scheduler.schedule(ObserveOnSubscriber.dispatch, this.delay, new ObserveOnMessage(notification, this.destination)));
	    };
	    ObserveOnSubscriber.prototype._next = function (value) {
	        this.scheduleMessage(Notification_1.Notification.createNext(value));
	    };
	    ObserveOnSubscriber.prototype._error = function (err) {
	        this.scheduleMessage(Notification_1.Notification.createError(err));
	        this.unsubscribe();
	    };
	    ObserveOnSubscriber.prototype._complete = function () {
	        this.scheduleMessage(Notification_1.Notification.createComplete());
	        this.unsubscribe();
	    };
	    return ObserveOnSubscriber;
	}(Subscriber_1.Subscriber);
	exports.ObserveOnSubscriber = ObserveOnSubscriber;
	var ObserveOnMessage = function () {
	    function ObserveOnMessage(notification, destination) {
	        this.notification = notification;
	        this.destination = destination;
	    }
	    return ObserveOnMessage;
	}();
	exports.ObserveOnMessage = ObserveOnMessage;
	//# sourceMappingURL=observeOn.js.map

/***/ },
/* 67 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", { value: true });
	var empty_1 = __webpack_require__(68);
	var of_1 = __webpack_require__(69);
	var throwError_1 = __webpack_require__(74);
	var NotificationKind;
	(function (NotificationKind) {
	    NotificationKind["NEXT"] = "N";
	    NotificationKind["ERROR"] = "E";
	    NotificationKind["COMPLETE"] = "C";
	})(NotificationKind = exports.NotificationKind || (exports.NotificationKind = {}));
	var Notification = function () {
	    function Notification(kind, value, error) {
	        this.kind = kind;
	        this.value = value;
	        this.error = error;
	        this.hasValue = kind === 'N';
	    }
	    Notification.prototype.observe = function (observer) {
	        switch (this.kind) {
	            case 'N':
	                return observer.next && observer.next(this.value);
	            case 'E':
	                return observer.error && observer.error(this.error);
	            case 'C':
	                return observer.complete && observer.complete();
	        }
	    };
	    Notification.prototype.do = function (next, error, complete) {
	        var kind = this.kind;
	        switch (kind) {
	            case 'N':
	                return next && next(this.value);
	            case 'E':
	                return error && error(this.error);
	            case 'C':
	                return complete && complete();
	        }
	    };
	    Notification.prototype.accept = function (nextOrObserver, error, complete) {
	        if (nextOrObserver && typeof nextOrObserver.next === 'function') {
	            return this.observe(nextOrObserver);
	        } else {
	            return this.do(nextOrObserver, error, complete);
	        }
	    };
	    Notification.prototype.toObservable = function () {
	        var kind = this.kind;
	        switch (kind) {
	            case 'N':
	                return of_1.of(this.value);
	            case 'E':
	                return throwError_1.throwError(this.error);
	            case 'C':
	                return empty_1.empty();
	        }
	        throw new Error('unexpected notification kind value');
	    };
	    Notification.createNext = function (value) {
	        if (typeof value !== 'undefined') {
	            return new Notification('N', value);
	        }
	        return Notification.undefinedValueNotification;
	    };
	    Notification.createError = function (err) {
	        return new Notification('E', undefined, err);
	    };
	    Notification.createComplete = function () {
	        return Notification.completeNotification;
	    };
	    Notification.completeNotification = new Notification('C');
	    Notification.undefinedValueNotification = new Notification('N', undefined);
	    return Notification;
	}();
	exports.Notification = Notification;
	//# sourceMappingURL=Notification.js.map

/***/ },
/* 68 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", { value: true });
	var Observable_1 = __webpack_require__(35);
	exports.EMPTY = new Observable_1.Observable(function (subscriber) {
	    return subscriber.complete();
	});
	function empty(scheduler) {
	    return scheduler ? emptyScheduled(scheduler) : exports.EMPTY;
	}
	exports.empty = empty;
	function emptyScheduled(scheduler) {
	    return new Observable_1.Observable(function (subscriber) {
	        return scheduler.schedule(function () {
	            return subscriber.complete();
	        });
	    });
	}
	//# sourceMappingURL=empty.js.map

/***/ },
/* 69 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", { value: true });
	var isScheduler_1 = __webpack_require__(70);
	var fromArray_1 = __webpack_require__(71);
	var scheduleArray_1 = __webpack_require__(73);
	function of() {
	    var args = [];
	    for (var _i = 0; _i < arguments.length; _i++) {
	        args[_i] = arguments[_i];
	    }
	    var scheduler = args[args.length - 1];
	    if (isScheduler_1.isScheduler(scheduler)) {
	        args.pop();
	        return scheduleArray_1.scheduleArray(args, scheduler);
	    } else {
	        return fromArray_1.fromArray(args);
	    }
	}
	exports.of = of;
	//# sourceMappingURL=of.js.map

/***/ },
/* 70 */
/***/ function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", { value: true });
	function isScheduler(value) {
	    return value && typeof value.schedule === 'function';
	}
	exports.isScheduler = isScheduler;
	//# sourceMappingURL=isScheduler.js.map

/***/ },
/* 71 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", { value: true });
	var Observable_1 = __webpack_require__(35);
	var subscribeToArray_1 = __webpack_require__(72);
	var scheduleArray_1 = __webpack_require__(73);
	function fromArray(input, scheduler) {
	    if (!scheduler) {
	        return new Observable_1.Observable(subscribeToArray_1.subscribeToArray(input));
	    } else {
	        return scheduleArray_1.scheduleArray(input, scheduler);
	    }
	}
	exports.fromArray = fromArray;
	//# sourceMappingURL=fromArray.js.map

/***/ },
/* 72 */
/***/ function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", { value: true });
	exports.subscribeToArray = function (array) {
	    return function (subscriber) {
	        for (var i = 0, len = array.length; i < len && !subscriber.closed; i++) {
	            subscriber.next(array[i]);
	        }
	        subscriber.complete();
	    };
	};
	//# sourceMappingURL=subscribeToArray.js.map

/***/ },
/* 73 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", { value: true });
	var Observable_1 = __webpack_require__(35);
	var Subscription_1 = __webpack_require__(42);
	function scheduleArray(input, scheduler) {
	    return new Observable_1.Observable(function (subscriber) {
	        var sub = new Subscription_1.Subscription();
	        var i = 0;
	        sub.add(scheduler.schedule(function () {
	            if (i === input.length) {
	                subscriber.complete();
	                return;
	            }
	            subscriber.next(input[i++]);
	            if (!subscriber.closed) {
	                sub.add(this.schedule());
	            }
	        }));
	        return sub;
	    });
	}
	exports.scheduleArray = scheduleArray;
	//# sourceMappingURL=scheduleArray.js.map

/***/ },
/* 74 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", { value: true });
	var Observable_1 = __webpack_require__(35);
	function throwError(error, scheduler) {
	    if (!scheduler) {
	        return new Observable_1.Observable(function (subscriber) {
	            return subscriber.error(error);
	        });
	    } else {
	        return new Observable_1.Observable(function (subscriber) {
	            return scheduler.schedule(dispatch, 0, { error: error, subscriber: subscriber });
	        });
	    }
	}
	exports.throwError = throwError;
	function dispatch(_a) {
	    var error = _a.error,
	        subscriber = _a.subscriber;
	    subscriber.error(error);
	}
	//# sourceMappingURL=throwError.js.map

/***/ },
/* 75 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var __extends = undefined && undefined.__extends || function () {
	    var _extendStatics = function extendStatics(d, b) {
	        _extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function (d, b) {
	            d.__proto__ = b;
	        } || function (d, b) {
	            for (var p in b) {
	                if (b.hasOwnProperty(p)) d[p] = b[p];
	            }
	        };
	        return _extendStatics(d, b);
	    };
	    return function (d, b) {
	        _extendStatics(d, b);
	        function __() {
	            this.constructor = d;
	        }
	        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	    };
	}();
	Object.defineProperty(exports, "__esModule", { value: true });
	var Subject_1 = __webpack_require__(52);
	var Subscription_1 = __webpack_require__(42);
	var AsyncSubject = function (_super) {
	    __extends(AsyncSubject, _super);
	    function AsyncSubject() {
	        var _this = _super !== null && _super.apply(this, arguments) || this;
	        _this.value = null;
	        _this.hasNext = false;
	        _this.hasCompleted = false;
	        return _this;
	    }
	    AsyncSubject.prototype._subscribe = function (subscriber) {
	        if (this.hasError) {
	            subscriber.error(this.thrownError);
	            return Subscription_1.Subscription.EMPTY;
	        } else if (this.hasCompleted && this.hasNext) {
	            subscriber.next(this.value);
	            subscriber.complete();
	            return Subscription_1.Subscription.EMPTY;
	        }
	        return _super.prototype._subscribe.call(this, subscriber);
	    };
	    AsyncSubject.prototype.next = function (value) {
	        if (!this.hasCompleted) {
	            this.value = value;
	            this.hasNext = true;
	        }
	    };
	    AsyncSubject.prototype.error = function (error) {
	        if (!this.hasCompleted) {
	            _super.prototype.error.call(this, error);
	        }
	    };
	    AsyncSubject.prototype.complete = function () {
	        this.hasCompleted = true;
	        if (this.hasNext) {
	            _super.prototype.next.call(this, this.value);
	        }
	        _super.prototype.complete.call(this);
	    };
	    return AsyncSubject;
	}(Subject_1.Subject);
	exports.AsyncSubject = AsyncSubject;
	//# sourceMappingURL=AsyncSubject.js.map

/***/ },
/* 76 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", { value: true });
	var AsapAction_1 = __webpack_require__(77);
	var AsapScheduler_1 = __webpack_require__(79);
	exports.asap = new AsapScheduler_1.AsapScheduler(AsapAction_1.AsapAction);
	//# sourceMappingURL=asap.js.map

/***/ },
/* 77 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var __extends = undefined && undefined.__extends || function () {
	    var _extendStatics = function extendStatics(d, b) {
	        _extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function (d, b) {
	            d.__proto__ = b;
	        } || function (d, b) {
	            for (var p in b) {
	                if (b.hasOwnProperty(p)) d[p] = b[p];
	            }
	        };
	        return _extendStatics(d, b);
	    };
	    return function (d, b) {
	        _extendStatics(d, b);
	        function __() {
	            this.constructor = d;
	        }
	        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	    };
	}();
	Object.defineProperty(exports, "__esModule", { value: true });
	var Immediate_1 = __webpack_require__(78);
	var AsyncAction_1 = __webpack_require__(61);
	var AsapAction = function (_super) {
	    __extends(AsapAction, _super);
	    function AsapAction(scheduler, work) {
	        var _this = _super.call(this, scheduler, work) || this;
	        _this.scheduler = scheduler;
	        _this.work = work;
	        return _this;
	    }
	    AsapAction.prototype.requestAsyncId = function (scheduler, id, delay) {
	        if (delay === void 0) {
	            delay = 0;
	        }
	        if (delay !== null && delay > 0) {
	            return _super.prototype.requestAsyncId.call(this, scheduler, id, delay);
	        }
	        scheduler.actions.push(this);
	        return scheduler.scheduled || (scheduler.scheduled = Immediate_1.Immediate.setImmediate(scheduler.flush.bind(scheduler, null)));
	    };
	    AsapAction.prototype.recycleAsyncId = function (scheduler, id, delay) {
	        if (delay === void 0) {
	            delay = 0;
	        }
	        if (delay !== null && delay > 0 || delay === null && this.delay > 0) {
	            return _super.prototype.recycleAsyncId.call(this, scheduler, id, delay);
	        }
	        if (scheduler.actions.length === 0) {
	            Immediate_1.Immediate.clearImmediate(id);
	            scheduler.scheduled = undefined;
	        }
	        return undefined;
	    };
	    return AsapAction;
	}(AsyncAction_1.AsyncAction);
	exports.AsapAction = AsapAction;
	//# sourceMappingURL=AsapAction.js.map

/***/ },
/* 78 */
/***/ function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", { value: true });
	var nextHandle = 1;
	var tasksByHandle = {};
	function runIfPresent(handle) {
	    var cb = tasksByHandle[handle];
	    if (cb) {
	        cb();
	    }
	}
	exports.Immediate = {
	    setImmediate: function setImmediate(cb) {
	        var handle = nextHandle++;
	        tasksByHandle[handle] = cb;
	        Promise.resolve().then(function () {
	            return runIfPresent(handle);
	        });
	        return handle;
	    },
	    clearImmediate: function clearImmediate(handle) {
	        delete tasksByHandle[handle];
	    }
	};
	//# sourceMappingURL=Immediate.js.map

/***/ },
/* 79 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var __extends = undefined && undefined.__extends || function () {
	    var _extendStatics = function extendStatics(d, b) {
	        _extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function (d, b) {
	            d.__proto__ = b;
	        } || function (d, b) {
	            for (var p in b) {
	                if (b.hasOwnProperty(p)) d[p] = b[p];
	            }
	        };
	        return _extendStatics(d, b);
	    };
	    return function (d, b) {
	        _extendStatics(d, b);
	        function __() {
	            this.constructor = d;
	        }
	        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	    };
	}();
	Object.defineProperty(exports, "__esModule", { value: true });
	var AsyncScheduler_1 = __webpack_require__(64);
	var AsapScheduler = function (_super) {
	    __extends(AsapScheduler, _super);
	    function AsapScheduler() {
	        return _super !== null && _super.apply(this, arguments) || this;
	    }
	    AsapScheduler.prototype.flush = function (action) {
	        this.active = true;
	        this.scheduled = undefined;
	        var actions = this.actions;
	        var error;
	        var index = -1;
	        var count = actions.length;
	        action = action || actions.shift();
	        do {
	            if (error = action.execute(action.state, action.delay)) {
	                break;
	            }
	        } while (++index < count && (action = actions.shift()));
	        this.active = false;
	        if (error) {
	            while (++index < count && (action = actions.shift())) {
	                action.unsubscribe();
	            }
	            throw error;
	        }
	    };
	    return AsapScheduler;
	}(AsyncScheduler_1.AsyncScheduler);
	exports.AsapScheduler = AsapScheduler;
	//# sourceMappingURL=AsapScheduler.js.map

/***/ },
/* 80 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", { value: true });
	var AsyncAction_1 = __webpack_require__(61);
	var AsyncScheduler_1 = __webpack_require__(64);
	exports.async = new AsyncScheduler_1.AsyncScheduler(AsyncAction_1.AsyncAction);
	//# sourceMappingURL=async.js.map

/***/ },
/* 81 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", { value: true });
	var AnimationFrameAction_1 = __webpack_require__(82);
	var AnimationFrameScheduler_1 = __webpack_require__(83);
	exports.animationFrame = new AnimationFrameScheduler_1.AnimationFrameScheduler(AnimationFrameAction_1.AnimationFrameAction);
	//# sourceMappingURL=animationFrame.js.map

/***/ },
/* 82 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var __extends = undefined && undefined.__extends || function () {
	    var _extendStatics = function extendStatics(d, b) {
	        _extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function (d, b) {
	            d.__proto__ = b;
	        } || function (d, b) {
	            for (var p in b) {
	                if (b.hasOwnProperty(p)) d[p] = b[p];
	            }
	        };
	        return _extendStatics(d, b);
	    };
	    return function (d, b) {
	        _extendStatics(d, b);
	        function __() {
	            this.constructor = d;
	        }
	        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	    };
	}();
	Object.defineProperty(exports, "__esModule", { value: true });
	var AsyncAction_1 = __webpack_require__(61);
	var AnimationFrameAction = function (_super) {
	    __extends(AnimationFrameAction, _super);
	    function AnimationFrameAction(scheduler, work) {
	        var _this = _super.call(this, scheduler, work) || this;
	        _this.scheduler = scheduler;
	        _this.work = work;
	        return _this;
	    }
	    AnimationFrameAction.prototype.requestAsyncId = function (scheduler, id, delay) {
	        if (delay === void 0) {
	            delay = 0;
	        }
	        if (delay !== null && delay > 0) {
	            return _super.prototype.requestAsyncId.call(this, scheduler, id, delay);
	        }
	        scheduler.actions.push(this);
	        return scheduler.scheduled || (scheduler.scheduled = requestAnimationFrame(function () {
	            return scheduler.flush(null);
	        }));
	    };
	    AnimationFrameAction.prototype.recycleAsyncId = function (scheduler, id, delay) {
	        if (delay === void 0) {
	            delay = 0;
	        }
	        if (delay !== null && delay > 0 || delay === null && this.delay > 0) {
	            return _super.prototype.recycleAsyncId.call(this, scheduler, id, delay);
	        }
	        if (scheduler.actions.length === 0) {
	            cancelAnimationFrame(id);
	            scheduler.scheduled = undefined;
	        }
	        return undefined;
	    };
	    return AnimationFrameAction;
	}(AsyncAction_1.AsyncAction);
	exports.AnimationFrameAction = AnimationFrameAction;
	//# sourceMappingURL=AnimationFrameAction.js.map

/***/ },
/* 83 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var __extends = undefined && undefined.__extends || function () {
	    var _extendStatics = function extendStatics(d, b) {
	        _extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function (d, b) {
	            d.__proto__ = b;
	        } || function (d, b) {
	            for (var p in b) {
	                if (b.hasOwnProperty(p)) d[p] = b[p];
	            }
	        };
	        return _extendStatics(d, b);
	    };
	    return function (d, b) {
	        _extendStatics(d, b);
	        function __() {
	            this.constructor = d;
	        }
	        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	    };
	}();
	Object.defineProperty(exports, "__esModule", { value: true });
	var AsyncScheduler_1 = __webpack_require__(64);
	var AnimationFrameScheduler = function (_super) {
	    __extends(AnimationFrameScheduler, _super);
	    function AnimationFrameScheduler() {
	        return _super !== null && _super.apply(this, arguments) || this;
	    }
	    AnimationFrameScheduler.prototype.flush = function (action) {
	        this.active = true;
	        this.scheduled = undefined;
	        var actions = this.actions;
	        var error;
	        var index = -1;
	        var count = actions.length;
	        action = action || actions.shift();
	        do {
	            if (error = action.execute(action.state, action.delay)) {
	                break;
	            }
	        } while (++index < count && (action = actions.shift()));
	        this.active = false;
	        if (error) {
	            while (++index < count && (action = actions.shift())) {
	                action.unsubscribe();
	            }
	            throw error;
	        }
	    };
	    return AnimationFrameScheduler;
	}(AsyncScheduler_1.AsyncScheduler);
	exports.AnimationFrameScheduler = AnimationFrameScheduler;
	//# sourceMappingURL=AnimationFrameScheduler.js.map

/***/ },
/* 84 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var __extends = undefined && undefined.__extends || function () {
	    var _extendStatics = function extendStatics(d, b) {
	        _extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function (d, b) {
	            d.__proto__ = b;
	        } || function (d, b) {
	            for (var p in b) {
	                if (b.hasOwnProperty(p)) d[p] = b[p];
	            }
	        };
	        return _extendStatics(d, b);
	    };
	    return function (d, b) {
	        _extendStatics(d, b);
	        function __() {
	            this.constructor = d;
	        }
	        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	    };
	}();
	Object.defineProperty(exports, "__esModule", { value: true });
	var AsyncAction_1 = __webpack_require__(61);
	var AsyncScheduler_1 = __webpack_require__(64);
	var VirtualTimeScheduler = function (_super) {
	    __extends(VirtualTimeScheduler, _super);
	    function VirtualTimeScheduler(SchedulerAction, maxFrames) {
	        if (SchedulerAction === void 0) {
	            SchedulerAction = VirtualAction;
	        }
	        if (maxFrames === void 0) {
	            maxFrames = Number.POSITIVE_INFINITY;
	        }
	        var _this = _super.call(this, SchedulerAction, function () {
	            return _this.frame;
	        }) || this;
	        _this.maxFrames = maxFrames;
	        _this.frame = 0;
	        _this.index = -1;
	        return _this;
	    }
	    VirtualTimeScheduler.prototype.flush = function () {
	        var _a = this,
	            actions = _a.actions,
	            maxFrames = _a.maxFrames;
	        var error, action;
	        while ((action = actions[0]) && action.delay <= maxFrames) {
	            actions.shift();
	            this.frame = action.delay;
	            if (error = action.execute(action.state, action.delay)) {
	                break;
	            }
	        }
	        if (error) {
	            while (action = actions.shift()) {
	                action.unsubscribe();
	            }
	            throw error;
	        }
	    };
	    VirtualTimeScheduler.frameTimeFactor = 10;
	    return VirtualTimeScheduler;
	}(AsyncScheduler_1.AsyncScheduler);
	exports.VirtualTimeScheduler = VirtualTimeScheduler;
	var VirtualAction = function (_super) {
	    __extends(VirtualAction, _super);
	    function VirtualAction(scheduler, work, index) {
	        if (index === void 0) {
	            index = scheduler.index += 1;
	        }
	        var _this = _super.call(this, scheduler, work) || this;
	        _this.scheduler = scheduler;
	        _this.work = work;
	        _this.index = index;
	        _this.active = true;
	        _this.index = scheduler.index = index;
	        return _this;
	    }
	    VirtualAction.prototype.schedule = function (state, delay) {
	        if (delay === void 0) {
	            delay = 0;
	        }
	        if (!this.id) {
	            return _super.prototype.schedule.call(this, state, delay);
	        }
	        this.active = false;
	        var action = new VirtualAction(this.scheduler, this.work);
	        this.add(action);
	        return action.schedule(state, delay);
	    };
	    VirtualAction.prototype.requestAsyncId = function (scheduler, id, delay) {
	        if (delay === void 0) {
	            delay = 0;
	        }
	        this.delay = scheduler.frame + delay;
	        var actions = scheduler.actions;
	        actions.push(this);
	        actions.sort(VirtualAction.sortActions);
	        return true;
	    };
	    VirtualAction.prototype.recycleAsyncId = function (scheduler, id, delay) {
	        if (delay === void 0) {
	            delay = 0;
	        }
	        return undefined;
	    };
	    VirtualAction.prototype._execute = function (state, delay) {
	        if (this.active === true) {
	            return _super.prototype._execute.call(this, state, delay);
	        }
	    };
	    VirtualAction.sortActions = function (a, b) {
	        if (a.delay === b.delay) {
	            if (a.index === b.index) {
	                return 0;
	            } else if (a.index > b.index) {
	                return 1;
	            } else {
	                return -1;
	            }
	        } else if (a.delay > b.delay) {
	            return 1;
	        } else {
	            return -1;
	        }
	    };
	    return VirtualAction;
	}(AsyncAction_1.AsyncAction);
	exports.VirtualAction = VirtualAction;
	//# sourceMappingURL=VirtualTimeScheduler.js.map

/***/ },
/* 85 */
/***/ function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", { value: true });
	function identity(x) {
	    return x;
	}
	exports.identity = identity;
	//# sourceMappingURL=identity.js.map

/***/ },
/* 86 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", { value: true });
	var Observable_1 = __webpack_require__(35);
	function isObservable(obj) {
	    return !!obj && (obj instanceof Observable_1.Observable || typeof obj.lift === 'function' && typeof obj.subscribe === 'function');
	}
	exports.isObservable = isObservable;
	//# sourceMappingURL=isObservable.js.map

/***/ },
/* 87 */
/***/ function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", { value: true });
	function ArgumentOutOfRangeErrorImpl() {
	    Error.call(this);
	    this.message = 'argument out of range';
	    this.name = 'ArgumentOutOfRangeError';
	    return this;
	}
	ArgumentOutOfRangeErrorImpl.prototype = Object.create(Error.prototype);
	exports.ArgumentOutOfRangeError = ArgumentOutOfRangeErrorImpl;
	//# sourceMappingURL=ArgumentOutOfRangeError.js.map

/***/ },
/* 88 */
/***/ function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", { value: true });
	function EmptyErrorImpl() {
	    Error.call(this);
	    this.message = 'no elements in sequence';
	    this.name = 'EmptyError';
	    return this;
	}
	EmptyErrorImpl.prototype = Object.create(Error.prototype);
	exports.EmptyError = EmptyErrorImpl;
	//# sourceMappingURL=EmptyError.js.map

/***/ },
/* 89 */
/***/ function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", { value: true });
	function TimeoutErrorImpl() {
	    Error.call(this);
	    this.message = 'Timeout has occurred';
	    this.name = 'TimeoutError';
	    return this;
	}
	TimeoutErrorImpl.prototype = Object.create(Error.prototype);
	exports.TimeoutError = TimeoutErrorImpl;
	//# sourceMappingURL=TimeoutError.js.map

/***/ },
/* 90 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", { value: true });
	var Observable_1 = __webpack_require__(35);
	var AsyncSubject_1 = __webpack_require__(75);
	var map_1 = __webpack_require__(91);
	var canReportError_1 = __webpack_require__(36);
	var isArray_1 = __webpack_require__(43);
	var isScheduler_1 = __webpack_require__(70);
	function bindCallback(callbackFunc, resultSelector, scheduler) {
	    if (resultSelector) {
	        if (isScheduler_1.isScheduler(resultSelector)) {
	            scheduler = resultSelector;
	        } else {
	            return function () {
	                var args = [];
	                for (var _i = 0; _i < arguments.length; _i++) {
	                    args[_i] = arguments[_i];
	                }
	                return bindCallback(callbackFunc, scheduler).apply(void 0, args).pipe(map_1.map(function (args) {
	                    return isArray_1.isArray(args) ? resultSelector.apply(void 0, args) : resultSelector(args);
	                }));
	            };
	        }
	    }
	    return function () {
	        var args = [];
	        for (var _i = 0; _i < arguments.length; _i++) {
	            args[_i] = arguments[_i];
	        }
	        var context = this;
	        var subject;
	        var params = {
	            context: context,
	            subject: subject,
	            callbackFunc: callbackFunc,
	            scheduler: scheduler
	        };
	        return new Observable_1.Observable(function (subscriber) {
	            if (!scheduler) {
	                if (!subject) {
	                    subject = new AsyncSubject_1.AsyncSubject();
	                    var handler = function handler() {
	                        var innerArgs = [];
	                        for (var _i = 0; _i < arguments.length; _i++) {
	                            innerArgs[_i] = arguments[_i];
	                        }
	                        subject.next(innerArgs.length <= 1 ? innerArgs[0] : innerArgs);
	                        subject.complete();
	                    };
	                    try {
	                        callbackFunc.apply(context, args.concat([handler]));
	                    } catch (err) {
	                        if (canReportError_1.canReportError(subject)) {
	                            subject.error(err);
	                        } else {
	                            console.warn(err);
	                        }
	                    }
	                }
	                return subject.subscribe(subscriber);
	            } else {
	                var state = {
	                    args: args, subscriber: subscriber, params: params
	                };
	                return scheduler.schedule(dispatch, 0, state);
	            }
	        });
	    };
	}
	exports.bindCallback = bindCallback;
	function dispatch(state) {
	    var _this = this;
	    var self = this;
	    var args = state.args,
	        subscriber = state.subscriber,
	        params = state.params;
	    var callbackFunc = params.callbackFunc,
	        context = params.context,
	        scheduler = params.scheduler;
	    var subject = params.subject;
	    if (!subject) {
	        subject = params.subject = new AsyncSubject_1.AsyncSubject();
	        var handler = function handler() {
	            var innerArgs = [];
	            for (var _i = 0; _i < arguments.length; _i++) {
	                innerArgs[_i] = arguments[_i];
	            }
	            var value = innerArgs.length <= 1 ? innerArgs[0] : innerArgs;
	            _this.add(scheduler.schedule(dispatchNext, 0, { value: value, subject: subject }));
	        };
	        try {
	            callbackFunc.apply(context, args.concat([handler]));
	        } catch (err) {
	            subject.error(err);
	        }
	    }
	    this.add(subject.subscribe(subscriber));
	}
	function dispatchNext(state) {
	    var value = state.value,
	        subject = state.subject;
	    subject.next(value);
	    subject.complete();
	}
	function dispatchError(state) {
	    var err = state.err,
	        subject = state.subject;
	    subject.error(err);
	}
	//# sourceMappingURL=bindCallback.js.map

/***/ },
/* 91 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var __extends = undefined && undefined.__extends || function () {
	    var _extendStatics = function extendStatics(d, b) {
	        _extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function (d, b) {
	            d.__proto__ = b;
	        } || function (d, b) {
	            for (var p in b) {
	                if (b.hasOwnProperty(p)) d[p] = b[p];
	            }
	        };
	        return _extendStatics(d, b);
	    };
	    return function (d, b) {
	        _extendStatics(d, b);
	        function __() {
	            this.constructor = d;
	        }
	        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	    };
	}();
	Object.defineProperty(exports, "__esModule", { value: true });
	var Subscriber_1 = __webpack_require__(37);
	function map(project, thisArg) {
	    return function mapOperation(source) {
	        if (typeof project !== 'function') {
	            throw new TypeError('argument is not a function. Are you looking for `mapTo()`?');
	        }
	        return source.lift(new MapOperator(project, thisArg));
	    };
	}
	exports.map = map;
	var MapOperator = function () {
	    function MapOperator(project, thisArg) {
	        this.project = project;
	        this.thisArg = thisArg;
	    }
	    MapOperator.prototype.call = function (subscriber, source) {
	        return source.subscribe(new MapSubscriber(subscriber, this.project, this.thisArg));
	    };
	    return MapOperator;
	}();
	exports.MapOperator = MapOperator;
	var MapSubscriber = function (_super) {
	    __extends(MapSubscriber, _super);
	    function MapSubscriber(destination, project, thisArg) {
	        var _this = _super.call(this, destination) || this;
	        _this.project = project;
	        _this.count = 0;
	        _this.thisArg = thisArg || _this;
	        return _this;
	    }
	    MapSubscriber.prototype._next = function (value) {
	        var result;
	        try {
	            result = this.project.call(this.thisArg, value, this.count++);
	        } catch (err) {
	            this.destination.error(err);
	            return;
	        }
	        this.destination.next(result);
	    };
	    return MapSubscriber;
	}(Subscriber_1.Subscriber);
	//# sourceMappingURL=map.js.map

/***/ },
/* 92 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", { value: true });
	var Observable_1 = __webpack_require__(35);
	var AsyncSubject_1 = __webpack_require__(75);
	var map_1 = __webpack_require__(91);
	var canReportError_1 = __webpack_require__(36);
	var isScheduler_1 = __webpack_require__(70);
	var isArray_1 = __webpack_require__(43);
	function bindNodeCallback(callbackFunc, resultSelector, scheduler) {
	    if (resultSelector) {
	        if (isScheduler_1.isScheduler(resultSelector)) {
	            scheduler = resultSelector;
	        } else {
	            return function () {
	                var args = [];
	                for (var _i = 0; _i < arguments.length; _i++) {
	                    args[_i] = arguments[_i];
	                }
	                return bindNodeCallback(callbackFunc, scheduler).apply(void 0, args).pipe(map_1.map(function (args) {
	                    return isArray_1.isArray(args) ? resultSelector.apply(void 0, args) : resultSelector(args);
	                }));
	            };
	        }
	    }
	    return function () {
	        var args = [];
	        for (var _i = 0; _i < arguments.length; _i++) {
	            args[_i] = arguments[_i];
	        }
	        var params = {
	            subject: undefined,
	            args: args,
	            callbackFunc: callbackFunc,
	            scheduler: scheduler,
	            context: this
	        };
	        return new Observable_1.Observable(function (subscriber) {
	            var context = params.context;
	            var subject = params.subject;
	            if (!scheduler) {
	                if (!subject) {
	                    subject = params.subject = new AsyncSubject_1.AsyncSubject();
	                    var handler = function handler() {
	                        var innerArgs = [];
	                        for (var _i = 0; _i < arguments.length; _i++) {
	                            innerArgs[_i] = arguments[_i];
	                        }
	                        var err = innerArgs.shift();
	                        if (err) {
	                            subject.error(err);
	                            return;
	                        }
	                        subject.next(innerArgs.length <= 1 ? innerArgs[0] : innerArgs);
	                        subject.complete();
	                    };
	                    try {
	                        callbackFunc.apply(context, args.concat([handler]));
	                    } catch (err) {
	                        if (canReportError_1.canReportError(subject)) {
	                            subject.error(err);
	                        } else {
	                            console.warn(err);
	                        }
	                    }
	                }
	                return subject.subscribe(subscriber);
	            } else {
	                return scheduler.schedule(dispatch, 0, { params: params, subscriber: subscriber, context: context });
	            }
	        });
	    };
	}
	exports.bindNodeCallback = bindNodeCallback;
	function dispatch(state) {
	    var _this = this;
	    var params = state.params,
	        subscriber = state.subscriber,
	        context = state.context;
	    var callbackFunc = params.callbackFunc,
	        args = params.args,
	        scheduler = params.scheduler;
	    var subject = params.subject;
	    if (!subject) {
	        subject = params.subject = new AsyncSubject_1.AsyncSubject();
	        var handler = function handler() {
	            var innerArgs = [];
	            for (var _i = 0; _i < arguments.length; _i++) {
	                innerArgs[_i] = arguments[_i];
	            }
	            var err = innerArgs.shift();
	            if (err) {
	                _this.add(scheduler.schedule(dispatchError, 0, { err: err, subject: subject }));
	            } else {
	                var value = innerArgs.length <= 1 ? innerArgs[0] : innerArgs;
	                _this.add(scheduler.schedule(dispatchNext, 0, { value: value, subject: subject }));
	            }
	        };
	        try {
	            callbackFunc.apply(context, args.concat([handler]));
	        } catch (err) {
	            this.add(scheduler.schedule(dispatchError, 0, { err: err, subject: subject }));
	        }
	    }
	    this.add(subject.subscribe(subscriber));
	}
	function dispatchNext(arg) {
	    var value = arg.value,
	        subject = arg.subject;
	    subject.next(value);
	    subject.complete();
	}
	function dispatchError(arg) {
	    var err = arg.err,
	        subject = arg.subject;
	    subject.error(err);
	}
	//# sourceMappingURL=bindNodeCallback.js.map

/***/ },
/* 93 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var __extends = undefined && undefined.__extends || function () {
	    var _extendStatics = function extendStatics(d, b) {
	        _extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function (d, b) {
	            d.__proto__ = b;
	        } || function (d, b) {
	            for (var p in b) {
	                if (b.hasOwnProperty(p)) d[p] = b[p];
	            }
	        };
	        return _extendStatics(d, b);
	    };
	    return function (d, b) {
	        _extendStatics(d, b);
	        function __() {
	            this.constructor = d;
	        }
	        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	    };
	}();
	Object.defineProperty(exports, "__esModule", { value: true });
	var isScheduler_1 = __webpack_require__(70);
	var isArray_1 = __webpack_require__(43);
	var OuterSubscriber_1 = __webpack_require__(94);
	var subscribeToResult_1 = __webpack_require__(95);
	var fromArray_1 = __webpack_require__(71);
	var NONE = {};
	function combineLatest() {
	    var observables = [];
	    for (var _i = 0; _i < arguments.length; _i++) {
	        observables[_i] = arguments[_i];
	    }
	    var resultSelector = null;
	    var scheduler = null;
	    if (isScheduler_1.isScheduler(observables[observables.length - 1])) {
	        scheduler = observables.pop();
	    }
	    if (typeof observables[observables.length - 1] === 'function') {
	        resultSelector = observables.pop();
	    }
	    if (observables.length === 1 && isArray_1.isArray(observables[0])) {
	        observables = observables[0];
	    }
	    return fromArray_1.fromArray(observables, scheduler).lift(new CombineLatestOperator(resultSelector));
	}
	exports.combineLatest = combineLatest;
	var CombineLatestOperator = function () {
	    function CombineLatestOperator(resultSelector) {
	        this.resultSelector = resultSelector;
	    }
	    CombineLatestOperator.prototype.call = function (subscriber, source) {
	        return source.subscribe(new CombineLatestSubscriber(subscriber, this.resultSelector));
	    };
	    return CombineLatestOperator;
	}();
	exports.CombineLatestOperator = CombineLatestOperator;
	var CombineLatestSubscriber = function (_super) {
	    __extends(CombineLatestSubscriber, _super);
	    function CombineLatestSubscriber(destination, resultSelector) {
	        var _this = _super.call(this, destination) || this;
	        _this.resultSelector = resultSelector;
	        _this.active = 0;
	        _this.values = [];
	        _this.observables = [];
	        return _this;
	    }
	    CombineLatestSubscriber.prototype._next = function (observable) {
	        this.values.push(NONE);
	        this.observables.push(observable);
	    };
	    CombineLatestSubscriber.prototype._complete = function () {
	        var observables = this.observables;
	        var len = observables.length;
	        if (len === 0) {
	            this.destination.complete();
	        } else {
	            this.active = len;
	            this.toRespond = len;
	            for (var i = 0; i < len; i++) {
	                var observable = observables[i];
	                this.add(subscribeToResult_1.subscribeToResult(this, observable, observable, i));
	            }
	        }
	    };
	    CombineLatestSubscriber.prototype.notifyComplete = function (unused) {
	        if ((this.active -= 1) === 0) {
	            this.destination.complete();
	        }
	    };
	    CombineLatestSubscriber.prototype.notifyNext = function (outerValue, innerValue, outerIndex, innerIndex, innerSub) {
	        var values = this.values;
	        var oldVal = values[outerIndex];
	        var toRespond = !this.toRespond ? 0 : oldVal === NONE ? --this.toRespond : this.toRespond;
	        values[outerIndex] = innerValue;
	        if (toRespond === 0) {
	            if (this.resultSelector) {
	                this._tryResultSelector(values);
	            } else {
	                this.destination.next(values.slice());
	            }
	        }
	    };
	    CombineLatestSubscriber.prototype._tryResultSelector = function (values) {
	        var result;
	        try {
	            result = this.resultSelector.apply(this, values);
	        } catch (err) {
	            this.destination.error(err);
	            return;
	        }
	        this.destination.next(result);
	    };
	    return CombineLatestSubscriber;
	}(OuterSubscriber_1.OuterSubscriber);
	exports.CombineLatestSubscriber = CombineLatestSubscriber;
	//# sourceMappingURL=combineLatest.js.map

/***/ },
/* 94 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var __extends = undefined && undefined.__extends || function () {
	    var _extendStatics = function extendStatics(d, b) {
	        _extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function (d, b) {
	            d.__proto__ = b;
	        } || function (d, b) {
	            for (var p in b) {
	                if (b.hasOwnProperty(p)) d[p] = b[p];
	            }
	        };
	        return _extendStatics(d, b);
	    };
	    return function (d, b) {
	        _extendStatics(d, b);
	        function __() {
	            this.constructor = d;
	        }
	        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	    };
	}();
	Object.defineProperty(exports, "__esModule", { value: true });
	var Subscriber_1 = __webpack_require__(37);
	var OuterSubscriber = function (_super) {
	    __extends(OuterSubscriber, _super);
	    function OuterSubscriber() {
	        return _super !== null && _super.apply(this, arguments) || this;
	    }
	    OuterSubscriber.prototype.notifyNext = function (outerValue, innerValue, outerIndex, innerIndex, innerSub) {
	        this.destination.next(innerValue);
	    };
	    OuterSubscriber.prototype.notifyError = function (error, innerSub) {
	        this.destination.error(error);
	    };
	    OuterSubscriber.prototype.notifyComplete = function (innerSub) {
	        this.destination.complete();
	    };
	    return OuterSubscriber;
	}(Subscriber_1.Subscriber);
	exports.OuterSubscriber = OuterSubscriber;
	//# sourceMappingURL=OuterSubscriber.js.map

/***/ },
/* 95 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", { value: true });
	var InnerSubscriber_1 = __webpack_require__(96);
	var subscribeTo_1 = __webpack_require__(97);
	var Observable_1 = __webpack_require__(35);
	function subscribeToResult(outerSubscriber, result, outerValue, outerIndex, destination) {
	    if (destination === void 0) {
	        destination = new InnerSubscriber_1.InnerSubscriber(outerSubscriber, outerValue, outerIndex);
	    }
	    if (destination.closed) {
	        return undefined;
	    }
	    if (result instanceof Observable_1.Observable) {
	        return result.subscribe(destination);
	    }
	    return subscribeTo_1.subscribeTo(result)(destination);
	}
	exports.subscribeToResult = subscribeToResult;
	//# sourceMappingURL=subscribeToResult.js.map

/***/ },
/* 96 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var __extends = undefined && undefined.__extends || function () {
	    var _extendStatics = function extendStatics(d, b) {
	        _extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function (d, b) {
	            d.__proto__ = b;
	        } || function (d, b) {
	            for (var p in b) {
	                if (b.hasOwnProperty(p)) d[p] = b[p];
	            }
	        };
	        return _extendStatics(d, b);
	    };
	    return function (d, b) {
	        _extendStatics(d, b);
	        function __() {
	            this.constructor = d;
	        }
	        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	    };
	}();
	Object.defineProperty(exports, "__esModule", { value: true });
	var Subscriber_1 = __webpack_require__(37);
	var InnerSubscriber = function (_super) {
	    __extends(InnerSubscriber, _super);
	    function InnerSubscriber(parent, outerValue, outerIndex) {
	        var _this = _super.call(this) || this;
	        _this.parent = parent;
	        _this.outerValue = outerValue;
	        _this.outerIndex = outerIndex;
	        _this.index = 0;
	        return _this;
	    }
	    InnerSubscriber.prototype._next = function (value) {
	        this.parent.notifyNext(this.outerValue, value, this.outerIndex, this.index++, this);
	    };
	    InnerSubscriber.prototype._error = function (error) {
	        this.parent.notifyError(error, this);
	        this.unsubscribe();
	    };
	    InnerSubscriber.prototype._complete = function () {
	        this.parent.notifyComplete(this);
	        this.unsubscribe();
	    };
	    return InnerSubscriber;
	}(Subscriber_1.Subscriber);
	exports.InnerSubscriber = InnerSubscriber;
	//# sourceMappingURL=InnerSubscriber.js.map

/***/ },
/* 97 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", { value: true });
	var subscribeToArray_1 = __webpack_require__(72);
	var subscribeToPromise_1 = __webpack_require__(98);
	var subscribeToIterable_1 = __webpack_require__(99);
	var subscribeToObservable_1 = __webpack_require__(101);
	var isArrayLike_1 = __webpack_require__(102);
	var isPromise_1 = __webpack_require__(103);
	var isObject_1 = __webpack_require__(44);
	var iterator_1 = __webpack_require__(100);
	var observable_1 = __webpack_require__(48);
	exports.subscribeTo = function (result) {
	    if (!!result && typeof result[observable_1.observable] === 'function') {
	        return subscribeToObservable_1.subscribeToObservable(result);
	    } else if (isArrayLike_1.isArrayLike(result)) {
	        return subscribeToArray_1.subscribeToArray(result);
	    } else if (isPromise_1.isPromise(result)) {
	        return subscribeToPromise_1.subscribeToPromise(result);
	    } else if (!!result && typeof result[iterator_1.iterator] === 'function') {
	        return subscribeToIterable_1.subscribeToIterable(result);
	    } else {
	        var value = isObject_1.isObject(result) ? 'an invalid object' : "'" + result + "'";
	        var msg = "You provided " + value + " where a stream was expected." + ' You can provide an Observable, Promise, Array, or Iterable.';
	        throw new TypeError(msg);
	    }
	};
	//# sourceMappingURL=subscribeTo.js.map

/***/ },
/* 98 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", { value: true });
	var hostReportError_1 = __webpack_require__(41);
	exports.subscribeToPromise = function (promise) {
	    return function (subscriber) {
	        promise.then(function (value) {
	            if (!subscriber.closed) {
	                subscriber.next(value);
	                subscriber.complete();
	            }
	        }, function (err) {
	            return subscriber.error(err);
	        }).then(null, hostReportError_1.hostReportError);
	        return subscriber;
	    };
	};
	//# sourceMappingURL=subscribeToPromise.js.map

/***/ },
/* 99 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", { value: true });
	var iterator_1 = __webpack_require__(100);
	exports.subscribeToIterable = function (iterable) {
	    return function (subscriber) {
	        var iterator = iterable[iterator_1.iterator]();
	        do {
	            var item = iterator.next();
	            if (item.done) {
	                subscriber.complete();
	                break;
	            }
	            subscriber.next(item.value);
	            if (subscriber.closed) {
	                break;
	            }
	        } while (true);
	        if (typeof iterator.return === 'function') {
	            subscriber.add(function () {
	                if (iterator.return) {
	                    iterator.return();
	                }
	            });
	        }
	        return subscriber;
	    };
	};
	//# sourceMappingURL=subscribeToIterable.js.map

/***/ },
/* 100 */
/***/ function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", { value: true });
	function getSymbolIterator() {
	    if (typeof Symbol !== 'function' || !Symbol.iterator) {
	        return '@@iterator';
	    }
	    return Symbol.iterator;
	}
	exports.getSymbolIterator = getSymbolIterator;
	exports.iterator = getSymbolIterator();
	exports.$$iterator = exports.iterator;
	//# sourceMappingURL=iterator.js.map

/***/ },
/* 101 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", { value: true });
	var observable_1 = __webpack_require__(48);
	exports.subscribeToObservable = function (obj) {
	    return function (subscriber) {
	        var obs = obj[observable_1.observable]();
	        if (typeof obs.subscribe !== 'function') {
	            throw new TypeError('Provided object does not correctly implement Symbol.observable');
	        } else {
	            return obs.subscribe(subscriber);
	        }
	    };
	};
	//# sourceMappingURL=subscribeToObservable.js.map

/***/ },
/* 102 */
/***/ function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", { value: true });
	exports.isArrayLike = function (x) {
	  return x && typeof x.length === 'number' && typeof x !== 'function';
	};
	//# sourceMappingURL=isArrayLike.js.map

/***/ },
/* 103 */
/***/ function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", { value: true });
	function isPromise(value) {
	    return !!value && typeof value.subscribe !== 'function' && typeof value.then === 'function';
	}
	exports.isPromise = isPromise;
	//# sourceMappingURL=isPromise.js.map

/***/ },
/* 104 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", { value: true });
	var of_1 = __webpack_require__(69);
	var concatAll_1 = __webpack_require__(105);
	function concat() {
	    var observables = [];
	    for (var _i = 0; _i < arguments.length; _i++) {
	        observables[_i] = arguments[_i];
	    }
	    return concatAll_1.concatAll()(of_1.of.apply(void 0, observables));
	}
	exports.concat = concat;
	//# sourceMappingURL=concat.js.map

/***/ },
/* 105 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", { value: true });
	var mergeAll_1 = __webpack_require__(106);
	function concatAll() {
	    return mergeAll_1.mergeAll(1);
	}
	exports.concatAll = concatAll;
	//# sourceMappingURL=concatAll.js.map

/***/ },
/* 106 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", { value: true });
	var mergeMap_1 = __webpack_require__(107);
	var identity_1 = __webpack_require__(85);
	function mergeAll(concurrent) {
	    if (concurrent === void 0) {
	        concurrent = Number.POSITIVE_INFINITY;
	    }
	    return mergeMap_1.mergeMap(identity_1.identity, concurrent);
	}
	exports.mergeAll = mergeAll;
	//# sourceMappingURL=mergeAll.js.map

/***/ },
/* 107 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var __extends = undefined && undefined.__extends || function () {
	    var _extendStatics = function extendStatics(d, b) {
	        _extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function (d, b) {
	            d.__proto__ = b;
	        } || function (d, b) {
	            for (var p in b) {
	                if (b.hasOwnProperty(p)) d[p] = b[p];
	            }
	        };
	        return _extendStatics(d, b);
	    };
	    return function (d, b) {
	        _extendStatics(d, b);
	        function __() {
	            this.constructor = d;
	        }
	        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	    };
	}();
	Object.defineProperty(exports, "__esModule", { value: true });
	var subscribeToResult_1 = __webpack_require__(95);
	var OuterSubscriber_1 = __webpack_require__(94);
	var InnerSubscriber_1 = __webpack_require__(96);
	var map_1 = __webpack_require__(91);
	var from_1 = __webpack_require__(108);
	function mergeMap(project, resultSelector, concurrent) {
	    if (concurrent === void 0) {
	        concurrent = Number.POSITIVE_INFINITY;
	    }
	    if (typeof resultSelector === 'function') {
	        return function (source) {
	            return source.pipe(mergeMap(function (a, i) {
	                return from_1.from(project(a, i)).pipe(map_1.map(function (b, ii) {
	                    return resultSelector(a, b, i, ii);
	                }));
	            }, concurrent));
	        };
	    } else if (typeof resultSelector === 'number') {
	        concurrent = resultSelector;
	    }
	    return function (source) {
	        return source.lift(new MergeMapOperator(project, concurrent));
	    };
	}
	exports.mergeMap = mergeMap;
	var MergeMapOperator = function () {
	    function MergeMapOperator(project, concurrent) {
	        if (concurrent === void 0) {
	            concurrent = Number.POSITIVE_INFINITY;
	        }
	        this.project = project;
	        this.concurrent = concurrent;
	    }
	    MergeMapOperator.prototype.call = function (observer, source) {
	        return source.subscribe(new MergeMapSubscriber(observer, this.project, this.concurrent));
	    };
	    return MergeMapOperator;
	}();
	exports.MergeMapOperator = MergeMapOperator;
	var MergeMapSubscriber = function (_super) {
	    __extends(MergeMapSubscriber, _super);
	    function MergeMapSubscriber(destination, project, concurrent) {
	        if (concurrent === void 0) {
	            concurrent = Number.POSITIVE_INFINITY;
	        }
	        var _this = _super.call(this, destination) || this;
	        _this.project = project;
	        _this.concurrent = concurrent;
	        _this.hasCompleted = false;
	        _this.buffer = [];
	        _this.active = 0;
	        _this.index = 0;
	        return _this;
	    }
	    MergeMapSubscriber.prototype._next = function (value) {
	        if (this.active < this.concurrent) {
	            this._tryNext(value);
	        } else {
	            this.buffer.push(value);
	        }
	    };
	    MergeMapSubscriber.prototype._tryNext = function (value) {
	        var result;
	        var index = this.index++;
	        try {
	            result = this.project(value, index);
	        } catch (err) {
	            this.destination.error(err);
	            return;
	        }
	        this.active++;
	        this._innerSub(result, value, index);
	    };
	    MergeMapSubscriber.prototype._innerSub = function (ish, value, index) {
	        var innerSubscriber = new InnerSubscriber_1.InnerSubscriber(this, undefined, undefined);
	        var destination = this.destination;
	        destination.add(innerSubscriber);
	        subscribeToResult_1.subscribeToResult(this, ish, value, index, innerSubscriber);
	    };
	    MergeMapSubscriber.prototype._complete = function () {
	        this.hasCompleted = true;
	        if (this.active === 0 && this.buffer.length === 0) {
	            this.destination.complete();
	        }
	        this.unsubscribe();
	    };
	    MergeMapSubscriber.prototype.notifyNext = function (outerValue, innerValue, outerIndex, innerIndex, innerSub) {
	        this.destination.next(innerValue);
	    };
	    MergeMapSubscriber.prototype.notifyComplete = function (innerSub) {
	        var buffer = this.buffer;
	        this.remove(innerSub);
	        this.active--;
	        if (buffer.length > 0) {
	            this._next(buffer.shift());
	        } else if (this.active === 0 && this.hasCompleted) {
	            this.destination.complete();
	        }
	    };
	    return MergeMapSubscriber;
	}(OuterSubscriber_1.OuterSubscriber);
	exports.MergeMapSubscriber = MergeMapSubscriber;
	//# sourceMappingURL=mergeMap.js.map

/***/ },
/* 108 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", { value: true });
	var Observable_1 = __webpack_require__(35);
	var subscribeTo_1 = __webpack_require__(97);
	var scheduled_1 = __webpack_require__(109);
	function from(input, scheduler) {
	    if (!scheduler) {
	        if (input instanceof Observable_1.Observable) {
	            return input;
	        }
	        return new Observable_1.Observable(subscribeTo_1.subscribeTo(input));
	    } else {
	        return scheduled_1.scheduled(input, scheduler);
	    }
	}
	exports.from = from;
	//# sourceMappingURL=from.js.map

/***/ },
/* 109 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

	Object.defineProperty(exports, "__esModule", { value: true });
	var scheduleObservable_1 = __webpack_require__(110);
	var schedulePromise_1 = __webpack_require__(111);
	var scheduleArray_1 = __webpack_require__(73);
	var scheduleIterable_1 = __webpack_require__(112);
	var isInteropObservable_1 = __webpack_require__(113);
	var isPromise_1 = __webpack_require__(103);
	var isArrayLike_1 = __webpack_require__(102);
	var isIterable_1 = __webpack_require__(114);
	function scheduled(input, scheduler) {
	    if (input != null) {
	        if (isInteropObservable_1.isInteropObservable(input)) {
	            return scheduleObservable_1.scheduleObservable(input, scheduler);
	        } else if (isPromise_1.isPromise(input)) {
	            return schedulePromise_1.schedulePromise(input, scheduler);
	        } else if (isArrayLike_1.isArrayLike(input)) {
	            return scheduleArray_1.scheduleArray(input, scheduler);
	        } else if (isIterable_1.isIterable(input) || typeof input === 'string') {
	            return scheduleIterable_1.scheduleIterable(input, scheduler);
	        }
	    }
	    throw new TypeError((input !== null && (typeof input === "undefined" ? "undefined" : _typeof(input)) || input) + ' is not observable');
	}
	exports.scheduled = scheduled;
	//# sourceMappingURL=scheduled.js.map

/***/ },
/* 110 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", { value: true });
	var Observable_1 = __webpack_require__(35);
	var Subscription_1 = __webpack_require__(42);
	var observable_1 = __webpack_require__(48);
	function scheduleObservable(input, scheduler) {
	    return new Observable_1.Observable(function (subscriber) {
	        var sub = new Subscription_1.Subscription();
	        sub.add(scheduler.schedule(function () {
	            var observable = input[observable_1.observable]();
	            sub.add(observable.subscribe({
	                next: function next(value) {
	                    sub.add(scheduler.schedule(function () {
	                        return subscriber.next(value);
	                    }));
	                },
	                error: function error(err) {
	                    sub.add(scheduler.schedule(function () {
	                        return subscriber.error(err);
	                    }));
	                },
	                complete: function complete() {
	                    sub.add(scheduler.schedule(function () {
	                        return subscriber.complete();
	                    }));
	                }
	            }));
	        }));
	        return sub;
	    });
	}
	exports.scheduleObservable = scheduleObservable;
	//# sourceMappingURL=scheduleObservable.js.map

/***/ },
/* 111 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", { value: true });
	var Observable_1 = __webpack_require__(35);
	var Subscription_1 = __webpack_require__(42);
	function schedulePromise(input, scheduler) {
	    return new Observable_1.Observable(function (subscriber) {
	        var sub = new Subscription_1.Subscription();
	        sub.add(scheduler.schedule(function () {
	            return input.then(function (value) {
	                sub.add(scheduler.schedule(function () {
	                    subscriber.next(value);
	                    sub.add(scheduler.schedule(function () {
	                        return subscriber.complete();
	                    }));
	                }));
	            }, function (err) {
	                sub.add(scheduler.schedule(function () {
	                    return subscriber.error(err);
	                }));
	            });
	        }));
	        return sub;
	    });
	}
	exports.schedulePromise = schedulePromise;
	//# sourceMappingURL=schedulePromise.js.map

/***/ },
/* 112 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", { value: true });
	var Observable_1 = __webpack_require__(35);
	var Subscription_1 = __webpack_require__(42);
	var iterator_1 = __webpack_require__(100);
	function scheduleIterable(input, scheduler) {
	    if (!input) {
	        throw new Error('Iterable cannot be null');
	    }
	    return new Observable_1.Observable(function (subscriber) {
	        var sub = new Subscription_1.Subscription();
	        var iterator;
	        sub.add(function () {
	            if (iterator && typeof iterator.return === 'function') {
	                iterator.return();
	            }
	        });
	        sub.add(scheduler.schedule(function () {
	            iterator = input[iterator_1.iterator]();
	            sub.add(scheduler.schedule(function () {
	                if (subscriber.closed) {
	                    return;
	                }
	                var value;
	                var done;
	                try {
	                    var result = iterator.next();
	                    value = result.value;
	                    done = result.done;
	                } catch (err) {
	                    subscriber.error(err);
	                    return;
	                }
	                if (done) {
	                    subscriber.complete();
	                } else {
	                    subscriber.next(value);
	                    this.schedule();
	                }
	            }));
	        }));
	        return sub;
	    });
	}
	exports.scheduleIterable = scheduleIterable;
	//# sourceMappingURL=scheduleIterable.js.map

/***/ },
/* 113 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", { value: true });
	var observable_1 = __webpack_require__(48);
	function isInteropObservable(input) {
	    return input && typeof input[observable_1.observable] === 'function';
	}
	exports.isInteropObservable = isInteropObservable;
	//# sourceMappingURL=isInteropObservable.js.map

/***/ },
/* 114 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", { value: true });
	var iterator_1 = __webpack_require__(100);
	function isIterable(input) {
	    return input && typeof input[iterator_1.iterator] === 'function';
	}
	exports.isIterable = isIterable;
	//# sourceMappingURL=isIterable.js.map

/***/ },
/* 115 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", { value: true });
	var Observable_1 = __webpack_require__(35);
	var from_1 = __webpack_require__(108);
	var empty_1 = __webpack_require__(68);
	function defer(observableFactory) {
	    return new Observable_1.Observable(function (subscriber) {
	        var input;
	        try {
	            input = observableFactory();
	        } catch (err) {
	            subscriber.error(err);
	            return undefined;
	        }
	        var source = input ? from_1.from(input) : empty_1.empty();
	        return source.subscribe(subscriber);
	    });
	}
	exports.defer = defer;
	//# sourceMappingURL=defer.js.map

/***/ },
/* 116 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", { value: true });
	var Observable_1 = __webpack_require__(35);
	var isArray_1 = __webpack_require__(43);
	var map_1 = __webpack_require__(91);
	var isObject_1 = __webpack_require__(44);
	var from_1 = __webpack_require__(108);
	function forkJoin() {
	    var sources = [];
	    for (var _i = 0; _i < arguments.length; _i++) {
	        sources[_i] = arguments[_i];
	    }
	    if (sources.length === 1) {
	        var first_1 = sources[0];
	        if (isArray_1.isArray(first_1)) {
	            return forkJoinInternal(first_1, null);
	        }
	        if (isObject_1.isObject(first_1) && Object.getPrototypeOf(first_1) === Object.prototype) {
	            var keys = Object.keys(first_1);
	            return forkJoinInternal(keys.map(function (key) {
	                return first_1[key];
	            }), keys);
	        }
	    }
	    if (typeof sources[sources.length - 1] === 'function') {
	        var resultSelector_1 = sources.pop();
	        sources = sources.length === 1 && isArray_1.isArray(sources[0]) ? sources[0] : sources;
	        return forkJoinInternal(sources, null).pipe(map_1.map(function (args) {
	            return resultSelector_1.apply(void 0, args);
	        }));
	    }
	    return forkJoinInternal(sources, null);
	}
	exports.forkJoin = forkJoin;
	function forkJoinInternal(sources, keys) {
	    return new Observable_1.Observable(function (subscriber) {
	        var len = sources.length;
	        if (len === 0) {
	            subscriber.complete();
	            return;
	        }
	        var values = new Array(len);
	        var completed = 0;
	        var emitted = 0;
	        var _loop_1 = function _loop_1(i) {
	            var source = from_1.from(sources[i]);
	            var hasValue = false;
	            subscriber.add(source.subscribe({
	                next: function next(value) {
	                    if (!hasValue) {
	                        hasValue = true;
	                        emitted++;
	                    }
	                    values[i] = value;
	                },
	                error: function error(err) {
	                    return subscriber.error(err);
	                },
	                complete: function complete() {
	                    completed++;
	                    if (completed === len || !hasValue) {
	                        if (emitted === len) {
	                            subscriber.next(keys ? keys.reduce(function (result, key, i) {
	                                return result[key] = values[i], result;
	                            }, {}) : values);
	                        }
	                        subscriber.complete();
	                    }
	                }
	            }));
	        };
	        for (var i = 0; i < len; i++) {
	            _loop_1(i);
	        }
	    });
	}
	//# sourceMappingURL=forkJoin.js.map

/***/ },
/* 117 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", { value: true });
	var Observable_1 = __webpack_require__(35);
	var isArray_1 = __webpack_require__(43);
	var isFunction_1 = __webpack_require__(38);
	var map_1 = __webpack_require__(91);
	var toString = Object.prototype.toString;
	function fromEvent(target, eventName, options, resultSelector) {
	    if (isFunction_1.isFunction(options)) {
	        resultSelector = options;
	        options = undefined;
	    }
	    if (resultSelector) {
	        return fromEvent(target, eventName, options).pipe(map_1.map(function (args) {
	            return isArray_1.isArray(args) ? resultSelector.apply(void 0, args) : resultSelector(args);
	        }));
	    }
	    return new Observable_1.Observable(function (subscriber) {
	        function handler(e) {
	            if (arguments.length > 1) {
	                subscriber.next(Array.prototype.slice.call(arguments));
	            } else {
	                subscriber.next(e);
	            }
	        }
	        setupSubscription(target, eventName, handler, subscriber, options);
	    });
	}
	exports.fromEvent = fromEvent;
	function setupSubscription(sourceObj, eventName, handler, subscriber, options) {
	    var unsubscribe;
	    if (isEventTarget(sourceObj)) {
	        var source_1 = sourceObj;
	        sourceObj.addEventListener(eventName, handler, options);
	        unsubscribe = function unsubscribe() {
	            return source_1.removeEventListener(eventName, handler, options);
	        };
	    } else if (isJQueryStyleEventEmitter(sourceObj)) {
	        var source_2 = sourceObj;
	        sourceObj.on(eventName, handler);
	        unsubscribe = function unsubscribe() {
	            return source_2.off(eventName, handler);
	        };
	    } else if (isNodeStyleEventEmitter(sourceObj)) {
	        var source_3 = sourceObj;
	        sourceObj.addListener(eventName, handler);
	        unsubscribe = function unsubscribe() {
	            return source_3.removeListener(eventName, handler);
	        };
	    } else if (sourceObj && sourceObj.length) {
	        for (var i = 0, len = sourceObj.length; i < len; i++) {
	            setupSubscription(sourceObj[i], eventName, handler, subscriber, options);
	        }
	    } else {
	        throw new TypeError('Invalid event target');
	    }
	    subscriber.add(unsubscribe);
	}
	function isNodeStyleEventEmitter(sourceObj) {
	    return sourceObj && typeof sourceObj.addListener === 'function' && typeof sourceObj.removeListener === 'function';
	}
	function isJQueryStyleEventEmitter(sourceObj) {
	    return sourceObj && typeof sourceObj.on === 'function' && typeof sourceObj.off === 'function';
	}
	function isEventTarget(sourceObj) {
	    return sourceObj && typeof sourceObj.addEventListener === 'function' && typeof sourceObj.removeEventListener === 'function';
	}
	//# sourceMappingURL=fromEvent.js.map

/***/ },
/* 118 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", { value: true });
	var Observable_1 = __webpack_require__(35);
	var isArray_1 = __webpack_require__(43);
	var isFunction_1 = __webpack_require__(38);
	var map_1 = __webpack_require__(91);
	function fromEventPattern(addHandler, removeHandler, resultSelector) {
	    if (resultSelector) {
	        return fromEventPattern(addHandler, removeHandler).pipe(map_1.map(function (args) {
	            return isArray_1.isArray(args) ? resultSelector.apply(void 0, args) : resultSelector(args);
	        }));
	    }
	    return new Observable_1.Observable(function (subscriber) {
	        var handler = function handler() {
	            var e = [];
	            for (var _i = 0; _i < arguments.length; _i++) {
	                e[_i] = arguments[_i];
	            }
	            return subscriber.next(e.length === 1 ? e[0] : e);
	        };
	        var retValue;
	        try {
	            retValue = addHandler(handler);
	        } catch (err) {
	            subscriber.error(err);
	            return undefined;
	        }
	        if (!isFunction_1.isFunction(removeHandler)) {
	            return undefined;
	        }
	        return function () {
	            return removeHandler(handler, retValue);
	        };
	    });
	}
	exports.fromEventPattern = fromEventPattern;
	//# sourceMappingURL=fromEventPattern.js.map

/***/ },
/* 119 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", { value: true });
	var Observable_1 = __webpack_require__(35);
	var identity_1 = __webpack_require__(85);
	var isScheduler_1 = __webpack_require__(70);
	function generate(initialStateOrOptions, condition, iterate, resultSelectorOrObservable, scheduler) {
	    var resultSelector;
	    var initialState;
	    if (arguments.length == 1) {
	        var options = initialStateOrOptions;
	        initialState = options.initialState;
	        condition = options.condition;
	        iterate = options.iterate;
	        resultSelector = options.resultSelector || identity_1.identity;
	        scheduler = options.scheduler;
	    } else if (resultSelectorOrObservable === undefined || isScheduler_1.isScheduler(resultSelectorOrObservable)) {
	        initialState = initialStateOrOptions;
	        resultSelector = identity_1.identity;
	        scheduler = resultSelectorOrObservable;
	    } else {
	        initialState = initialStateOrOptions;
	        resultSelector = resultSelectorOrObservable;
	    }
	    return new Observable_1.Observable(function (subscriber) {
	        var state = initialState;
	        if (scheduler) {
	            return scheduler.schedule(dispatch, 0, {
	                subscriber: subscriber,
	                iterate: iterate,
	                condition: condition,
	                resultSelector: resultSelector,
	                state: state
	            });
	        }
	        do {
	            if (condition) {
	                var conditionResult = void 0;
	                try {
	                    conditionResult = condition(state);
	                } catch (err) {
	                    subscriber.error(err);
	                    return undefined;
	                }
	                if (!conditionResult) {
	                    subscriber.complete();
	                    break;
	                }
	            }
	            var value = void 0;
	            try {
	                value = resultSelector(state);
	            } catch (err) {
	                subscriber.error(err);
	                return undefined;
	            }
	            subscriber.next(value);
	            if (subscriber.closed) {
	                break;
	            }
	            try {
	                state = iterate(state);
	            } catch (err) {
	                subscriber.error(err);
	                return undefined;
	            }
	        } while (true);
	        return undefined;
	    });
	}
	exports.generate = generate;
	function dispatch(state) {
	    var subscriber = state.subscriber,
	        condition = state.condition;
	    if (subscriber.closed) {
	        return undefined;
	    }
	    if (state.needIterate) {
	        try {
	            state.state = state.iterate(state.state);
	        } catch (err) {
	            subscriber.error(err);
	            return undefined;
	        }
	    } else {
	        state.needIterate = true;
	    }
	    if (condition) {
	        var conditionResult = void 0;
	        try {
	            conditionResult = condition(state.state);
	        } catch (err) {
	            subscriber.error(err);
	            return undefined;
	        }
	        if (!conditionResult) {
	            subscriber.complete();
	            return undefined;
	        }
	        if (subscriber.closed) {
	            return undefined;
	        }
	    }
	    var value;
	    try {
	        value = state.resultSelector(state.state);
	    } catch (err) {
	        subscriber.error(err);
	        return undefined;
	    }
	    if (subscriber.closed) {
	        return undefined;
	    }
	    subscriber.next(value);
	    if (subscriber.closed) {
	        return undefined;
	    }
	    return this.schedule(state);
	}
	//# sourceMappingURL=generate.js.map

/***/ },
/* 120 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", { value: true });
	var defer_1 = __webpack_require__(115);
	var empty_1 = __webpack_require__(68);
	function iif(condition, trueResult, falseResult) {
	    if (trueResult === void 0) {
	        trueResult = empty_1.EMPTY;
	    }
	    if (falseResult === void 0) {
	        falseResult = empty_1.EMPTY;
	    }
	    return defer_1.defer(function () {
	        return condition() ? trueResult : falseResult;
	    });
	}
	exports.iif = iif;
	//# sourceMappingURL=iif.js.map

/***/ },
/* 121 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", { value: true });
	var Observable_1 = __webpack_require__(35);
	var async_1 = __webpack_require__(80);
	var isNumeric_1 = __webpack_require__(122);
	function interval(period, scheduler) {
	    if (period === void 0) {
	        period = 0;
	    }
	    if (scheduler === void 0) {
	        scheduler = async_1.async;
	    }
	    if (!isNumeric_1.isNumeric(period) || period < 0) {
	        period = 0;
	    }
	    if (!scheduler || typeof scheduler.schedule !== 'function') {
	        scheduler = async_1.async;
	    }
	    return new Observable_1.Observable(function (subscriber) {
	        subscriber.add(scheduler.schedule(dispatch, period, { subscriber: subscriber, counter: 0, period: period }));
	        return subscriber;
	    });
	}
	exports.interval = interval;
	function dispatch(state) {
	    var subscriber = state.subscriber,
	        counter = state.counter,
	        period = state.period;
	    subscriber.next(counter);
	    this.schedule({ subscriber: subscriber, counter: counter + 1, period: period }, period);
	}
	//# sourceMappingURL=interval.js.map

/***/ },
/* 122 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", { value: true });
	var isArray_1 = __webpack_require__(43);
	function isNumeric(val) {
	    return !isArray_1.isArray(val) && val - parseFloat(val) + 1 >= 0;
	}
	exports.isNumeric = isNumeric;
	//# sourceMappingURL=isNumeric.js.map

/***/ },
/* 123 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", { value: true });
	var Observable_1 = __webpack_require__(35);
	var isScheduler_1 = __webpack_require__(70);
	var mergeAll_1 = __webpack_require__(106);
	var fromArray_1 = __webpack_require__(71);
	function merge() {
	    var observables = [];
	    for (var _i = 0; _i < arguments.length; _i++) {
	        observables[_i] = arguments[_i];
	    }
	    var concurrent = Number.POSITIVE_INFINITY;
	    var scheduler = null;
	    var last = observables[observables.length - 1];
	    if (isScheduler_1.isScheduler(last)) {
	        scheduler = observables.pop();
	        if (observables.length > 1 && typeof observables[observables.length - 1] === 'number') {
	            concurrent = observables.pop();
	        }
	    } else if (typeof last === 'number') {
	        concurrent = observables.pop();
	    }
	    if (scheduler === null && observables.length === 1 && observables[0] instanceof Observable_1.Observable) {
	        return observables[0];
	    }
	    return mergeAll_1.mergeAll(concurrent)(fromArray_1.fromArray(observables, scheduler));
	}
	exports.merge = merge;
	//# sourceMappingURL=merge.js.map

/***/ },
/* 124 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", { value: true });
	var Observable_1 = __webpack_require__(35);
	var noop_1 = __webpack_require__(50);
	exports.NEVER = new Observable_1.Observable(noop_1.noop);
	function never() {
	    return exports.NEVER;
	}
	exports.never = never;
	//# sourceMappingURL=never.js.map

/***/ },
/* 125 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", { value: true });
	var Observable_1 = __webpack_require__(35);
	var from_1 = __webpack_require__(108);
	var isArray_1 = __webpack_require__(43);
	var empty_1 = __webpack_require__(68);
	function onErrorResumeNext() {
	    var sources = [];
	    for (var _i = 0; _i < arguments.length; _i++) {
	        sources[_i] = arguments[_i];
	    }
	    if (sources.length === 0) {
	        return empty_1.EMPTY;
	    }
	    var first = sources[0],
	        remainder = sources.slice(1);
	    if (sources.length === 1 && isArray_1.isArray(first)) {
	        return onErrorResumeNext.apply(void 0, first);
	    }
	    return new Observable_1.Observable(function (subscriber) {
	        var subNext = function subNext() {
	            return subscriber.add(onErrorResumeNext.apply(void 0, remainder).subscribe(subscriber));
	        };
	        return from_1.from(first).subscribe({
	            next: function next(value) {
	                subscriber.next(value);
	            },
	            error: subNext,
	            complete: subNext
	        });
	    });
	}
	exports.onErrorResumeNext = onErrorResumeNext;
	//# sourceMappingURL=onErrorResumeNext.js.map

/***/ },
/* 126 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", { value: true });
	var Observable_1 = __webpack_require__(35);
	var Subscription_1 = __webpack_require__(42);
	function pairs(obj, scheduler) {
	    if (!scheduler) {
	        return new Observable_1.Observable(function (subscriber) {
	            var keys = Object.keys(obj);
	            for (var i = 0; i < keys.length && !subscriber.closed; i++) {
	                var key = keys[i];
	                if (obj.hasOwnProperty(key)) {
	                    subscriber.next([key, obj[key]]);
	                }
	            }
	            subscriber.complete();
	        });
	    } else {
	        return new Observable_1.Observable(function (subscriber) {
	            var keys = Object.keys(obj);
	            var subscription = new Subscription_1.Subscription();
	            subscription.add(scheduler.schedule(dispatch, 0, { keys: keys, index: 0, subscriber: subscriber, subscription: subscription, obj: obj }));
	            return subscription;
	        });
	    }
	}
	exports.pairs = pairs;
	function dispatch(state) {
	    var keys = state.keys,
	        index = state.index,
	        subscriber = state.subscriber,
	        subscription = state.subscription,
	        obj = state.obj;
	    if (!subscriber.closed) {
	        if (index < keys.length) {
	            var key = keys[index];
	            subscriber.next([key, obj[key]]);
	            subscription.add(this.schedule({ keys: keys, index: index + 1, subscriber: subscriber, subscription: subscription, obj: obj }));
	        } else {
	            subscriber.complete();
	        }
	    }
	}
	exports.dispatch = dispatch;
	//# sourceMappingURL=pairs.js.map

/***/ },
/* 127 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", { value: true });
	var not_1 = __webpack_require__(128);
	var subscribeTo_1 = __webpack_require__(97);
	var filter_1 = __webpack_require__(129);
	var Observable_1 = __webpack_require__(35);
	function partition(source, predicate, thisArg) {
	    return [filter_1.filter(predicate, thisArg)(new Observable_1.Observable(subscribeTo_1.subscribeTo(source))), filter_1.filter(not_1.not(predicate, thisArg))(new Observable_1.Observable(subscribeTo_1.subscribeTo(source)))];
	}
	exports.partition = partition;
	//# sourceMappingURL=partition.js.map

/***/ },
/* 128 */
/***/ function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", { value: true });
	function not(pred, thisArg) {
	    function notPred() {
	        return !notPred.pred.apply(notPred.thisArg, arguments);
	    }
	    notPred.pred = pred;
	    notPred.thisArg = thisArg;
	    return notPred;
	}
	exports.not = not;
	//# sourceMappingURL=not.js.map

/***/ },
/* 129 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var __extends = undefined && undefined.__extends || function () {
	    var _extendStatics = function extendStatics(d, b) {
	        _extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function (d, b) {
	            d.__proto__ = b;
	        } || function (d, b) {
	            for (var p in b) {
	                if (b.hasOwnProperty(p)) d[p] = b[p];
	            }
	        };
	        return _extendStatics(d, b);
	    };
	    return function (d, b) {
	        _extendStatics(d, b);
	        function __() {
	            this.constructor = d;
	        }
	        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	    };
	}();
	Object.defineProperty(exports, "__esModule", { value: true });
	var Subscriber_1 = __webpack_require__(37);
	function filter(predicate, thisArg) {
	    return function filterOperatorFunction(source) {
	        return source.lift(new FilterOperator(predicate, thisArg));
	    };
	}
	exports.filter = filter;
	var FilterOperator = function () {
	    function FilterOperator(predicate, thisArg) {
	        this.predicate = predicate;
	        this.thisArg = thisArg;
	    }
	    FilterOperator.prototype.call = function (subscriber, source) {
	        return source.subscribe(new FilterSubscriber(subscriber, this.predicate, this.thisArg));
	    };
	    return FilterOperator;
	}();
	var FilterSubscriber = function (_super) {
	    __extends(FilterSubscriber, _super);
	    function FilterSubscriber(destination, predicate, thisArg) {
	        var _this = _super.call(this, destination) || this;
	        _this.predicate = predicate;
	        _this.thisArg = thisArg;
	        _this.count = 0;
	        return _this;
	    }
	    FilterSubscriber.prototype._next = function (value) {
	        var result;
	        try {
	            result = this.predicate.call(this.thisArg, value, this.count++);
	        } catch (err) {
	            this.destination.error(err);
	            return;
	        }
	        if (result) {
	            this.destination.next(value);
	        }
	    };
	    return FilterSubscriber;
	}(Subscriber_1.Subscriber);
	//# sourceMappingURL=filter.js.map

/***/ },
/* 130 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var __extends = undefined && undefined.__extends || function () {
	    var _extendStatics = function extendStatics(d, b) {
	        _extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function (d, b) {
	            d.__proto__ = b;
	        } || function (d, b) {
	            for (var p in b) {
	                if (b.hasOwnProperty(p)) d[p] = b[p];
	            }
	        };
	        return _extendStatics(d, b);
	    };
	    return function (d, b) {
	        _extendStatics(d, b);
	        function __() {
	            this.constructor = d;
	        }
	        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	    };
	}();
	Object.defineProperty(exports, "__esModule", { value: true });
	var isArray_1 = __webpack_require__(43);
	var fromArray_1 = __webpack_require__(71);
	var OuterSubscriber_1 = __webpack_require__(94);
	var subscribeToResult_1 = __webpack_require__(95);
	function race() {
	    var observables = [];
	    for (var _i = 0; _i < arguments.length; _i++) {
	        observables[_i] = arguments[_i];
	    }
	    if (observables.length === 1) {
	        if (isArray_1.isArray(observables[0])) {
	            observables = observables[0];
	        } else {
	            return observables[0];
	        }
	    }
	    return fromArray_1.fromArray(observables, undefined).lift(new RaceOperator());
	}
	exports.race = race;
	var RaceOperator = function () {
	    function RaceOperator() {}
	    RaceOperator.prototype.call = function (subscriber, source) {
	        return source.subscribe(new RaceSubscriber(subscriber));
	    };
	    return RaceOperator;
	}();
	exports.RaceOperator = RaceOperator;
	var RaceSubscriber = function (_super) {
	    __extends(RaceSubscriber, _super);
	    function RaceSubscriber(destination) {
	        var _this = _super.call(this, destination) || this;
	        _this.hasFirst = false;
	        _this.observables = [];
	        _this.subscriptions = [];
	        return _this;
	    }
	    RaceSubscriber.prototype._next = function (observable) {
	        this.observables.push(observable);
	    };
	    RaceSubscriber.prototype._complete = function () {
	        var observables = this.observables;
	        var len = observables.length;
	        if (len === 0) {
	            this.destination.complete();
	        } else {
	            for (var i = 0; i < len && !this.hasFirst; i++) {
	                var observable = observables[i];
	                var subscription = subscribeToResult_1.subscribeToResult(this, observable, observable, i);
	                if (this.subscriptions) {
	                    this.subscriptions.push(subscription);
	                }
	                this.add(subscription);
	            }
	            this.observables = null;
	        }
	    };
	    RaceSubscriber.prototype.notifyNext = function (outerValue, innerValue, outerIndex, innerIndex, innerSub) {
	        if (!this.hasFirst) {
	            this.hasFirst = true;
	            for (var i = 0; i < this.subscriptions.length; i++) {
	                if (i !== outerIndex) {
	                    var subscription = this.subscriptions[i];
	                    subscription.unsubscribe();
	                    this.remove(subscription);
	                }
	            }
	            this.subscriptions = null;
	        }
	        this.destination.next(innerValue);
	    };
	    return RaceSubscriber;
	}(OuterSubscriber_1.OuterSubscriber);
	exports.RaceSubscriber = RaceSubscriber;
	//# sourceMappingURL=race.js.map

/***/ },
/* 131 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", { value: true });
	var Observable_1 = __webpack_require__(35);
	function range(start, count, scheduler) {
	    if (start === void 0) {
	        start = 0;
	    }
	    return new Observable_1.Observable(function (subscriber) {
	        if (count === undefined) {
	            count = start;
	            start = 0;
	        }
	        var index = 0;
	        var current = start;
	        if (scheduler) {
	            return scheduler.schedule(dispatch, 0, {
	                index: index, count: count, start: start, subscriber: subscriber
	            });
	        } else {
	            do {
	                if (index++ >= count) {
	                    subscriber.complete();
	                    break;
	                }
	                subscriber.next(current++);
	                if (subscriber.closed) {
	                    break;
	                }
	            } while (true);
	        }
	        return undefined;
	    });
	}
	exports.range = range;
	function dispatch(state) {
	    var start = state.start,
	        index = state.index,
	        count = state.count,
	        subscriber = state.subscriber;
	    if (index >= count) {
	        subscriber.complete();
	        return;
	    }
	    subscriber.next(start);
	    if (subscriber.closed) {
	        return;
	    }
	    state.index = index + 1;
	    state.start = start + 1;
	    this.schedule(state);
	}
	exports.dispatch = dispatch;
	//# sourceMappingURL=range.js.map

/***/ },
/* 132 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", { value: true });
	var Observable_1 = __webpack_require__(35);
	var async_1 = __webpack_require__(80);
	var isNumeric_1 = __webpack_require__(122);
	var isScheduler_1 = __webpack_require__(70);
	function timer(dueTime, periodOrScheduler, scheduler) {
	    if (dueTime === void 0) {
	        dueTime = 0;
	    }
	    var period = -1;
	    if (isNumeric_1.isNumeric(periodOrScheduler)) {
	        period = Number(periodOrScheduler) < 1 && 1 || Number(periodOrScheduler);
	    } else if (isScheduler_1.isScheduler(periodOrScheduler)) {
	        scheduler = periodOrScheduler;
	    }
	    if (!isScheduler_1.isScheduler(scheduler)) {
	        scheduler = async_1.async;
	    }
	    return new Observable_1.Observable(function (subscriber) {
	        var due = isNumeric_1.isNumeric(dueTime) ? dueTime : +dueTime - scheduler.now();
	        return scheduler.schedule(dispatch, due, {
	            index: 0, period: period, subscriber: subscriber
	        });
	    });
	}
	exports.timer = timer;
	function dispatch(state) {
	    var index = state.index,
	        period = state.period,
	        subscriber = state.subscriber;
	    subscriber.next(index);
	    if (subscriber.closed) {
	        return;
	    } else if (period === -1) {
	        return subscriber.complete();
	    }
	    state.index = index + 1;
	    this.schedule(state, period);
	}
	//# sourceMappingURL=timer.js.map

/***/ },
/* 133 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", { value: true });
	var Observable_1 = __webpack_require__(35);
	var from_1 = __webpack_require__(108);
	var empty_1 = __webpack_require__(68);
	function using(resourceFactory, observableFactory) {
	    return new Observable_1.Observable(function (subscriber) {
	        var resource;
	        try {
	            resource = resourceFactory();
	        } catch (err) {
	            subscriber.error(err);
	            return undefined;
	        }
	        var result;
	        try {
	            result = observableFactory(resource);
	        } catch (err) {
	            subscriber.error(err);
	            return undefined;
	        }
	        var source = result ? from_1.from(result) : empty_1.EMPTY;
	        var subscription = source.subscribe(subscriber);
	        return function () {
	            subscription.unsubscribe();
	            if (resource) {
	                resource.unsubscribe();
	            }
	        };
	    });
	}
	exports.using = using;
	//# sourceMappingURL=using.js.map

/***/ },
/* 134 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var __extends = undefined && undefined.__extends || function () {
	    var _extendStatics = function extendStatics(d, b) {
	        _extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function (d, b) {
	            d.__proto__ = b;
	        } || function (d, b) {
	            for (var p in b) {
	                if (b.hasOwnProperty(p)) d[p] = b[p];
	            }
	        };
	        return _extendStatics(d, b);
	    };
	    return function (d, b) {
	        _extendStatics(d, b);
	        function __() {
	            this.constructor = d;
	        }
	        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	    };
	}();
	Object.defineProperty(exports, "__esModule", { value: true });
	var fromArray_1 = __webpack_require__(71);
	var isArray_1 = __webpack_require__(43);
	var Subscriber_1 = __webpack_require__(37);
	var OuterSubscriber_1 = __webpack_require__(94);
	var subscribeToResult_1 = __webpack_require__(95);
	var iterator_1 = __webpack_require__(100);
	function zip() {
	    var observables = [];
	    for (var _i = 0; _i < arguments.length; _i++) {
	        observables[_i] = arguments[_i];
	    }
	    var resultSelector = observables[observables.length - 1];
	    if (typeof resultSelector === 'function') {
	        observables.pop();
	    }
	    return fromArray_1.fromArray(observables, undefined).lift(new ZipOperator(resultSelector));
	}
	exports.zip = zip;
	var ZipOperator = function () {
	    function ZipOperator(resultSelector) {
	        this.resultSelector = resultSelector;
	    }
	    ZipOperator.prototype.call = function (subscriber, source) {
	        return source.subscribe(new ZipSubscriber(subscriber, this.resultSelector));
	    };
	    return ZipOperator;
	}();
	exports.ZipOperator = ZipOperator;
	var ZipSubscriber = function (_super) {
	    __extends(ZipSubscriber, _super);
	    function ZipSubscriber(destination, resultSelector, values) {
	        if (values === void 0) {
	            values = Object.create(null);
	        }
	        var _this = _super.call(this, destination) || this;
	        _this.iterators = [];
	        _this.active = 0;
	        _this.resultSelector = typeof resultSelector === 'function' ? resultSelector : null;
	        _this.values = values;
	        return _this;
	    }
	    ZipSubscriber.prototype._next = function (value) {
	        var iterators = this.iterators;
	        if (isArray_1.isArray(value)) {
	            iterators.push(new StaticArrayIterator(value));
	        } else if (typeof value[iterator_1.iterator] === 'function') {
	            iterators.push(new StaticIterator(value[iterator_1.iterator]()));
	        } else {
	            iterators.push(new ZipBufferIterator(this.destination, this, value));
	        }
	    };
	    ZipSubscriber.prototype._complete = function () {
	        var iterators = this.iterators;
	        var len = iterators.length;
	        this.unsubscribe();
	        if (len === 0) {
	            this.destination.complete();
	            return;
	        }
	        this.active = len;
	        for (var i = 0; i < len; i++) {
	            var iterator = iterators[i];
	            if (iterator.stillUnsubscribed) {
	                var destination = this.destination;
	                destination.add(iterator.subscribe(iterator, i));
	            } else {
	                this.active--;
	            }
	        }
	    };
	    ZipSubscriber.prototype.notifyInactive = function () {
	        this.active--;
	        if (this.active === 0) {
	            this.destination.complete();
	        }
	    };
	    ZipSubscriber.prototype.checkIterators = function () {
	        var iterators = this.iterators;
	        var len = iterators.length;
	        var destination = this.destination;
	        for (var i = 0; i < len; i++) {
	            var iterator = iterators[i];
	            if (typeof iterator.hasValue === 'function' && !iterator.hasValue()) {
	                return;
	            }
	        }
	        var shouldComplete = false;
	        var args = [];
	        for (var i = 0; i < len; i++) {
	            var iterator = iterators[i];
	            var result = iterator.next();
	            if (iterator.hasCompleted()) {
	                shouldComplete = true;
	            }
	            if (result.done) {
	                destination.complete();
	                return;
	            }
	            args.push(result.value);
	        }
	        if (this.resultSelector) {
	            this._tryresultSelector(args);
	        } else {
	            destination.next(args);
	        }
	        if (shouldComplete) {
	            destination.complete();
	        }
	    };
	    ZipSubscriber.prototype._tryresultSelector = function (args) {
	        var result;
	        try {
	            result = this.resultSelector.apply(this, args);
	        } catch (err) {
	            this.destination.error(err);
	            return;
	        }
	        this.destination.next(result);
	    };
	    return ZipSubscriber;
	}(Subscriber_1.Subscriber);
	exports.ZipSubscriber = ZipSubscriber;
	var StaticIterator = function () {
	    function StaticIterator(iterator) {
	        this.iterator = iterator;
	        this.nextResult = iterator.next();
	    }
	    StaticIterator.prototype.hasValue = function () {
	        return true;
	    };
	    StaticIterator.prototype.next = function () {
	        var result = this.nextResult;
	        this.nextResult = this.iterator.next();
	        return result;
	    };
	    StaticIterator.prototype.hasCompleted = function () {
	        var nextResult = this.nextResult;
	        return nextResult && nextResult.done;
	    };
	    return StaticIterator;
	}();
	var StaticArrayIterator = function () {
	    function StaticArrayIterator(array) {
	        this.array = array;
	        this.index = 0;
	        this.length = 0;
	        this.length = array.length;
	    }
	    StaticArrayIterator.prototype[iterator_1.iterator] = function () {
	        return this;
	    };
	    StaticArrayIterator.prototype.next = function (value) {
	        var i = this.index++;
	        var array = this.array;
	        return i < this.length ? { value: array[i], done: false } : { value: null, done: true };
	    };
	    StaticArrayIterator.prototype.hasValue = function () {
	        return this.array.length > this.index;
	    };
	    StaticArrayIterator.prototype.hasCompleted = function () {
	        return this.array.length === this.index;
	    };
	    return StaticArrayIterator;
	}();
	var ZipBufferIterator = function (_super) {
	    __extends(ZipBufferIterator, _super);
	    function ZipBufferIterator(destination, parent, observable) {
	        var _this = _super.call(this, destination) || this;
	        _this.parent = parent;
	        _this.observable = observable;
	        _this.stillUnsubscribed = true;
	        _this.buffer = [];
	        _this.isComplete = false;
	        return _this;
	    }
	    ZipBufferIterator.prototype[iterator_1.iterator] = function () {
	        return this;
	    };
	    ZipBufferIterator.prototype.next = function () {
	        var buffer = this.buffer;
	        if (buffer.length === 0 && this.isComplete) {
	            return { value: null, done: true };
	        } else {
	            return { value: buffer.shift(), done: false };
	        }
	    };
	    ZipBufferIterator.prototype.hasValue = function () {
	        return this.buffer.length > 0;
	    };
	    ZipBufferIterator.prototype.hasCompleted = function () {
	        return this.buffer.length === 0 && this.isComplete;
	    };
	    ZipBufferIterator.prototype.notifyComplete = function () {
	        if (this.buffer.length > 0) {
	            this.isComplete = true;
	            this.parent.notifyInactive();
	        } else {
	            this.destination.complete();
	        }
	    };
	    ZipBufferIterator.prototype.notifyNext = function (outerValue, innerValue, outerIndex, innerIndex, innerSub) {
	        this.buffer.push(innerValue);
	        this.parent.checkIterators();
	    };
	    ZipBufferIterator.prototype.subscribe = function (value, index) {
	        return subscribeToResult_1.subscribeToResult(this, this.observable, this, index);
	    };
	    return ZipBufferIterator;
	}(OuterSubscriber_1.OuterSubscriber);
	//# sourceMappingURL=zip.js.map

/***/ },
/* 135 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var _require = __webpack_require__(4),
	    Feed = _require.Feed,
	    feedIndex = _require.index;

	var _require2 = __webpack_require__(33),
	    Stream = _require2.Stream;

	var Sitemap = function () {
		function Sitemap(root) {
			_classCallCheck(this, Sitemap);

			this.root = root;
			this.map = {};
		}

		/**
	  * {
	  *   [service]: {
	  *     routes: {
	  *     		read:
	  *     		readMany:
	  *     		all:
	  *     		query:,
	  *     		create:
	  *     		update:
	  *     		delete: 
	  *     },
	  *     joins: {
	  *       [param] : url:
	  *     }
	  *   }
	  * }
	  */


		_createClass(Sitemap, [{
			key: 'ingest',
			value: function ingest(config) {
				var settings = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

				for (var service in config) {
					var feed = this.getFeed(service);

					var _config$service = config[service],
					    routes = _config$service.routes,
					    joins = _config$service.joins;


					if (routes) {
						routes = {
							read: routes.read ? this.root + routes.read : null,
							readMany: routes.readMany ? this.root + routes.readMany : null,
							all: routes.all ? this.root + routes.all : null,
							query: routes.query ? this.root + routes.query : null,
							create: routes.create ? this.root + routes.create : null,
							update: routes.update ? this.root + routes.update : null,
							delete: routes.delete ? this.root + routes.delete : null
						};
					} else {
						routes = {};
					}

					if (joins) {
						var search = {};
						for (var join in joins) {
							search[join] = this.root + joins[join];
						}

						routes.search = search;
					}

					feed.addRoutes(routes);

					if (settings.stream) {
						this.addStream(feed, service);
					}
				}
			}
		}, {
			key: 'getFeed',
			value: function getFeed(service) {
				var feed = feedIndex.get(service);

				if (!feed) {
					feed = new Feed({ name: service });
				}

				return feed;
			}
		}, {
			key: 'addStream',
			value: function addStream(feed, service) {
				return new Stream(feed, { name: service });
			}
		}]);

		return Sitemap;
	}();

	module.exports = {
		Sitemap: Sitemap
	};

/***/ },
/* 136 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var Promise = __webpack_require__(27).Promise,
	    Requestor = __webpack_require__(25);

	var RequestorMock = function () {
		function RequestorMock() {
			_classCallCheck(this, RequestorMock);
		}

		_createClass(RequestorMock, [{
			key: 'enable',
			value: function enable() {
				var _this = this;

				this.callStack = [];

				Requestor.clearCache();
				Requestor.settings.fetcher = function (url, ops) {
					var t;

					if (_this.callStack.length) {
						t = _this.callStack.shift();

						expect(t.url).toEqual(url);

						if (t.params) {
							expect(t.params).toEqual(JSON.parse(ops.body));
						}

						if (t.other) {
							Object.keys(t.other).forEach(function (key) {
								t.other[key](ops[key]);
							});
						}

						if (t.success) {
							return Promise.resolve({
								json: function json() {
									return t.res || 'OK';
								},
								status: t.code || 200
							});
						} else {
							var err = new Error(t.res || 'OK');
							err.status = t.code || 200;

							return Promise.reject(err);
						}
					} else {
						expect('callStack.length').toBe('not zero');
					}
				};
			}
		}, {
			key: 'expect',
			value: function expect(url, params, other) {
				var t = {
					success: true,
					url: url,
					other: other,
					params: params
				};

				this.callStack.push(t);

				return {
					reject: function reject(err, code) {
						t.success = false;
						t.res = err;
						t.code = code;
					},
					respond: function respond(res, code) {
						t.res = res;
						t.code = code;
					}
				};
			}
		}, {
			key: 'verifyWasFulfilled',
			value: function verifyWasFulfilled() {
				if (this.callStack.length) {
					expect(this.callStack.length).toBe(0);
				}
			}
		}]);

		return RequestorMock;
	}();

	module.exports = RequestorMock;

/***/ }
/******/ ]);