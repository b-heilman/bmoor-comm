;(function(){
/** bmoor-comm v0.0.1 **/
// TODO : this should become something like HttpBackend
bMoor.make('bmock.comm.Http', 
	['bmoor.defer.Basic',
	function( Basic ){
		
		function MockConnector(){
			this.expecting = [];

			if ( !(this instanceof MockConnector) ){
				return new MockConnector();
			}
		}

		return {
			construct : MockConnector,
			properties : {
				getConnector : function(){
					var dis = this,
						q = new Basic(),
						t;

					return function( request ){
						if ( dis.expecting.length ){
							t = dis.expecting.shift();
							
							expect( request.url ).toBe( t.url );
							expect( request.method.toUpperCase() ).toBe( t.method.toUpperCase() );

							if ( !t.code || t.code === 200 ){
								q.resolve({
									data : t.response,
									code : 200
								});
							}else{
								q.reject({
									message : t.response,
									code : t.code
								});
							}
						}else{
							expect( request.url ).toBeUndefined();
						}

						return q.promise;
					};
				},
				expect : function( method, url ){
					var req;

					if ( url === undefined ){
						url = method;
						method = 'GET';
					}

					req = {
						url : url,
						method : method,
						code : 200,
						response : {}
					};

					this.expecting.push( req );

					return {
						respond : function( code, response ){
							if ( response === undefined ){
								response = code;
								code = 200;
							}

							req.response = response;
							req.code = code;
						}
					};
				},
				hasMetExpectations : function(){
					expect( this.expecting.length ).toBe( 0 );
				}
			}
		};
	}]
);
(function(){
'use strict';

var bMoor,
	xHR;

if ( typeof window === 'undefined' ){
	require('bmoor');
	xHR = require('XMLHttpRequest');
}else{
	bMoor = window.bMoor;
	xHR = window.XMLHttpRequest;
}

bMoor.define( 'bmock.comm.XhrIntercept', 
	['bmoor.defer.Basic',
	function( Defer ){
		var expecting = [];

		return {
			enable : function(){
				window.XMLHttpRequest = function( options ){
					return {
						withCredentials : true,
						setRequestHeader : function(){},
						open : function( method, url, async, user, password ){
							// onreadystatechange
							// readystate -> 4

							// status
							// response
							// getAllResponseHeaders()
						},
						send : function( data ){
							var t;

							if ( expecting.length ){
								t = expecting.shift();

								this.readyState = 4;
								this.status = t.status || 200;
								this.responseType = 'json';
								this.response = t.response;
								this.getAllResponseHeaders = function(){
									return { some : 'header' };
								};

								/*
								if ( this.onreadystatechange ){
									this.onreadystatechange();
								}
								*/
								if ( this.onload ){
									this.onload();
								}
							}else{
								throw new Error('I was not expecting anything');
							}
							
						}
					};
				};
			},
			disable : function(){
				window.XMLHttpRequest = xHR;
			},
			expect : function( ops ){
				expecting.push( ops );
			}
		};
	}]
);

}());
bMoor.make('bmoor.storage.Local', [
	function(){
		'use strict';

		return {
			construct : function StorageLocal( name ){
				this.name = name;
			},
			properties : {
				// create an instance of this class in the storage
				create : function( key, obj ){
					var id,
						collection;

					if ( !obj[key] ){
						id = Math.random() * 100000000;
						obj[ key ] = id;
					}else{
						id = obj[ key ];
					}

					if ( localStorage[this.name] ){
						collection = JSON.parse( localStorage[this.name] );
					}else{
						collection = [];
					}

					collection.push( id );
					localStorage[this.name] = JSON.stringify( collection );
					localStorage[this.name+'-'+id] = JSON.stringify( obj );

					return bMoor.dwrap( obj );
				},
				// update the whole object in the storage
				update : function( id, obj ){
					localStorage[this.name+'-'+id] = JSON.stringify( obj );

					return bMoor.dwrap( obj );
				},
				// partial update of the object in storage
				partial : function( id, partial ){
					var obj;

					if ( localStorage[this.name+'-'+id] ){
						obj = JSON.parse( localStorage[this.name+'-'+id] );
						localStorage[ this.name+'-'+id ] = JSON.stringify( bMoor.merge(obj,partial) );
					}

					return bMoor.dwrap( obj );
				},
				// allows for the user to get one or many elements
				get : function( id ){
					var i, c,
						res;

					if ( bMoor.isArrayLike(id) ){
						res = [];

						for( i = 0, c = id.length; i < c; i++ ){
							res[ i ] = JSON.parse( localStorage[this.name+'-'+id[i]] );
						}

						return bMoor.dwrap( res );
					}else{
						return bMoor.dwrap( JSON.parse(localStorage[this.name+'-'+id]) );
					}
				},
				// get all instances
				getAll : function(){
					var i, c,
						all,
						res;

					if ( localStorage[this.name] ){
						res = [];
						all = JSON.parse( localStorage[this.name] );

						for( i = 0, c = all.length; i < c; i++ ){
							res.push( JSON.parse(localStorage[this.name+'-'+all[i]]) );
						}

						return bMoor.dwrap( res );
					}else{
						return bMoor.drwap( [] );
					}
				},
				// delete one or many elements
				remove : function( id ){
					var i, c, 
						res,
						collection;

					if ( localStorage[this.name] ){
						collection = JSON.parse( localStorage[this.name] );

						if ( bMoor.isArrayLike(id) ){
							res = [];
							for( i = 0, c = id.length; i < c; i++ ){
								localStorage.removeItem( this.name+'-'+id[i] );
								res.push( bMoor.array.remove(collection,id[i]) );
							}
						}else{
							localStorage.removeItem( this.name+'-'+id );
							res = bMoor.array.remove( collection, id );
						}

						localStorage[this.name] = JSON.stringify( collection );

						return bMoor.dwrap( res );
					}
				},
				// completely blow away all data
				destroy : function(){
					var i, c, 
						collection;

					if ( localStorage[this.name] ){
						collection = JSON.parse( localStorage[this.name] );

						for( i = 0, c = collection.length; i < c; i++ ){
							localStorage.removeItem( this.name+'-'+collection[i] );
						}

						localStorage.removeItem( this.name );
					}

					return bMoor.dwrap( true );
				}
			}
		};
	}]
);
bMoor.make('bmoor.storage.Mongo', [
	'bmoor.extender.Mixin',
	function( Mixin ){
		'use strict';

		return {
			parent : Mixin,
			construct : function StorageLocal(){},
			properties : {
				// create an instance of this class in the storage
				create : function( obj ){

				},
				// update the whole object in the storage
				update : function( id, obj ){

				},
				// partial update of the object in storage
				partial : function( id, partial ){

				},
				// allows for the user to get one or many elements
				get : function( id ){

				},
				// get all instances
				getAll : function(){

				},
				// delete one or many elements
				remove : function( id ){
					
				}
			}
		};
	}]
);
bMoor.make('bmoor.storage.Remote', [
	'bmoor.comm.Streamer',
	function( Streamer ){
		'use strict';

		return {
			construct : function StorageRemote( name, root ){
				this.root = root;
				this.name = name;
			},
			extend : [
				new Streamer({
					create : {
						url : function(){
							return this.root;
						},
						method : 'POST',
						success : function( res, key ){
							if ( !res[key] ){
								res[ key ] = Math.random() * 100000000;
							}

							return res;
						}
					},
					update : {
						url : function( id ){
							return this.root + '/' + id;
						},
						method : 'POST'
					},
					partial : {
						url : function( id ){
							return this.root + '/' + id;
						},
						method : 'POST'
					},
					get : {
						url : function( id ){
							if ( bMoor.isArray(id) ){
								return this.root + '/' + id.join(',');
							}else{
								return this.root + '/' + id;
							}
						},
						method : 'GET'
					},
					getAll : {
						url : function(){
							console.log('--get all--');
							return this.root;
						},
						method : 'GET'
					},
					remove : {
						url : function( id ){
							return this.root + '/' + id;
						},
						method : 'DELETE'
					},
					destroy : {
						url : function(){
							alert('TODO : destroy');
						}
					}
				})
			]
		};
	}]
);
(function(){

var bMoor,
	xHR;

if ( typeof window === 'undefined' ){
	bMoor = require('bmoor');
	xHR = require('XMLHttpRequest');
}else{
	bMoor = window.bMoor;
	if ( window.XMLHttpRequest ){
		xHR = function(){
			return window.XMLHttpRequest.apply( window, arguments );
		};
	}else{
		xHR = (function(){
			/* global ActiveXObject */
			try { return new ActiveXObject("Msxml2.XMLHTTP.6.0"); } catch (e1) {}
			try { return new ActiveXObject("Msxml2.XMLHTTP.3.0"); } catch (e2) {}
			try { return new ActiveXObject("Msxml2.XMLHTTP"); } catch (e3) {}
			throw 'error' /* TODO : error */;
		}());
	}
}

bMoor.define('bmoor.comm.Connect',
	['bmoor.defer.Basic',
	function( Defer ){
		function makeXHR( method, url, async, user, password ){
			var xhr = new xHR();

			if ( "withCredentials" in xhr ){
				// doop
			}else if ( typeof XDomainRequest !== "undefined") {
				// Otherwise, check if XDomainRequest.
				// XDomainRequest only exists in IE, and is IE's way of making CORS requests.
				xhr = new XDomainRequest();
			} else {
				// Otherwise, CORS is not supported by the browser.
				xhr = null;
			}

			xhr.open( method, url, async, user, password );

			return xhr;
		}

		function processReponse( url, options, q, status, response, headers ){
			var r,
				action,
				valid = ( 200 <= status && status < 300 ),
				protocol = url.protocol;

			this.connection = null;

			// fix status code for file protocol (it's always 0)
			status = (protocol == 'file' && status === 0) ? (response ? 200 : 404) : status;

			// normalize IE bug (http://bugs.jquery.com/ticket/1450)
			status = status == 1223 ? 204 : status;
			action = valid ? 'resolve' : 'reject';

			q[action]({
				'status' : status,
				'headers' : headers,
				'config' : options,
				'data' : response
			});
		}

		return function commConnector( options ){
			var aborted = false,
				q = new Defer(),
				xhr = makeXHR( 
					options.method ? options.method.toUpperCase() : 'GET', 
					options.url, 
					(options.async === undefined ? true : options.async),
					options.user,
					options.password
				);

			xhr.onload = function() {
				if (xhr.readyState == 4) {
					processReponse(
						bMoor.url.resolve( options.url ),
						options,
						q,
						aborted ? -2 : xhr.status,
						xhr.responseType ? xhr.response : xhr.responseText,
						xhr.getAllResponseHeaders()
					);
				}
			};

			bMoor.forEach( options.headers, function( value, key ){
				xhr.setRequestHeader(key, value);
			});

			if ( options.mimeType ) {
				xhr.overrideMimeType( options.mimeType );
			}

			if ( options.responseType ) {
				xhr.responseType = options.responseType;
			}

			xhr.send(options.data || null);

			q.promise.abort = function(){
				aborted = true;
				xhr.abort();
			};

			return q.promise;
		};
	}]
);

}());

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

bMoor.make('bmoor.comm.Streamer',
	['bmoor.extender.Mixin', 'bmoor.comm.Stream',
	function( Mixin, Stream ){
		'use strict';

		return {
			parent : Mixin,
			construct : function CommStreamer( settings ){
				var dis = this;

				bMoor.iterate( settings, function( setting, key ){
					dis[ key ] = new Stream( setting );
				});
			}
		};
	}]
);

(function(){
'use strict';

if ( typeof angular !== 'undefined' ){
	bMoor.define('bmoor.comm.adapter.Angular',
		['bmoor.defer.Basic',
		function( Defer ){
			var $http = angular.injector(['ng']).get('$http');

			return function commAngularAdapter( options ){
				var r = new Defer();

				$http( options ).then(
					function( res ){
						r.resolve( res );
					},
					function( res ){
						r.reject( res );
					}
				);

				return r.promise;
			};
		}]
	);
}

}());
}());