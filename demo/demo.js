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
		mock: __webpack_require__(36),
		Url: __webpack_require__(29),
		Requestor: __webpack_require__(28),
		restful: __webpack_require__(27),
		Sitemap: __webpack_require__(37).Sitemap,
		testing: {
			Requestor: __webpack_require__(38)
		}
	};

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	module.exports = {
		sql: __webpack_require__(3),
		mysql: __webpack_require__(5),
		model: __webpack_require__(4),
		router: __webpack_require__(6),
		Feed: __webpack_require__(7),
		Repo: __webpack_require__(34),
		Storage: __webpack_require__(35)
	};

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var ConnectionModel = __webpack_require__(4).Model;

	function buildSelect(model, type) {
		var alias = model.get('alias') || {},
		    fields = model.get(type).map(function (field) {
			if (alias[field]) {
				return alias[field] + ' as ' + field;
			} else {
				return '`' + field + '`';
			}
		});

		return fields.join(', ');
	}

	function buildStack(model, type, fn) {
		var prune;

		model.get(type).forEach(function (field) {
			if (prune) {
				var old = prune;
				prune = function prune(obj) {
					var rtn = old(obj);

					fn(obj, field, rtn);

					return rtn;
				};
			} else {
				prune = function prune(obj) {
					var rtn = {};

					fn(obj, field, rtn);

					return rtn;
				};
			}
		});

		return prune;
	}

	function doInsert(obj, field, rtn) {
		if (!rtn.fields) {
			rtn.fields = [field];
			rtn.values = [obj[field]];
		} else {
			rtn.fields.push(field);
			rtn.values.push(obj[field]);
		}
	}

	function doUpdate(obj, field, rtn) {
		if (field in obj) {
			rtn[field] = obj[field];
		}
	}

	/* model
	id: primary id field, assumed id
	table: the fable to do this
	select: fields that can be selected
	list: fields that are a subset of select, defaults to select
	alias: what the really call a field
	insert: fields allows to be inserted
	update: fields allowed to be updated
	*/

	var Sql = function () {
		function Sql(model) {
			_classCallCheck(this, Sql);

			if (model instanceof ConnectionModel) {
				this.model = model;
			} else {
				this.model = new ConnectionModel(model);
			}

			// I don't want these to be defined by setModel
			this.select = buildSelect(this.model, 'select');

			if (this.model.get('short')) {
				this.short = buildSelect(this.model, 'short');
			} else {
				this.short = this.select;
			}

			this.cleanInsert = buildStack(this.model, 'insert', doInsert);
			this.cleanUpdate = buildStack(this.model, 'update', doUpdate);
		}

		_createClass(Sql, [{
			key: 'read',
			value: function read(id) {
				return {
					query: '\n\t\t\t\tSELECT ' + this.select + '\n\t\t\t\tFROM ' + this.model.get('table') + '\n\t\t\t\tWHERE ' + this.model.get('id') + ' = ?;\n\t\t\t',
					params: [id]
				};
			}
		}, {
			key: 'readMany',
			value: function readMany(ids) {
				return {
					query: '\n\t\t\t\tSELECT ' + this.select + '\n\t\t\t\tFROM ' + this.model.get('table') + '\n\t\t\t\tWHERE ' + this.model.get('id') + ' IN (?);\n\t\t\t',
					params: [ids]
				};
			}
		}, {
			key: 'all',
			value: function all() {
				return {
					query: '\n\t\t\t\tSELECT ' + this.select + '\n\t\t\t\tFROM ' + this.model.get('table') + ';\n\t\t\t',
					params: []
				};
			}
		}, {
			key: 'list',
			value: function list() {
				return {
					query: '\n\t\t\t\tSELECT ' + this.short + '\n\t\t\t\tFROM ' + this.model.get('table') + ';\n\t\t\t',
					params: []
				};
			}
		}, {
			key: 'search',
			value: function search(datum, short) {
				var sql = [],
				    params = [];

				Object.keys(datum).forEach(function (key) {
					sql.push(key + ' = ?');
					params.push(datum[key]);
				});

				return {
					query: '\n\t\t\t\tSELECT ' + (short ? this.short : this.select) + '\n\t\t\t\tFROM ' + this.model.get('table') + '\n\t\t\t\tWHERE ' + sql.join(' AND ') + ';\n\t\t\t',
					params: params
				};
			}
		}, {
			key: 'create',
			value: function create(datum) {
				var t = this.cleanInsert(datum);

				return {
					query: '\n\t\t\t\tINSERT INTO ' + this.model.get('table') + '\n\t\t\t\t(' + t.fields.join(',') + ') VALUES (?);\n\t\t\t',
					params: [t.values]
				};
			}
		}, {
			key: 'update',
			value: function update(id, delta) {
				return {
					query: '\n\t\t\t\tUPDATE ' + this.model.get('table') + ' SET ?\n\t\t\t\tWHERE ' + this.model.get('id') + ' = ?;\n\t\t\t',
					params: [this.cleanUpdate(delta), id]
				};
			}
		}, {
			key: 'delete',
			value: function _delete(id) {
				return {
					query: '\n\t\t\t\tDELETE FROM ' + this.model.get('table') + '\n\t\t\t\tWHERE ' + this.model.get('id') + ' = ?;\n\t\t\t',
					params: [id]
				};
			}
		}]);

		return Sql;
	}();

	module.exports = {
		Sql: Sql,
		buildSelect: buildSelect,
		buildInsert: function buildInsert(model) {
			return buildStack(model, doInsert);
		},
		buildUpdate: function buildUpdate(model) {
			return buildStack(model, doUpdate);
		}
	};

