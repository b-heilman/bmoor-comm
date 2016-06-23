var bmoor = require('bmoor');

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
		comm : {},
		linger : 0,
		headers : {}
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

	go( args, settings ){
		var ctx,
			reference,
			url = this.getSetting('url'),
			cached = this.getSetting('cached'),
			encode = this.getSetting('encode'),
			method = this.getSetting('method'),
			context = this.getSetting('context');

		if ( !settings ){
			settings = {};
		}

		if ( encode ){
			ctx = encode( args );
		}else{
			ctx = args;
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
			setting = ctx.$getSetting( setting );
			if ( bmoor.isFunction(setting) ){
				return setting.call( context, ctx );
			}else{
				return setting;
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
				res = this.response( this.request(ctx), ctx );
				
				deferred[ reference ] = res;

				if ( settings.cached ){
					cache[ reference ] = res;
				}

				bmoor.promise.always( res, ()=>{ this.close(ctx); } );
				
				return res;
			}
		});
	}

	request( ctx ){
		var fetched,
			url = ctx.$evalSetting('url'),
			comm = ctx.$getSetting('comm'),
			code = ctx.$getSetting('code'),
			data = ctx.$evalSetting('data'),
			method = this.getSetting('method') || 'GET',
			fetcher = this.getSetting('fetcher'),
			headers = ctx.$evalSetting('headers'),
			intercept = ctx.$getSetting('intercept');
		
		if ( intercept ) {
			if ( bmoor.isFunction(intercept) ){
				intercept = intercept( data, ctx );
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
			fetched = fetcher(
				url,
				bmoor.object.extend(
					{
						'body': data,
						'method': method,
						'headers': headers
					}, 
					comm
				)
			);

			return Promise.resolve(fetched).then(function( res ){
				var error;

				if ( code ){
					// we expect a particular http response status code
					if ( code === res.status ){
						return res;
					}
				}else if ( res.status >= 200 && res.status < 300 ){
					return res;
				}

				error = new Error( res.statusText );
			    error.response = res;

			    throw error;
			});
		}
	}

	response( q, ctx ){
		var decode = ctx.$getSetting('decode'),
			always = ctx.$getSetting('always'),
			success = ctx.$getSetting('success'),
			failure = ctx.$getSetting('failure'),
			context = ctx.$getSetting('context'),
			validation = ctx.$getSetting('validation');
		
		return bmoor.promise.always(
			bmoor.promise.always( q, function(){
				if ( always ){
					always.call( context, ctx );
				}
			}).then(function( fetchedReponse ){
				// we hava successful transmition
				var res = decode ? decode( fetchedReponse ) : 
					( fetchedReponse.json ? fetchedReponse.json() : fetchedReponse ); // am I ok with this?

				if ( validation ){ // invalid, throw Error
					validation.call( context, res, ctx );
				}

				if ( success ){
					return success.call( context, res, ctx );
				}else{
					return res;
				}
			}),
			function( response ){
				if ( response instanceof Error ){
					failure.call( context, ctx );
				}
			}
		);
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
Requestor.clearCache = function(){
	cache = {};
	deferred = {};
};

module.exports = Requestor;
