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

	module.exports = __webpack_require__(1);

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	module.exports = {
		Requestor: __webpack_require__(2),
		restful: __webpack_require__(4),
		mock: __webpack_require__(5)
	};

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var bmoor = __webpack_require__(3);

	/*
	settings :
		message sending
		- url
		- method
		- encode : process the parsed in args
		- preload : run against ctx before send
		- cached : should the request be cached, cached never clear
		- context : evaluate variables against this context

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
		- linger : how long does a request remain deferred
	*/

	var cache = {},
	    deferred = {},
	    defaultSettings = {
		comm: {},
		linger: 0,
		headers: {}
	};

	var Requestor = function () {
		function Requestor(settings) {
			_classCallCheck(this, Requestor);

			this.getSetting = function (setting) {
				if (setting in settings) {
					return settings[setting];
				} else {
					return defaultSettings[setting];
				}
			};
		}

		_createClass(Requestor, [{
			key: 'go',
			value: function go(args, settings) {
				var _this = this;

				var ctx,
				    reference,
				    url = this.getSetting('url'),
				    cached = this.getSetting('cached'),
				    encode = this.getSetting('encode'),
				    method = this.getSetting('method'),
				    context = this.getSetting('context');

				if (!settings) {
					settings = {};
				}

				if (encode) {
					ctx = encode(args);
				} else {
					ctx = args;
				}

				// some helping functions
				ctx.$getSetting = function (setting) {
					if (setting in settings) {
						return settings[setting];
					} else {
						return _this.getSetting(setting);
					}
				};

				ctx.$evalSetting = function (setting) {
					setting = ctx.$getSetting(setting);
					if (bmoor.isFunction(setting)) {
						return setting.call(context, ctx);
					} else {
						return setting;
					}
				};

				url = ctx.$evalSetting('url');
				reference = method + '::' + url;

				ctx.$ref = reference;

				return Promise.resolve(ctx.$evalSetting('preload')).then(function () {
					var res;

					if (cached && cache[reference]) {
						return cache[reference];
					} else if (deferred[reference]) {
						return deferred[reference];
					} else {
						res = _this.response(_this.request(ctx), ctx);

						deferred[reference] = res;

						if (settings.cached) {
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
			value: function request(ctx) {
				var fetched,
				    url = ctx.$evalSetting('url'),
				    comm = ctx.$getSetting('comm'),
				    code = ctx.$getSetting('code'),
				    data = ctx.$evalSetting('data'),
				    method = this.getSetting('method') || 'GET',
				    fetcher = this.getSetting('fetcher'),
				    headers = ctx.$evalSetting('headers'),
				    intercept = ctx.$getSetting('intercept');

				if (intercept) {
					if (bmoor.isFunction(intercept)) {
						intercept = intercept(data, ctx);
					}

					// here we intercept the request, and respond back with a fetch like object
					if (intercept.then) {
						return intercept.then(function (v) {
							return {
								json: function json() {
									return v;
								},
								status: code || 200
							};
						});
					} else {
						return Promise.resolve({
							json: function json() {
								return intercept;
							},
							status: code || 200
						});
					}
				} else {
					fetched = fetcher(url, bmoor.object.extend({
						'body': data,
						'method': method,
						'headers': headers
					}, comm));

					return Promise.resolve(fetched).then(function (res) {
						var error;

						if (code) {
							// we expect a particular http response status code
							if (code === res.status) {
								return res;
							}
						} else if (res.status >= 200 && res.status < 300) {
							return res;
						}

						error = new Error(res.statusText);
						error.response = res;

						throw error;
					});
				}
			}
		}, {
			key: 'response',
			value: function response(q, ctx) {
				var decode = ctx.$getSetting('decode'),
				    always = ctx.$getSetting('always'),
				    success = ctx.$getSetting('success'),
				    failure = ctx.$getSetting('failure'),
				    context = ctx.$getSetting('context'),
				    validation = ctx.$getSetting('validation');

				return bmoor.promise.always(bmoor.promise.always(q, function () {
					if (always) {
						always.call(context, ctx);
					}
				}).then(function (fetchedReponse) {
					// we hava successful transmition
					var res = decode ? decode(fetchedReponse) : fetchedReponse.json ? fetchedReponse.json() : fetchedReponse; // am I ok with this?

					if (validation) {
						// invalid, throw Error
						validation.call(context, res, ctx);
					}

					if (success) {
						return success.call(context, res, ctx);
					} else {
						return res;
					}
				}), function (response) {
					if (response instanceof Error) {
						failure.call(context, ctx);
					}
				});
			}
		}, {
			key: 'close',
			value: function close(ctx) {
				var linger = ctx.$getSetting('linger');

				if (linger !== null) {
					setTimeout(function () {
						deferred[ctx.$ref] = null;
					}, linger);
				} else {
					deferred[ctx.$ref] = null;
				}
			}
		}]);

		return Requestor;
	}();

	Requestor.$settings = defaultSettings;
	Requestor.clearCache = function () {
		cache = {};
		deferred = {};
	};

	module.exports = Requestor;

/***/ },
/* 3 */
/***/ function(module, exports) {

	module.exports = bmoor;

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var bmoor = __webpack_require__(3),
	    Requestor = __webpack_require__(2);

	module.exports = function (obj, definition) {
		bmoor.iterate(definition, function (def, name) {
			var req = new Requestor(def),
			    fn = function fn(args) {
				return req.go(args);
			};

			fn.$settings = def;

			obj[name] = fn;
		});
	};

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var bmoor = __webpack_require__(3);

	module.exports = function (obj, interceptions) {
		var orig = {};

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

/***/ }
/******/ ]);