/***/ },
/* 4 */
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
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var Sql = __webpack_require__(3).Sql;

	function returnOne(model, multiple) {
		return function (res) {
			var rtn = multiple ? res[res.length - 1][0] : res[0],
			    inflate = model.get('inflate');

			if (inflate) {
				inflate(rtn);
			}

			return rtn;
		};
	}

	function returnMany(model, multiple) {
		return function (res) {
			var rtn = multiple ? res[res.length - 1] : res,
			    inflate = model.get('inflate');

			if (inflate) {
				rtn.forEach(inflate);
			}

			return rtn;
		};
	}

	var Mysql = function (_Sql) {
		_inherits(Mysql, _Sql);

		function Mysql() {
			_classCallCheck(this, Mysql);

			return _possibleConstructorReturn(this, (Mysql.__proto__ || Object.getPrototypeOf(Mysql)).apply(this, arguments));
		}

		_createClass(Mysql, [{
			key: 'eval',
			value: function _eval(exec) {
				return this.model.get('execute')(exec.query, exec.params);
			}
		}, {
			key: 'read',
			value: function read(id) {
				var exec = _get(Mysql.prototype.__proto__ || Object.getPrototypeOf(Mysql.prototype), 'read', this).call(this, id);

				return this.eval(exec).then(returnOne(this.model));
			}
		}, {
			key: 'readMany',
			value: function readMany(ids) {
				var exec = _get(Mysql.prototype.__proto__ || Object.getPrototypeOf(Mysql.prototype), 'readMany', this).call(this, ids);

				return this.eval(exec).then(returnMany(this.model));
			}
		}, {
			key: 'all',
			value: function all() {
				var exec = _get(Mysql.prototype.__proto__ || Object.getPrototypeOf(Mysql.prototype), 'all', this).call(this);

				return this.eval(exec).then(returnMany(this.model));
			}
		}, {
			key: 'list',
			value: function list() {
				var exec = _get(Mysql.prototype.__proto__ || Object.getPrototypeOf(Mysql.prototype), 'list', this).call(this);

				return this.eval(exec).then(returnMany(this.model));
			}
		}, {
			key: 'search',
			value: function search(datum, short) {
				var exec = _get(Mysql.prototype.__proto__ || Object.getPrototypeOf(Mysql.prototype), 'search', this).call(this, datum, short),
				    rtn = this.eval(exec);

				return rtn.then(returnMany(this.model));
			}
		}, {
			key: 'create',
			value: function create(datum) {
				var deflate = this.model.get('deflate');

				if (deflate) {
					deflate(datum);
				}

				var exec = _get(Mysql.prototype.__proto__ || Object.getPrototypeOf(Mysql.prototype), 'create', this).call(this, datum);

				exec.query += '\n\t\t\tSELECT ' + this.select + '\n\t\t\tFROM ' + this.model.get('table') + '\n\t\t\tWHERE ' + this.model.get('id') + ' = last_insert_id();\n\t\t';

				return this.eval(exec).then(returnOne(this.model, true));
			}
		}, {
			key: 'update',
			value: function update(id, datum) {
				var deflate = this.model.get('deflate');

				if (deflate) {
					deflate(datum);
				}

				var exec = _get(Mysql.prototype.__proto__ || Object.getPrototypeOf(Mysql.prototype), 'update', this).call(this, id, datum);

				exec.query += '\n\t\t\tSELECT ' + this.select + '\n\t\t\tFROM ' + this.model.get('table') + '\n\t\t\tWHERE ' + this.model.get('id') + ' = ?;\n\t\t';

				exec.params.push(id);

				return this.eval(exec).then(returnOne(this.model, true));
			}
		}, {
			key: 'delete',
			value: function _delete(id) {
				var exec = _get(Mysql.prototype.__proto__ || Object.getPrototypeOf(Mysql.prototype), 'delete', this).call(this, id);

				return this.eval(exec).then(function () {
					return 'OK';
				});
			}
		}]);

		return Mysql;
	}(Sql);

	module.exports = {
		Mysql: Mysql
	};

