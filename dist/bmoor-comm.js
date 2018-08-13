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
		mock: __webpack_require__(15),
		Url: __webpack_require__(11),
		Requestor: __webpack_require__(10),
		restful: __webpack_require__(9),
		testing: {
			Requestor: __webpack_require__(16)
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
		Repo: __webpack_require__(13),
		Storage: __webpack_require__(14)
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

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var bmoor = __webpack_require__(8),
	    Model = __webpack_require__(4).Model,
	    restful = __webpack_require__(9);

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

		if (ops instanceof Model) {
			settings.id = ops.get('id');

			ops = {
				read: ops.get('path') + ('/' + ops.get('name') + '/instance/{{' + ops.get('id') + '}}'), // GET
				readMany: ops.get('path') + ('/' + ops.get('name') + '/many?id[]={{' + ops.get('id') + '}}'), // GET
				all: ops.get('path') + ('/' + ops.get('name')), // GET
				list: ops.get('path') + ('/' + ops.get('name') + '/list'), // GET
				query: ops.get('path') + ('/' + ops.get('name')), // GET
				create: ops.get('path') + ('/' + ops.get('name')), // POST
				update: {
					url: ops.get('path') + ('/' + ops.get('name') + '/{{' + ops.get('id') + '}}'),
					method: 'PATCH'
				},
				delete: ops.get('path') + ('/' + ops.get('name') + '/{{' + ops.get('id') + '}}') // DELETE
			};
		}

		if (bmoor.isString(ops.read)) {
			ops.read = {
				url: ops.read
			};
		}

		if (bmoor.isString(ops.readMany)) {
			ops.readMany = {
				url: ops.readMany
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

		if (bmoor.isString(ops.delete)) {
			ops.delete = {
				url: ops.delete,
				method: 'DELETE'
			};
		}

		if (bmoor.isString(ops.search)) {
			ops.search = {
				url: ops.search,
				method: 'GET'
			};
		} else if (bmoor.isObject(ops.search) && !ops.search.url) {
			var methods = ops.search,
			    keys = Object.keys(methods);

			ops.search = {
				url: function url(args) {
					var dex = null;

					for (var i = 0, c = keys.length; i < c && dex === null; i++) {
						if (args[keys[i]]) {
							dex = i;
						}
					}

					return methods[keys[dex]];
				},
				method: 'GET'
			};
		}

		if (bmoor.isString(ops.query)) {
			var query = ops.query;

			ops.query = {
				url: function url(args) {
					return query + '?query=' + JSON.stringify(searchEncode(args));
				},
				method: 'GET'
			};
		} else if (bmoor.isObject(ops.query) && !ops.query.url) {
			var _methods = ops.query,
			    _keys = Object.keys(_methods);

			ops.query = {
				url: function url(args) {
					var dex = null;

					for (var i = 0, c = _keys.length; i < c && dex === null; i++) {
						if (args[_keys[i]]) {
							dex = i;
						}
					}

					return _methods[_keys[dex]];
				},
				method: 'GET'
			};
		}

		if (settings.inflate) {
			var singular = function singular(res) {
				return settings.inflate(res);
			},
			    multiple = function multiple(res) {
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

		if (settings.base) {
			bmoor.object.extend(this, settings.base);
		}

		restful(this, ops);
	};

	module.exports = Feed;

/***/ },
/* 8 */
/***/ function(module, exports) {

	module.exports = bmoor;

/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var bmoor = __webpack_require__(8),
	    Requestor = __webpack_require__(10);

	module.exports = function (obj, definition) {
		bmoor.each(definition, function (def, name) {
			var fn, req;

			if (def) {
				// at least protect from undefined and null
				if (bmoor.isFunction(def)) {
					obj[name] = def;
				} else {
					if (bmoor.isString(def)) {
						def = { url: def };
					}

					req = new Requestor(def);

					if (def.interface) {
						fn = function restfulRequest() {
							var commands = def.interface.apply(this, arguments);

							return req.go(commands.args, commands.datum, commands.settings);
						};
					} else {
						fn = function restfulRequest(args, datum, settings) {
							return req.go(args, datum, settings);
						};
					}

					fn.$settings = def;

					obj[name] = fn;
				}
			}
		});
	};

/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var Url = __webpack_require__(11),
	    bmoor = __webpack_require__(8),
	    Promise = __webpack_require__(12).Promise,
	    Eventing = bmoor.Eventing;

	/*
	settings :
		message sending
		- url
		- method
		- encode : process the parsed in args
		- preload : run against ctx before send
		- cached : should the request be cached, cached never clear

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

	var events = new Eventing(),
	    requestors = [],
	    defaultSettings = {
		comm: {},
		linger: null,
		headers: {},
		method: 'GET'
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
					} else if (deferred[reference]) {
						return deferred[reference];
					} else {
						res = _this.response(_this.request(ctx, datum, url, method), ctx);

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
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var bmoor = __webpack_require__(8),
	    parser = /[\?&;]([^=]+)\=([^&;#]+)/g,
	    getFormatter = bmoor.string.getFormatter;

	function stack(old, variable, value) {
		var rtn,
		    fn = getFormatter(value);

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

	var Url = function Url(url) {
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

		this.go = function (obj) {
			var u = path(obj);

			if (query) {
				if (bmoor.isArray(obj)) {
					obj.forEach(function (v, i) {
						if (i) {
							u += '&';
						} else {
							u += '?';
						}

						u += query(v);
					});
				} else {
					u += '?' + query(obj);
				}
			}

			return u;
		};
	};

	module.exports = Url;

/***/ },
/* 12 */
/***/ function(module, exports) {

	module.exports = ES6Promise;

/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	module.exports = __webpack_require__(8).Memory.use('uhaul');

/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var bmoor = __webpack_require__(8),
	    uhaul = __webpack_require__(13),
	    Promise = __webpack_require__(12).Promise;

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
/* 15 */
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
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var Promise = __webpack_require__(12).Promise,
	    Requestor = __webpack_require__(10);

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