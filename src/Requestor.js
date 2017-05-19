var bmoor = require('bmoor'),
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
		comm : {},
		linger : null,
		headers : {},
		method: 'GET'
	};

class Requestor {
	constructor( settings ){
		this.getSetting = function( setting ){
			if ( setting in settings ){
				return settings[ setting ];
			}else{
				return defaultSettings[ setting ];
			}
		};
	}

	go( args, datum, settings ){
		var ctx,
			reference,
			url = this.getSetting('url'),
			prep = this.getSetting('prep'),
			cached = this.getSetting('cached'),
			method = this.getSetting('method').toUpperCase(),
			context = this.getSetting('context');

		if ( !settings ){
			settings = {};
		}

		if ( prep ){
			ctx = Object.create( prep(args) );
			ctx.$args = args;
		}else if ( args ){
			ctx = Object.create( args );
			ctx.$args = args;
		}else{
			ctx = { $args: {} };
		}

		// some helping functions
		ctx.$getSetting = ( setting ) => {
			if ( setting in settings ){
				return settings[ setting ];
			}else{
				return this.getSetting( setting );
			}
		};

		ctx.$evalSetting = ( setting ) => {
			var v = ctx.$getSetting( setting );

			if ( bmoor.isString(v) && setting === 'url' ){
				// allow all strings to be called via formatter
				v = settings[ setting ] = bmoor.string.getFormatter(
					v.replace(/\}\}/g,'|url}}')
				);
			}

			if ( bmoor.isFunction(v) ){
				return v.call( context, ctx, datum );
			}else{
				return v;
			}
		};
		
		url = ctx.$evalSetting('url');
		reference = method + '::' + url;
		
		ctx.$ref = reference;

		return Promise.resolve( ctx.$evalSetting('preload') ).then( () => {
			var res;
			
			if ( cached && cache[reference] ){
				return cache[ reference ];
			}else if ( deferred[reference] ){
				return deferred[ reference ];
			}else{
				res = this.response( this.request(ctx,datum), ctx );
				
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

	request( ctx, datum ){
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
		
		if ( encode ){
			datum = encode( datum, ctx.$args );
		}

		events.trigger( 'request', url, datum );

		if ( intercept ) {
			if ( bmoor.isFunction(intercept) ){
				intercept = intercept( datum, ctx );
			}

			// here we intercept the request, and respond back with a fetch like object
			if ( intercept.then ){
				return intercept.then(function( v ){
					return {
						json: function(){
							return v;
						},
						status : code || 200
					};
				});
			}else{
				return Promise.resolve({
					json: function(){
						return intercept;
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
			decode = ctx.$getSetting('decode'),
			always = ctx.$getSetting('always'),
			success = ctx.$getSetting('success'),
			failure = ctx.$getSetting('failure'),
			context = ctx.$getSetting('context'),
			validation = ctx.$getSetting('validation');
		
		t = bmoor.promise.always(
			q,
			function(){
				events.trigger( 'response' );

				if ( always ){
					always.call( context, ctx );
				}
			}
		).then(function( fetchedReponse ){
			// we hava successful transmition
			var res = decode ? decode( fetchedReponse ) : 
					( fetchedReponse.json ? 
						fetchedReponse.json() : 
						fetchedReponse 
					),
				code = ctx.$getSetting('code');

			response = res;

			if ( validation ){ // invalid, throw Error
				if ( !validation.call(context,res,ctx) ){
					throw new Error('Requestor::validation');
				}
			}else if ( code && res.status !== code ){
				throw new Error('Requestor::code');
			}else if ( res.status && 
				( res.status < 200 || 299 < res.status )
			){
				throw new Error('Requestor::status');
			}

			return ( success ) ?
				success.call( context, res, ctx ) : res;
		});

		t.then(
			function( res ){
				events.trigger( 'success', res, response );
			},
			function( error ){
				events.trigger( 'failure', error, response );

				if ( failure ){
					error.response = response;

					failure.call( context, error, ctx );
				}
			}
		);

		return t;
	}

	close( ctx ){
		var linger = ctx.$getSetting('linger');
		
		if ( linger !== null ){
			setTimeout(function(){
				deferred[ ctx.$ref ] = null;
			}, linger);
		}else{
			deferred[ ctx.$ref ] = null;
		}
	}
}

Requestor.$settings = defaultSettings;
Requestor.events = events;
Requestor.clearCache = function(){
	cache = {};
	deferred = {};
};

module.exports = Requestor;