/***/ },
/* 6 */
/***/ function(module, exports) {

	'use strict';

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var Router = function () {
		function Router(connector) {
			_classCallCheck(this, Router);

			this.connector = connector;
		}

		// all get route should be called with ( params, query )


		_createClass(Router, [{
			key: 'getRoutes',
			value: function getRoutes() {
				var _this = this;

				var ops = this.connector.model,
				    rtn = [{ // read
					url: ops.get('path') + ('/' + ops.get('name') + '/instance/:id'),
					method: 'get',
					fn: function fn(params) {
						return _this.connector.read(params.id);
					}
				}, { // all, getMany: ops.get('path+`/${ops.get('name}?id[]={{${ops.get('id}}}`
					url: ops.get('path') + ('/' + ops.get('name') + '/many'),
					method: 'get',
					fn: function fn(params, query) {
						return _this.connector.readMany(query.id);
					}
				}, { // all, getMany: ops.get('path+`/${ops.get('name}?id[]={{${ops.get('id}}}`
					url: ops.get('path') + ('/' + ops.get('name')),
					method: 'get',
					fn: function fn() {
						return _this.connector.all();
					}
				}, { // list
					url: ops.get('path') + ('/' + ops.get('name') + '/list'),
					method: 'get',
					fn: function fn() {
						return _this.connector.list();
					}
				}, { // search: /test/search?query={"foo":"bar"}
					url: ops.get('path') + ('/' + ops.get('name') + '/search'),
					method: 'get',
					fn: function fn(params, query) {
						return _this.connector.search(JSON.parse(query.query));
					}
				}, { // create
					url: ops.get('path') + ('/' + ops.get('name')),
					method: 'post',
					fn: function fn(body) {
						return _this.connector.create(body);
					}
				}, { // update
					url: ops.get('path') + ('/' + ops.get('name') + '/:id'),
					method: 'patch',
					fn: function fn(params, body) {
						return _this.connector.update(params.id, body);
					}
				}, { // delete
					url: ops.get('path') + ('/' + ops.get('name') + '/:id'),
					method: 'delete',
					fn: function fn(params) {
						return _this.connector.delete(params.id);
					}
				}];

				rtn.$index = {
					read: rtn[0],
					readMany: rtn[1],
					all: rtn[2],
					list: rtn[3],
					search: rtn[4],
					create: rtn[5],
					update: rtn[6],
					delete: rtn[7]
				};

				return rtn;
			}
		}]);

		return Router;
	}();

	module.exports = {
		Router: Router
	};

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var bmoor = __webpack_require__(8);

	var _require = __webpack_require__(26),
	    applyRoutes = _require.applyRoutes;

	var Feed = function () {
		function Feed(ops) {
			var settings = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

			_classCallCheck(this, Feed);

			if (settings.base) {
				bmoor.object.extend(this, settings.base);
			}

			if (ops) {
				this.addRoutes(ops, settings);
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

	module.exports = Feed;

/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var bmoor = Object.create(__webpack_require__(9));

	bmoor.dom = __webpack_require__(10);
	bmoor.data = __webpack_require__(11);
	bmoor.flow = __webpack_require__(12);
	bmoor.array = __webpack_require__(16);
	bmoor.build = __webpack_require__(17);
	bmoor.object = __webpack_require__(21);
	bmoor.string = __webpack_require__(22);
	bmoor.promise = __webpack_require__(23);

	bmoor.Memory = __webpack_require__(24);
	bmoor.Eventing = __webpack_require__(25);

	module.exports = bmoor;

/***/ },
/* 9 */
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
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var bmoor = __webpack_require__(9),
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
/* 11 */
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
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	module.exports = {
		soon: __webpack_require__(13),
		debounce: __webpack_require__(14),
		window: __webpack_require__(15)
	};

/***/ },
/* 13 */
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
/* 14 */
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
/* 15 */
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
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	/**
	 * Array helper functions
	 * @module bmoor.array
	 **/

	var bmoor = __webpack_require__(9);

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
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var bmoor = __webpack_require__(9),
	    mixin = __webpack_require__(18),
	    plugin = __webpack_require__(19),
	    decorate = __webpack_require__(20);

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
/* 18 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var bmoor = __webpack_require__(9);

	module.exports = function (to, from) {
		bmoor.iterate(from, function (val, key) {
			to[key] = val;
		});
	};

/***/ },
/* 19 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

	var bmoor = __webpack_require__(9);

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
/* 20 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

	var bmoor = __webpack_require__(9);

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
/* 21 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

	/**
	 * Object helper functions
	 * @module bmoor.object
	 **/

	var bmoor = __webpack_require__(9);

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
/* 22 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var bmoor = __webpack_require__(9);

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
/* 23 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var window = __webpack_require__(15);

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
/* 24 */
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
/* 25 */
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
/* 26 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	/**
	 * Older versions of Node may require
	 * ------------
	 * import { URLSearchParams } from 'url';
	 * global.URLSearchParams = URLSearchParams
	 **/
	var bmoor = __webpack_require__(8);
	var Model = __webpack_require__(4).Model;
	var restful = __webpack_require__(27);

	var _require = __webpack_require__(33),
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
/* 27 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var bmoor = __webpack_require__(8),
	    Requestor = __webpack_require__(28);

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
/* 28 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var Url = __webpack_require__(29),
	    bmoor = __webpack_require__(8),
	    Promise = __webpack_require__(30).Promise,
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
/* 29 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var bmoor = __webpack_require__(8);
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
/* 30 */
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
	      var vertx = __webpack_require__(32);
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
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(31), (function() { return this; }())))

