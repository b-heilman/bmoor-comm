

/**
 * Older versions of Node may require
 * ------------
 * import { URLSearchParams } from 'url';
 * global.URLSearchParams = URLSearchParams
 **/
const bmoor = require('bmoor');
const Model = require('./Model.js').Model;
const restful = require('../restful.js');
const {makeSwitchableUrl} = require('./factory.js');

function applyRoutes(target, ops, settings = {}){
	// settings => inflate, deflate

	if ( ops instanceof Model ){
		settings.id = ops.get('id');

		ops = {
			// GET : access one instance of the collection by id
			read: ops.get('path')+`/${ops.get('name')}/instance/{{${ops.get('id')}}}`,
			// GET : access many instances of the collection by id
			readMany: ops.get('path')+`/${ops.get('name')}/many?id[]={{${ops.get('id')}}}`, 
			// GET : access all instances of the collection
			all: ops.get('path')+`/${ops.get('name')}`,
			// GET : access all instances of a collection, but only an abridged version
			list: ops.get('path')+`/${ops.get('name')}/list`, 
			// GET : query the collection
			query: ops.get('path')+`/${ops.get('name')}`, 
			// POST : create an instance in the collection
			create: ops.get('path')+`/${ops.get('name')}`, 
			// PATCH / PUT : Update an object in the collection
			update: {
				url: ops.get('path')+`/${ops.get('name')}/{{${ops.get('id')}}}`,
				method: 'PATCH'
			},
			// DELETE : Delete an instance from the collection
			delete: ops.get('path')+`/${ops.get('name')}/{{${ops.get('id')}}}` 
		};
	}

	if (ops.read && !bmoor.isObject(ops.read)){
		ops.read = {
			url: ops.read
		};
	}

	if (ops.readMany && !bmoor.isObject(ops.readMany)){
		ops.readMany = {
			url: ops.readMany
		};
	}

	if (ops.all && !bmoor.isObject(ops.all)){
		ops.all = {
			url: ops.all
		};
	}

	if (ops.list && !bmoor.isObject(ops.list)){
		ops.list = {
			url: ops.list
		};
	}

	if (ops.create && !bmoor.isObject(ops.create)){
		ops.create = {
			url: ops.create,
			method: 'POST'
		};
	}

	if (ops.update && !bmoor.isObject(ops.update)){
		ops.update = {
			url: ops.update,
			method: 'PUT'
		};
	}

	if (ops.delete && !bmoor.isObject(ops.delete)){
		ops.delete = {
			url: ops.delete,
			method: 'DELETE'
		};
	}

	if (ops.search && !bmoor.isObject(ops.search)){
		ops.search = {
			url: ops.search,
			method: 'GET'
		};
	} else if (bmoor.isObject(ops.search) && !ops.search.url){
		let generator = null;

		const routes = ops.search;

		if (target.search){
			generator = target.search.$settings.url;
			ops.search = null;
		} else {
			generator = makeSwitchableUrl();
			ops.search = {
				url: generator,
				method: 'GET'
			};
		}

		for (let key in routes){
			generator.append(key, routes[key]);
		}
	}

	if (bmoor.isString(ops.query)){
		const base = ops.query;
		
		ops.query = {
			url: function(args){
				const searchParams = new URLSearchParams('');

				args = bmoor.object.implode(args);

				for(let key in args){
					searchParams.append(key, args[key]);
				}

				return base + '?' + searchParams.toString();
			},
			method: 'GET'
		};
	}

	if ( settings.inflate ){
		const singular = function( res ){
			return settings.inflate( res );
		};
		const multiple = function( res ){
			if ( bmoor.isArray(res) ){
				return res.map( settings.inflate );
			}else{
				return settings.inflate( res );
			}
		};

		if ( ops.read && !ops.read.success ){
			ops.read.success = singular;
		}

		if ( ops.all && !ops.all.success ){
			ops.all.success = multiple;
		}

		if ( ops.create && !ops.create.success ){
			ops.create.success = singular;
		}

		if ( ops.update && !ops.update.success ){
			ops.update.success = singular;
		}

		if ( ops.search && !ops.search.success ){
			ops.search.success = multiple;
		}

		if ( ops.query && !ops.query.success ){
			ops.query.success = multiple;
		}
	}
	
	//ops.list
	if ( settings.minimize ){
		if ( !ops.list ){
			ops.list = {};
		}

		ops.list.intercept = (...args) => {
			return target.all(...args)
			.then(function( d ){
				var i, c,
					rtn = [];
				
				for( i = 0, c = d.length; i < c; i++ ){
					rtn.push( settings.minimize(d[i]) );
				}

				return rtn;
			});
		};
	}

	if (!ops.list && ops.all){
		ops.list = function(...args){
			return target.all(...args);
		};
	}
	
	function encode(datum, args) {
		var d = datum ? datum : args;

		return settings.deflate ? settings.deflate(d) : d;
	}

	//ops.create
	if ( ops.create && !ops.create.encode ){
		ops.create.encode = encode;
	}
	
	//ops.update
	if ( ops.update && !ops.update.encode ){
		ops.update.encode = encode;
	}

	//ops.update
	if ( ops.delete && !ops.delete.encode ){
		ops.delete.encode = encode;
	}

	function prep( args ){
		var t;

		if ( bmoor.isObject(args) ){
			return args;
		}else{
			t = {};
			t[ settings.id ] = args;

			return t;
		}
	}

	if ( settings.id ){
		if ( ops.read && !ops.read.prep ){
			ops.read.prep = prep;
		}

		if ( ops.update && !ops.update.prep ){
			ops.update.prep = prep;
		}

		if ( ops.delete && !ops.delete.prep ){
			ops.delete.prep = prep;
		}

		if ( ops.readMany && !ops.readMany.prep ){
			ops.readMany.prep = function( args ){
				if ( bmoor.isArray(args) ){
					args.forEach(function( v, i ){
						if ( !bmoor.isObject(v) ){
							let t = {};

							t[ settings.id ] = v;

							args[i] = t;
						}
					});

					return args;
				}else{
					if ( bmoor.isObject(args) ){
						return [args];
					}else{
						let t = {};
						t[ settings.id ] = args;

						return [t];
					}
				}
			};
		}
	}
	
	restful(target, ops);
}

module.exports = {
	applyRoutes
};
