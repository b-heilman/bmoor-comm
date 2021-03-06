describe('bmoor-comm::Requestor', function(){
	it('should be defined', function(){
		expect( bmoorComm.Requestor ).toBeDefined();
		expect( bmoorComm.Requestor.settings ).toBeDefined();
	});

	it('should instantiate correctly', function(){
		var t = {},
			req = new bmoorComm.Requestor( t );

		expect( req.go ).toBeDefined();
	});

	it('should call the globally defined fetch', function( done ){
		var t = { test: true },
			send = {content:true},
			fetched = false,
			alwaysCalled = false,
			successCalled = false,
			getUrl = 'hello/world';

		bmoorComm.Requestor.settings.fetcher = function( url, ops ){
			fetched = true;

			expect( url ).toBe( getUrl );
			expect( ops.body ).toEqual( 
				JSON.stringify({content:true}) 
			);
			expect( ops.method ).toBe( 'GET' );
			expect( ops.headers ).toEqual({
				foo:'bar',
				'content-type': 'application/json'
			});

			return ES6Promise.resolve({
				json: function(){
					return { valid: true };
				},
				status: 200
			});
		};

		var preloaded,
			req = new bmoorComm.Requestor({
				url: getUrl,
				preload: function( args ){
					preloaded = true;
					expect( args ).toBe( t );
				},
				encode: function( datum, args ){
					expect( datum ).toBe( send );
					expect( args.test ).toBe( true );

					return {
						content: true
					};
				},
				decode: function( response ){
					var t = response.json();

					expect( t.valid ).toBe( true );

					return { some: 'value' };
				},
				always: function( ctx ){
					alwaysCalled = true;
					expect( ctx.args ).toBe( t );
				},
				success: function( data, ctx ){
					successCalled = true;

					expect( ctx.args ).toBe( t );
					expect( data.some ).toBe( 'value' );
					
					return {'was':'successful'};
				}
			});

		req.go(t,send,{headers:{foo:'bar'}}).then(
			function( res ){
				expect( res.was ).toBe( 'successful' );
				expect( preloaded ).toBe( true );
				expect( fetched ).toBe( true );
				expect( alwaysCalled ).toBe( true );
				expect( successCalled ).toBe( true );
				done();
			}
		).catch(function( res ){
			console.log( res );
			expect( res.message ).toBe( false );
			done();
		});
	});

	it('should encode a url properly', function( done ){
		var fetched = false,
			t = { hello:'world', foo:'bar&all' },
			fn = function(){
				expect( fetched ).toBe( true );
				done();
			},
			getUrl = 'world/bar%26all';

		bmoorComm.Requestor.settings.fetcher = function( url ){
			fetched = true;
			// TODO : do text
			expect( url ).toBe( getUrl );
			return ES6Promise.resolve({
				json: function(){
					return { valid: true };
				},
				status: 200
			});
		};

		( new bmoorComm.Requestor({ url: '{{hello}}/{{foo}}' }) ) 
			.go(t).then( fn, fn );
	});

	it('should call json without a decode', function( done ){
		var t = { test: true },
			fetched = false,
			alwaysCalled = false,
			successCalled = false,
			getUrl = 'hello/world/2';

		bmoorComm.Requestor.settings.fetcher = function( url, ops ){
			fetched = true;

			expect( url ).toBe( getUrl );
			expect( ops.body ).toEqual(
				JSON.stringify({content:true})
			);
			expect( ops.method ).toBe( 'GET' );
			expect( ops.headers ).toEqual({
				foo:'bar',
				'content-type': 'application/json'
			});

			return ES6Promise.resolve({
				json: function(){
					return { valid: true };
				},
				status: 200
			});
		};

		var preloaded,
			req = new bmoorComm.Requestor({
				url: function( args ){
					expect( args ).toBe( t );

					return getUrl;
				},
				preload: function( args ){
					preloaded = true;
					expect( args ).toBe( t );
				},
				encode: function( datum, args ){
					expect( args ).toBe( t );

					return {
						content: true
					};
				},
				always: function( ctx ){
					alwaysCalled = true;
					expect( ctx.args ).toBe( t );
				},
				success: function( data, ctx ){
					successCalled = true;

					expect( ctx.args ).toBe( t );
					expect( data.valid ).toBe( true );
					
					return {'foo':'bar'};
				}
			});

		req.go(t,null,{headers:{foo:'bar'}}).then(
			function( res ){
				expect( res.foo ).toBe( 'bar' );
				expect( preloaded ).toBe( true );
				expect( fetched ).toBe( true );
				expect( alwaysCalled ).toBe( true );
				expect( successCalled ).toBe( true );
				done();
			}
		).catch(function(){
			expect( true ).toBe( false );
			done();
		});
	});

	it('should not call fetcher if intercept is defined', function( done ){
		var t = { test: true },
			fetched = false,
			intercepted = false,
			alwaysCalled = false,
			successCalled = false,
			getUrl = 'hello/world/2';

		bmoorComm.Requestor.clearCache();
		bmoorComm.Requestor.settings.fetcher = function(){
			fetched = true;
			return { status: 200 };
		};

		var preloaded,
			req = new bmoorComm.Requestor({
				url: function( args ){
					expect( args ).toBe( t );

					return getUrl;
				},
				preload: function( args ){
					preloaded = true;
					expect( args ).toBe( t );
				},
				encode: function( datum, args ){
					expect( args ).toBe( t );
					expect( datum.foo ).toBe( 'bar' );

					return {
						content: true
					};
				},
				intercept: function( datum, ctx ){
					expect( ctx.args ).toBe( t );
					expect( datum ).toEqual( { content: true } );

					intercepted = true;

					return {
						homeStar: 'runner'
					};
				},
				always: function( ctx ){
					alwaysCalled = true;
					expect( ctx.args ).toBe( t );
				},
				success: function( data, ctx ){
					successCalled = true;

					expect( ctx.args ).toBe( t );
					expect( data.homeStar ).toBe( 'runner' );
					
					return {'foo':'bar'};
				}
			});

		req.go(t,{foo:'bar'},{headers:{foo:'bar'}}).then(
			function( res ){
				expect( res.foo ).toBe( 'bar' );
				expect( preloaded ).toBe( true );
				expect( fetched ).toBe( false );
				expect( alwaysCalled ).toBe( true );
				expect( successCalled ).toBe( true );
				done();
			}
		).catch(function(){
			expect( true ).toBe( false );
			done();
		});
	});

	it('should catch rejections with failure', function( done ){
		var t = { test: true },
			sample = {},
			urlCalled = false,
			alwaysCalled = false,
			successCalled = false,
			failureCalled = false,
			getUrl = 'hello/world/3';

		bmoorComm.Requestor.clearCache();
		bmoorComm.Requestor.settings.fetcher = function( url, other ){
			expect( other.body ).toBe( JSON.stringify(sample) );

			return ES6Promise.reject( new Error('test error') );
		};

		var req = new bmoorComm.Requestor({
			url: function( args ){
				urlCalled = true;

				expect( args ).toBe( t );

				return getUrl;
			},
			always: function( ctx ){
				alwaysCalled = true;
				expect( ctx.args ).toBe( t );
			},
			success: function( data, ctx ){
				successCalled = true;

				expect( ctx.args ).toBe( t );
				return {'foo':'bar'};
			},
			failure: function( res, ctx ){
				failureCalled = true;

				expect( res.message ).toBe( 'test error' );
				expect( ctx.args ).toBe( t );
			}
		});

		req.go(t,sample,{headers:{foo:'bar'}}).then(
			function(){
				expect( true ).toBe( false );
				done();
			}
		).catch(function( error ){
			expect( error.message ).toBe( 'test error' );
			expect( urlCalled ).toBe( true );
			expect( alwaysCalled ).toBe( true );
			expect( successCalled ).toBe( false );
			expect( failureCalled ).toBe( true );
			done();
		});
	});

	describe('events', function(){
		var request,
			response,
			success,
			failure,
			subscription;

		beforeEach(function(){
			var pos = 1;

			request = false;
			response = false;
			success = false;
			failure = false;

			subscription = bmoorComm.Requestor.events.subscribe({
				request: function( url, datum, settings ){
					expect( settings.foo ).toBe( 'bar' );

					request = pos;
					pos += 1;
				},
				response: function( settings ){
					expect( settings.foo ).toBe( 'bar' );

					response = pos;
					pos += 1;
				},
				success: function( res, response, settings ){
					expect( settings.foo ).toBe( 'bar' );

					success = pos;
					pos += 1;
				},
				failure: function( err, response, settings ){
					expect( settings.foo ).toBe( 'bar' );
					
					failure = pos;
					pos += 1;
				}
			});

			bmoorComm.Requestor.clearCache();
		});

		afterEach(function(){
			subscription();
		});

		it('should call events in order', function( done ){
			var req = new bmoorComm.Requestor({
					url: 'just/testing'
				});

			bmoorComm.Requestor.settings.fetcher = function(){
				return {
					json: function(){
						return ES6Promise.resolve({
							status: 200,
							data: 'OK'
						});
					}
				};
			};

			req.go({},{},{foo:'bar'}).then(function(){
				setTimeout(function(){
					expect( request ).toBe( 1 );
					expect( response ).toBe( 2 );
					expect( success ).toBe( 3 );
					expect( failure ).toBe( false );

					done();
				}, 10 );
			});
		});

		it('should call events in order on failure', function( done ){
			var req = new bmoorComm.Requestor({
					url: 'just/testing'
				});

			bmoorComm.Requestor.settings.fetcher = function(){
				return ES6Promise.reject(
					new Error( 'do not care' )
				);
			};

			req.go({},{},{foo:'bar'}).catch(function(){
				setTimeout(function(){
					expect( request ).toBe( 1 );
					expect( response ).toBe( 2 );
					expect( success ).toBe( false );
					expect( failure ).toBe( 3 );

					done();
				}, 10 );
			});
		});

		it('should call events in order on failure', function( done ){
			var req = new bmoorComm.Requestor({
					url: 'just/testing'
				});

			bmoorComm.Requestor.settings.fetcher = function(){
				return ES6Promise.reject(
					new Error( 'do not care' )
				);
			};

			req.go({},{},{foo:'bar'}).catch(function(){
				setTimeout(function(){
					expect( request ).toBe( 1 );
					expect( response ).toBe( 2 );
					expect( success ).toBe( false );
					expect( failure ).toBe( 3 );

					done();
				}, 10 );
			});
		});

		it('should call events in order on success failure', function( done ){
			var req = new bmoorComm.Requestor({
					url: 'just/testing',
					success: function(){
						throw new Error('doop');
					}
				});

			bmoorComm.Requestor.settings.fetcher = function(){
				return ES6Promise.reject(
					new Error( 'do not care' )
				);
			};

			req.go({},{},{foo:'bar'}).catch(function(){
				setTimeout(function(){
					expect( request ).toBe( 1 );
					expect( response ).toBe( 2 );
					expect( success ).toBe( false );
					expect( failure ).toBe( 3 );

					done();
				}, 10 );
			});
		});

		it('should call events in order on always failure', function( done ){
			var req = new bmoorComm.Requestor({
					url: 'just/testing',
					always: function(){
						throw new Error('doop');
					}
				});

			bmoorComm.Requestor.settings.fetcher = function(){
				return ES6Promise.reject(
					new Error( 'do not care' )
				);
			};

			req.go({},{},{foo:'bar'}).catch(function(){
				setTimeout(function(){
					expect( request ).toBe( 1 );
					expect( response ).toBe( 2 );
					expect( success ).toBe( false );
					expect( failure ).toBe( 3 );

					done();
				}, 10 );
			});
		});
	});
});
