bMoor.define('bmoor.comm.Stream',
	['-bmoor.comm.Http', 'bmoor.defer.Basic', 'bmoor.flow.Interval', 'bmoor.flow.Timeout',
	function( httpConnect, Defer, Interval, Timeout ){
		'use strict';

		var cache = {},
			deferred = {};

		function CommStream( settings ){
			var request;

			function loadFunc( type ){
				return settings[ type ] || CommStream.settings[ type ];
			}

			if ( bMoor.isString(settings) ){
				settings = {
					url : settings
				};
			}

			/*
			settings :
				message sending
				- url
				- preload
				- massage
				- response
				- method
				- linger : how long does a value remain deferred
				- cached
				- context
				- headers
				- http
				
				repeat response
				- interval
				- onStopRefresh

				response handing
				- success
				- decode
				- validation
				- failure
				- always
			*/
			request = function(){
				var cancel,
					args = arguments,
					context = settings.context || this,
					method = settings.method || 'GET',
					url = bMoor.isFunction(settings.url) ? settings.url.apply(context, args) : settings.url,
					reference = method + '::' + url,
					http = loadFunc( 'http' ),
					linger = loadFunc( 'linger' ),
					decode = loadFunc( 'decode' ),
					validation = loadFunc( 'validation' ),
					success = loadFunc( 'success' ),
					failure = loadFunc( 'failure' ),
					always = loadFunc( 'always' );

				function closeRequest(){
					if ( linger ){
						Timeout.set(function(){
							deferred[ reference ] = null;
						}, linger);
					}else{
						deferred[ reference ] = null;
					}
				}

				function handleResponse( r ){
					var t = r.then(
						function( content ){
							// we hava successful transmition
							/*
							I make the assumption that the httpConnector will return back an object that has,
							at the very least, code and data attributes
							*/
							var res = decode ? decode( content ) : content,
								data = res.data,
								code = res.code;

							if ( always ){
								always.call( context );
							}

							if ( (validation && !validation(code, data)) ){
								Array.prototype.unshift.call( args, res );
								return failure.apply( context, args );
							}else{
								if ( success ){
									Array.prototype.unshift.call( args, data );
									return success.apply( context, args );
								}else{
									return data;
								}
							}
						},
						function ( res ){
							// something went boom
							if ( always ){
								always.call( context );
							}

							Array.prototype.unshift.call( args, res );
							return failure.apply( context, args );
						}
					);

					return t;
				}

				function preRequest(){
					var preload;

					if ( settings.preload ){
						if ( typeof(settings.preload) === 'function' ){
							preload = settings.preload();
						}else{
							preload = settings.preload; // assumed to already be a promise
						}
					}

					if ( !bMoor.isObject(preload) || !preload.then ){
						preload = bMoor.dwrap( preload );
					}

					return preload;
				}

				function makeRequest(){
					var req;

					if ( settings.massage ){
						Array.prototype.push.call( args, settings.massage.apply(context,args) );
					}
					
					if ( settings.response ) {
						if ( typeof(settings.response) === 'function' ){
							req = settings.response.apply( context, args );
						}else{
							req = settings.response;
						}

						if ( req.then ){
							return req.then(function( v ){
								return {
									data : v,
									code : 200
								};
							});
						}else{
							return bMoor.dwrap({
								data : req,
								code : 200
							});
						}
					}else{
						return http(bMoor.object.extend(
							{
								'method' : method,
								'data' : args[ args.length - 1 ],
								'url' : url,
								'headers' : bMoor.object.extend(
									{ 'Content-Type' : 'application/json' },
									CommStream.settings.headers,
									settings.headers
								)
							},
							settings.comm || CommStream.settings.comm
						));
					}
				}

				return preRequest().then(
					function(){
						var t,
							f,
							ff;

						if ( settings.cached && cache[reference] ){
							return cache[ reference ];
						}else if ( deferred[reference] ){
							return deferred[ reference ];
						}

						f = function(){
							return handleResponse( makeRequest() );
						};

						if ( settings.interval !== undefined && !deferred[reference] ){
							ff = function(){
								request.lastRun = ( new Date() ).getTime();
								return f();
							};

							request.setInterval = function( i ){
								var time = ( new Date() ).getTime();

								// I want to protect against
								if ( !request.lastRun || time - i < request.lastRun ||
									(request.lastInterval && request.lastInterval > i) ){
									t = ff();
								}else if ( url && settings.cached ){
									// TODO : really?
									t = cache[ reference ];
								}else{
									// this has to be something simulated, so...
									t = request.lastResponse;
								}

								request.lastInterval = i;

								if ( cancel ){
									Interval.clear( cancel );
								}

								cancel = Interval.set(function(){
									deferred[ reference ] = ff();
								}, i);
							};

							request.stopRefresh = function(){
								Interval.clear( cancel );
								if ( settings.onStopRefresh ){
									settings.onStopRefresh.call( context );
								}
							};

							if ( settings.interval ){
								request.setInterval( settings.interval ); // will implicitely call t = f()
							}else{
								t = ff(); // make sure it gets called
							}
						}else{
							t = f();
						}

						if ( url ){
							deferred[ reference ] = t;

							if ( settings.cached ){
								cache[ reference ] = t;
							}

							t.then( closeRequest, closeRequest );
						}

						request.lastResponse = t;

						return t;
					},
					function(){
						Array.prototype.unshift.call( args, {
							code : 0,
							message : 'Preload Error'
						});
						return settings.failure.apply( context, args );
					}
				);
			};

			return request;
		}

		CommStream.settings = {
			interval : false,
			linger : 30,
			http : httpConnect,
			comm : {},
			headers : {}
		};
		
		return CommStream;
	}]
);