/***/ },
/* 31 */
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
/* 32 */
/***/ function(module, exports) {

	/* (ignored) */

/***/ },
/* 33 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var bmoor = __webpack_require__(8);

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
/* 34 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	module.exports = __webpack_require__(8).Memory.use('uhaul');

/***/ },
/* 35 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var bmoor = __webpack_require__(8),
	    uhaul = __webpack_require__(34),
	    Promise = __webpack_require__(30).Promise;

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
/* 36 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var bmoor = __webpack_require__(8);

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
/* 37 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var Feed = __webpack_require__(7);

	var Sitemap = function () {
		function Sitemap(root) {
			_classCallCheck(this, Sitemap);

			this.root = root;
			this.map = {};
		}

		/**
	  * {
	  *   [service]: {
	  *     read:
	  *     readMany:
	  *     all:
	  *     query:
	  *     joins: {
	  *       [otherTable] : {
	  *         url:
	  *         param:
	  *       }
	  *     },
	  *     create:
	  *     update:
	  *     delete: 
	  *   }
	  * }
	  */


		_createClass(Sitemap, [{
			key: 'ingest',
			value: function ingest(config) {
				for (var service in config) {
					var feed = this.getFeed(service);

					var routes = config[service];
					feed.addRoutes({
						read: routes.read ? this.root + '/' + service + routes.read : null,
						readMany: routes.readMany ? this.root + '/' + service + routes.readMany : null,
						all: routes.all ? this.root + '/' + service + routes.all : null,
						query: routes.query ? this.root + '/' + service + routes.query : null,
						create: routes.create ? this.root + '/' + service + routes.create : null,
						update: routes.update ? this.root + '/' + service + routes.update : null,
						delete: routes.delete ? this.root + '/' + service + routes.delete : null
					});

					if (routes.joins) {
						for (var join in routes.joins) {
							var url = routes.joins[join];

							var _join$split = join.split(':'),
							    _join$split2 = _slicedToArray(_join$split, 2),
							    otherService = _join$split2[0],
							    param = _join$split2[1];

							var otherFeed = this.getFeed(otherService);

							var search = _defineProperty({}, service + (param ? ':' + param : ''), this.root + '/' + service + url);

							otherFeed.addRoutes({ search: search });
						}
					}
				}
			}
		}, {
			key: 'getFeed',
			value: function getFeed(service) {
				var feed = this.map[service];

				if (!feed) {
					feed = new Feed();
					this.map[service] = feed;
				}

				return feed;
			}
		}]);

		return Sitemap;
	}();

	module.exports = {
		Sitemap: Sitemap
	};

/***/ },
/* 38 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var Promise = __webpack_require__(30).Promise,
	    Requestor = __webpack_require__(28);

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
					var t, p;

					if (_this.callStack.length) {
						t = _this.callStack.shift();

						expect(t.url).toEqual(url);
						if (t.params) {
							expect(t.params).toEqual(ops.body);
						}

						if (t.other) {
							Object.keys(t.other).forEach(function (key) {
								t.other[key](ops[key]);
							});
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
			value: function expect(url, params, other) {
				var t = {
					url: url,
					other: other,
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