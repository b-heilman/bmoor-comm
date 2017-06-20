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
		connect: __webpack_require__(2),
		mock: __webpack_require__(10),
		Requestor: __webpack_require__(6),
		restful: __webpack_require__(5),
		testing: {
			Requestor: __webpack_require__(11)
		}
	};

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	module.exports = {
		Feed: __webpack_require__(3),
		Repo: __webpack_require__(8),
		Storage: __webpack_require__(9)
	};

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var bmoor = __webpack_require__(4),
	    restful = __webpack_require__(5);

	function searchEncode(args) {
		Object.keys(args).forEach(function (key) {
			var t = args[key];

			if (bmoor.isString(t)) {
				args[key] = encodeURIComponent(t);
			} else if (bmoor.isObject(t)) {
				searchEncode(t);
			} else {
				args[key] = t;
			}
		});

		return args;
	}

	var Feed = function Feed(ops, settings) {
		var _this = this,
		    _arguments = arguments;

		_classCallCheck(this, Feed);

		// settings => inflate, deflate
		if (!settings) {
			settings = {};
		}

		if (bmoor.isString(ops.read)) {
			ops.read = {
				url: ops.read
			};
		}

		if (bmoor.isString(ops.all)) {
			ops.all = {
				url: ops.all
			};
		}

		if (bmoor.isString(ops.list)) {
			ops.list = {
				url: ops.list
			};
		}

		if (bmoor.isString(ops.create)) {
			ops.create = {
				url: ops.create,
				method: 'POST'
			};
		}

		if (bmoor.isString(ops.update)) {
			ops.update = {
				url: ops.update,
				method: 'PUT'
			};
		}

		if (bmoor.isString(ops.search)) {
			ops.search = {
				url: ops.search,
				method: 'GET'
			};
		} else if (bmoor.isString(ops.query)) {
			ops.search = {
				url: function url(ctx) {
					return ops.query + '?query=' + JSON.stringify(searchEncode(ctx.$args));
				},
				method: 'GET'
			};
		}

		// TODO : a way to have get use all and find by id?
		if (settings.inflate) {
			//ops.read
			ops.read.success = function (res) {
				return settings.inflate(res);
			};

			//ops.all
			ops.all.success = function (res) {
				var i,
				    c,
				    d = res;

				for (i = 0, c = d.length; i < c; i++) {
					d[i] = settings.inflate(d[i]);
				}

				return d;
			};
		}

		//ops.list
		if (settings.minimize) {
			if (!ops.list) {
				ops.list = {};
			}

			ops.list.intercept = function () {
				return _this.all.apply(_this, _arguments).then(function (d) {
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

		if (!ops.list) {
			this.list = function () {
				return this.all.apply(this, arguments);
			};
		}

		function encode(datum, args) {
			var d = datum ? datum : args;

			return settings.deflate ? settings.deflate(d) : d;
		}

		//ops.create
		if (ops.create) {
			ops.create.encode = encode;
		}

		//ops.update
		if (ops.update) {
			ops.update.encode = encode;
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
			if (ops.read) {
				ops.read.prep = prep;
			}

			if (ops.update) {
				ops.update.prep = prep;
			}
		}

		restful(this, ops);
	};

	module.exports = Feed;

/***/ },
/* 4 */
/***/ function(module, exports) {

	module.exports = bmoor;

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var bmoor = __webpack_require__(4),
	    Requestor = __webpack_require__(6);

	module.exports = function (obj, definition) {
		bmoor.iterate(definition, function (def, name) {
			var fn, req;

			if (bmoor.isFunction(def)) {
				obj[name] = def;
			} else {
				req = new Requestor(def);
				fn = function restfulRequest(args, datum, settings) {
					return req.go(args, datum, settings);
				};

				fn.$settings = def;

				obj[name] = fn;
			}
		});
	};

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var bmoor = __webpack_require__(4),
	    Promise = __webpack_require__(7).Promise,
	    Eventing = bmoor.Eventing;

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
	    events = new Eventing(),
	    deferred = {},
	    defaultSettings = {
		comm: {},
		linger: null,
		headers: {},
		method: 'GET'
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
			value: function go(args, datum, settings) {
				var _this = this;

				var ctx,
				    reference,
				    url = this.getSetting('url'),
				    prep = this.getSetting('prep'),
				    cached = this.getSetting('cached'),
				    method = this.getSetting('method').toUpperCase(),
				    context = this.getSetting('context');

				if (!settings) {
					settings = {};
				}

				if (prep) {
					ctx = Object.create(prep(args));
					ctx.$args = args;
				} else if (args) {
					ctx = Object.create(args);
					ctx.$args = args;
				} else {
					ctx = { $args: {} };
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
					var v = ctx.$getSetting(setting);

					if (bmoor.isString(v) && setting === 'url') {
						// allow all strings to be called via formatter
						v = settings[setting] = bmoor.string.getFormatter(v.replace(/\}\}/g, '|url}}'));
					}

					if (bmoor.isFunction(v)) {
						return v.call(context, ctx, datum);
					} else {
						return v;
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
						res = _this.response(_this.request(ctx, datum), ctx);

						if (method === 'GET') {
							deferred[reference] = res;
						}

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
			value: function request(ctx, datum) {
				var req,
				    fetched,
				    url = ctx.$evalSetting('url'),
				    comm = ctx.$getSetting('comm'),
				    code = ctx.$getSetting('code'),
				    method = this.getSetting('method'),
				    encode = ctx.$getSetting('encode'),
				    fetcher = this.getSetting('fetcher'),
				    headers = ctx.$evalSetting('headers'),
				    intercept = ctx.$getSetting('intercept');

				if (encode) {
					datum = encode(datum, ctx.$args);
				}

				events.trigger('request', url, datum);

				if (intercept) {
					if (bmoor.isFunction(intercept)) {
						intercept = intercept(datum, ctx);
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
				    decode = ctx.$getSetting('decode'),
				    always = ctx.$getSetting('always'),
				    success = ctx.$getSetting('success'),
				    failure = ctx.$getSetting('failure'),
				    context = ctx.$getSetting('context'),
				    validation = ctx.$getSetting('validation');

				t = bmoor.promise.always(q, function () {
					events.trigger('response');

					if (always) {
						always.call(context, ctx);
					}
				}).then(function (fetched) {
					// we hava successful transmition
					var res,
					    code = ctx.$getSetting('code');

					response = fetched;

					if (code && fetched.status !== code) {
						throw new Error('Requestor::code');
					} else if (fetched.status && (fetched.status < 200 || 299 < fetched.status)) {
						throw new Error('Requestor::status');
					}

					res = decode ? decode(fetched) : fetched.json ? fetched.json() : fetched;

					if (validation) {
						// invalid, throw Error
						if (!validation.call(context, res, ctx, fetched)) {
							throw new Error('Requestor::validation');
						}
					}

					return success ? success.call(context, res, ctx) : res;
				});

				t.then(function (res) {
					events.trigger('success', res, response);
				}, function (error) {
					events.trigger('failure', error, response);

					if (failure) {
						error.response = response;

						failure.call(context, error, ctx);
					}
				});

				return t;
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
	Requestor.events = events;
	Requestor.clearCache = function () {
		cache = {};
		deferred = {};
	};

	module.exports = Requestor;

/***/ },
/* 7 */
/***/ function(module, exports) {

	module.exports = ES6Promise;

/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	module.exports = __webpack_require__(4).Memory.use('uhaul');

/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var bmoor = __webpack_require__(4),
	    uhaul = __webpack_require__(8),
	    Promise = __webpack_require__(7).Promise;

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

		// return only one


		_createClass(Storage, [{
			key: 'read',
			value: function read(qry) {
				var _this2 = this;

				var key;

				return this.all().then(function () {
					var t;

					if (bmoor.isObject(qry)) {
						key = qry[_this2.id];

						if (!key) {
							return _this2.search(qry).then(function (res) {
								return res[0];
							});
						}
					} else {
						key = qry;
					}

					t = _this2.$index[key];

					if (t) {
						return t;
					} else {
						throw { error: 'Storage:read' };
					}
				});
			}

			// return an unedited list of all

		}, {
			key: 'all',
			value: function all(qry) {
				var _this3 = this;

				if (!this.$collection.length && this.feed) {
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
			key: '_create',
			value: function _create(obj) {
				this.$index[obj[this.id]] = obj;
				this.$collection.push(obj);

				this.save();

				return obj;
			}
		}, {
			key: 'create',
			value: function create(obj) {
				var id = Date.now() + '-' + this.$collection.length;

				if (this.feed) {
					return this.feed.create(obj).then(this._create.bind(this));
				} else {
					obj[this.id] = id;

					return Promise.resolve(this._create(obj));
				}
			}
		}, {
			key: 'update',
			value: function update(qry, obj) {
				var _this4 = this;

				var t;

				if (this.feed) {
					t = this.feed.update(qry, obj);
				} else {
					t = Promise.resolve('OK');
				}

				return t.then(function () {
					if (obj) {
						return _this4.read(qry).then(function (res) {
							if (res) {
								bmoor.object.extend(res, obj);
							}

							_this4.save();

							return 'OK';
						});
					} else {
						_this4.save();

						return 'OK';
					}
				});
			}
		}, {
			key: 'delete',
			value: function _delete(qry) {
				var _this5 = this;

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
					bmoor.array.remove(_this5.$collection, trg);
					_this5.$index[trg[_this5.id]] = undefined;

					_this5.save();

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
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var bmoor = __webpack_require__(4);

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
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var Promise = __webpack_require__(7).Promise,
	    Requestor = __webpack_require__(6);

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
				Requestor.$settings.fetcher = function (url, ops) {
					var t, p;

					if (_this.callStack.length) {
						t = _this.callStack.shift();

						expect(t.url).toEqual(url);
						if (t.params) {
							expect(t.params).toEqual(ops.body);
						}

						p = Promise.resolve({
							json: function json() {
								return t.res || 'OK';
							},
							status: t.code || 200
						});

						return p;
					} else {
						expect('callStack.length').toBe('not zero');
					}
				};
			}
		}, {
			key: 'expect',
			value: function expect(url, params) {
				var t = {
					url: url,
					params: params
				};

				this.callStack.push(t);

				return {
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