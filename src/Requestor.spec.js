describe('bmoor-comm::Requestor', function(){
	it('should be defined', function(){
		expect( bmoorComm.Requestor ).toBeDefined();
		expect( bmoorComm.Requestor.$settings ).toBeDefined();
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

		bmoorComm.Requestor.$settings.fetcher = function( url, ops ){
			fetched = true;

			expect( url ).toBe( getUrl );
			expect( ops.body ).toEqual( {content:true} );
			expect( ops.method ).toBe( 'GET' );
			expect( ops.headers ).toEqual( {foo:'bar'} );

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
				preload: function( ctx ){
					preloaded = true;
					expect( ctx.$args ).toBe( t );
				},
				encode: function( datum, ctx ){
					expect( datum ).toBe( send );
					expect( ctx.test ).toBe( true );

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
					expect( ctx.$args ).toBe( t );
				},
				success: function( data, ctx ){
					successCalled = true;

					expect( ctx.$args ).toBe( t );
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

		bmoorComm.Requestor.$settings.fetcher = function( url ){
			fetched = true;

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

		bmoorComm.Requestor.$settings.fetcher = function( url, ops ){
			fetched = true;

			expect( url ).toBe( getUrl );
			expect( ops.body ).toEqual( {content:true} );
			expect( ops.method ).toBe( 'GET' );
			expect( ops.headers ).toEqual( {foo:'bar'} );

			return ES6Promise.resolve({
				json: function(){
					return { valid: true };
				},
				status: 200
			});
		};

		var preloaded,
			req = new bmoorComm.Requestor({
				url: function( ctx ){
					expect( ctx.$args ).toBe( t );

					return getUrl;
				},
				preload: function( ctx ){
					preloaded = true;
					expect( ctx.$args ).toBe( t );
				},
				encode: function( datum, ctx ){
					expect( ctx ).toBe( t );

					return {
						content: true
					};
				},
				always: function( ctx ){
					alwaysCalled = true;
					expect( ctx.$args ).toBe( t );
				},
				success: function( data, ctx ){
					successCalled = true;

					expect( ctx.$args ).toBe( t );
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
		bmoorComm.Requestor.$settings.fetcher = function(){
			fetched = true;
			return { status: 200 };
		};

		var preloaded,
			req = new bmoorComm.Requestor({
				url: function( ctx ){
					expect( ctx.$args ).toBe( t );

					return getUrl;
				},
				preload: function( ctx ){
					preloaded = true;
					expect( ctx.$args ).toBe( t );
				},
				encode: function( datum, ctx ){
					expect( ctx ).toBe( t );
					expect( datum.foo ).toBe( 'bar' );

					return {
						content: true
					};
				},
				intercept: function( datum, ctx ){
					expect( ctx.$args ).toBe( t );
					expect( datum ).toEqual( { content: true } );

					intercepted = true;

					return {
						homeStar: 'runner'
					};
				},
				always: function( ctx ){
					alwaysCalled = true;
					expect( ctx.$args ).toBe( t );
				},
				success: function( data, ctx ){
					successCalled = true;

					expect( ctx.$args ).toBe( t );
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
		bmoorComm.Requestor.$settings.fetcher = function( url, other ){
			expect( other.body ).toBe( sample );

			return ES6Promise.reject( new Error('test error') );
		};

		var req = new bmoorComm.Requestor({
			url: function( ctx ){
				urlCalled = true;

				expect( ctx.$args ).toBe( t );

				return getUrl;
			},
			always: function( ctx ){
				alwaysCalled = true;
				expect( ctx.$args ).toBe( t );
			},
			success: function( data, ctx ){
				successCalled = true;

				expect( ctx.$args ).toBe( t );
				return {'foo':'bar'};
			},
			failure: function( res, ctx ){
				failureCalled = true;

				expect( res.message ).toBe( 'test error' );
				expect( ctx.$args ).toBe( t );
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
});