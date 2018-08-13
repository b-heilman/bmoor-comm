var Url = require('./Url.js'),
	bmoor = require('bmoor'),
	Promise = require('es6-promise').Promise,
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
		comm : {},
		linger : null,
		headers : {},
		method: 'GET'
	};

class Requestor {
	constructor( settings ){
		var mine;

		mine = Object.create( settings || {} );

		if ( !mine.cache ){
			mine.cache = {};
		}

		if ( !mine.deferred ){
			mine.deferred = {};
		}

		this.getSetting = function( setting ){
			if ( setting in mine ){
				return mine[ setting ];
			}else{
				return defaultSettings[ setting ];
			}
		};

		this.clearCache = function(){
			Object.keys(mine.cache).forEach(function( k ){
				mine.cache[k] = null;
			});
		};

		this.clearRoute = function( method, url ){
			var u = method.toUpperCase()+'::'+url;

			mine.cache[u] = null;
			mine.deferred[u] = null;
		};

		requestors.push( this );
	}

	go( args, datum, settings ){
		var ctx,
			cached,
			reference,
			url = this.getSetting('url'),
			prep = this.getSetting('prep'),
			cache = this.getSetting('cache'),
			method = this.getSetting('method').toUpperCase(),
			deferred = this.getSetting('deferred');

		if ( !args ){
			args = {};
		}

		if ( !settings ){
			settings = {};
		}

		if ( prep ){
			ctx = Object.create( prep(args) );
			ctx.args = args;
		}else if ( args ){
			ctx = { args: args||{} };
		}

		ctx.settings = settings;

		// some helping functions
		ctx.getSetting = ( setting ) => {
			if ( setting in settings ){
				return settings[ setting ];
			}else{
				return this.getSetting( setting );
			}
		};

		// allowed to be overridden on a per call level
		cached = ctx.getSetting('cached');

		ctx.evalSetting = ( setting ) => {
			var v = ctx.getSetting(setting);

			if ( bmoor.isFunction(v) ){
				return v(ctx.args, datum, ctx);
			}else{
				return v;
			}
		};
		
		// translate the url for request
		url = ctx.getSetting('url');
		if ( bmoor.isFunction(url) ){
			url = url(ctx.args, datum, ctx);
		}

		// allow all strings to be called via formatter
		url = ( new Url(url) ).go(ctx.args, datum, ctx);

		reference = method + '::' + url;
		
		ctx.ref = reference;

		return Promise.resolve( ctx.evalSetting('preload') )
		.then( () => {
			var res;
			
			if ( cached && cache[reference] ){
				return cache[ reference ];
			}else if ( deferred[reference] ){
				return deferred[ reference ];
			}else{
				res = this.response(
					this.request(ctx, datum, url, method),
					ctx 
				);
				
				if ( method === 'GET' ){
					deferred[ reference ] = res;
				}
				
				if ( settings.cached ){
					cache[ reference ] = res;
				}

				bmoor.promise.always( res, ()=>{ this.close(ctx); } );
				
				return res;
			}
		});
	}

	request( ctx, datum, url, method ){
		var req,
			fetched,
			comm = ctx.getSetting('comm'),
			code = ctx.getSetting('code'),
			encode = ctx.getSetting('encode'),
			fetcher = this.getSetting('fetcher'),
			headers = ctx.evalSetting('headers'),
			intercept = ctx.getSetting('intercept');
		
		if ( encode ){
			datum = encode( datum, ctx.args, ctx );
		}
		ctx.payload = datum;

		events.trigger( 'request', url, datum, ctx.settings, ctx );

		if ( intercept ) {
			if ( bmoor.isFunction(intercept) ){
				intercept = intercept( datum, ctx );
			}

			// here we intercept the request, and respond back with a fetch like object
			if ( intercept.then ){
				return intercept.then(function( v ){
					return {
						json: function(){
							return Promise.resolve(v);
						},
						status : code || 200
					};
				});
			}else{
				return Promise.resolve({
					json: function(){
						return Promise.resolve(intercept);
					},
					status : code || 200
				});
			}
		}else{
			req = bmoor.object.extend( {
				'method': method,
				'headers': bmoor.object.extend({},headers)
			}, comm );

			if ( datum ){
				if ( datum instanceof FormData ){
					req.body = datum;
					delete req.headers['content-type'];
				}else{
					req.body = JSON.stringify( datum );
					if ( !req.headers['content-type'] ){
						req.headers['content-type'] = 'application/json';
					}
				}
			}

			fetched = fetcher( url, req );

			return Promise.resolve(fetched);
		}
	}

	response( q, ctx ){
		var t,
			response,
			decode = ctx.getSetting('decode'),
			always = ctx.getSetting('always'),
			success = ctx.getSetting('success'),
			failure = ctx.getSetting('failure'),
			validation = ctx.getSetting('validation');
		
		t = bmoor.promise.always(
			q,
			function(){
				events.trigger( 'response', ctx.settings, ctx );

				if ( always ){
					always( ctx );
				}
			}
		).then(function( fetched ){
			// we hava successful transmition
			var req,
				code = ctx.getSetting('code');

			response = fetched;

			if ( code && fetched.status !== code ){
				throw new Error('Requestor::code');
			}else if ( fetched.status && 
				( fetched.status < 200 || 299 < fetched.status )
			){
				throw new Error('Requestor::status');
			}

			if ( decode ){
				req = decode(fetched);
			}else if ( fetched.text ){
				req = fetched.text().then(function( t ){
					try{
						return JSON.parse(t);
					}catch( ex ){
						return t;
					}
				});
			}else if ( fetched.json ){
				// this is a fake fetched object gaurenteed to return json
				req = fetched.json();
			}else{
				throw new Error('fetched response must have text or json');
			}

			return Promise.resolve(req).then(function( res ){
				if ( validation && 
					!validation(res, ctx, fetched)
				){
					throw new Error('Requestor::validation');
				} 
				
				return success ?
					success(res, ctx) : res;
			});
		});

		t.then(
			function( res ){
				events.trigger('success', res, response, ctx.settings, ctx);
			},
			function( error ){
				events.trigger('failure', error, response, ctx.settings, ctx);

				if ( failure ){
					error.response = response;

					failure(error, ctx);
				}
			}
		);

		return t;
	}

	close( ctx ){
		var linger = ctx.getSetting('linger'),
			deferred = this.getSetting('deferred');
		
		if ( linger !== null ){
			setTimeout(function(){
				deferred[ctx.ref] = null;
			}, linger);
		}else{
			deferred[ctx.ref] = null;
		}
	}
}

Requestor.events = events;
Requestor.settings = defaultSettings;
Requestor.clearCache = function(){
	requestors.forEach(function( r ){
		r.clearCache();
	});
};

module.exports = Requestor;
