var bmoor = require('bmoor'),
	Model = require('./Model.js').Model,
	restful = require('../restful.js');

function searchEncode( args ){
	Object.keys( args ).forEach(function( key ){
		var t = args[key];

		if ( bmoor.isString(t) ){
			args[key] = encodeURIComponent( t );
		}else if ( bmoor.isObject(t) ){
			searchEncode( t );
		}else{
			args[key] = t;
		}
	});

	return args;
}

class Feed {
	constructor( ops, settings ){
		// settings => inflate, deflate
		if ( !settings ){
			settings = {};
		}

		if ( ops instanceof Model ){
			settings.id = ops.get('id');

			ops = {
				read: ops.get('path')+`/${ops.get('name')}/instance/{{${ops.get('id')}}}`, // GET
				readMany: ops.get('path')+`/${ops.get('name')}/many?id[]={{${ops.get('id')}}}`, // GET
				all: ops.get('path')+`/${ops.get('name')}`, // GET
				list: ops.get('path')+`/${ops.get('name')}/list`, // GET
				query: ops.get('path')+`/${ops.get('name')}/search`, // GET
				create: ops.get('path')+`/${ops.get('name')}`, // POST
				update: {
					url: ops.get('path')+`/${ops.get('name')}/{{${ops.get('id')}}}`,
					method: 'PATCH'
				},
				delete: ops.get('path')+`/${ops.get('name')}/{{${ops.get('id')}}}` // DELETE
			};
		}

		if ( bmoor.isString(ops.read) ){
			ops.read = {
				url: ops.read
			};
		}

		if ( bmoor.isString(ops.readMany) ){
			ops.readMany = {
				url: ops.readMany
			};
		}

		if ( bmoor.isString(ops.all) ){
			ops.all = {
				url: ops.all
			};
		}

		if ( bmoor.isString(ops.list) ){
			ops.list = {
				url: ops.list
			};
		}

		if ( bmoor.isString(ops.create) ){
			ops.create = {
				url: ops.create,
				method: 'POST'
			};
		}

		if ( bmoor.isString(ops.update) ){
			ops.update = {
				url: ops.update,
				method: 'PUT'
			};
		}

		if ( bmoor.isString(ops.delete) ){
			ops.delete = {
				url: ops.delete,
				method: 'DELETE'
			};
		}

		if ( bmoor.isString(ops.search) ){
			ops.search = {
				url: ops.search,
				method: 'GET'
			};
		}else if ( bmoor.isObject(ops.query) ){
			let methods = ops.query;
			let keys = Object.keys(methods);

			ops.search = {
				url: function( ctx ){
					var dex = null;

					for( let i = 0, c = keys.length; i < c && dex === null; i++ ){
						if ( ctx.$args[keys[i]] ){
							dex = i;
						}
					}

					 return methods[ keys[dex] ];
				},
				method: 'GET'
			};
		}else if ( bmoor.isString(ops.query) ){
			let query = ops.query;

			ops.search = {
				url: function( ctx ){
					return query + '?query=' + 
						JSON.stringify( 
							searchEncode( ctx.$args ) 
						);
				},
				method: 'GET'
			};
			delete ops.query;
		}

		// TODO : a way to have get use all and find by id?
		if ( settings.inflate ){
			//ops.read
			ops.read.success = function( res ){
				return settings.inflate( res );
			};

			//ops.all
			ops.all.success = function( res ){
				var i, c,
					d = res;
				
				for( i = 0, c = d.length; i < c; i++ ){
					d[i] = settings.inflate( d[i] );
				}

				return d;
			};
		}
		
		//ops.list
		if ( settings.minimize ){
			if ( !ops.list ){
				ops.list = {};
			}

			ops.list.intercept = () => {
				return this.all.apply( this, arguments ).then( function( d ){
					var i, c,
						rtn = [];
					
					for( i = 0, c = d.length; i < c; i++ ){
						rtn.push( settings.minimize(d[i]) );
					}

					return rtn;
				});
			};
		}

		if ( !ops.list ){
			this.list = function(){
				return this.all.apply( this, arguments );
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

		if ( settings.base ){
			bmoor.object.extend( this, settings.base );
		}

		restful( this, ops );
	}
}

module.exports = Feed;
