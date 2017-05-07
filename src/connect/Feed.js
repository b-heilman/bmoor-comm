var bmoor = require('bmoor'),
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

		if ( bmoor.isString(ops.read) ){
			ops.read = {
				url: ops.read
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

		if ( bmoor.isString(ops.search) ){
			(function( base ){
				ops.search = {
					url: function( ctx ){
						return base + '?query=' + 
							JSON.stringify( 
								searchEncode( ctx.$args ) 
							);
					},
					method: 'GET'
				};
			}( ops.search ));
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
		if ( ops.create ){
			ops.create.encode = encode;
		}
		
		//ops.update
		if ( ops.update ){
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
			if ( ops.read ){
				ops.read.prep = prep;
			}

			if ( ops.update ){
				ops.update.prep = prep;
			}
		}

		restful( this, ops );
	}
}

module.exports = Feed;
