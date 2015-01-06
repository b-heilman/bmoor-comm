describe('bmoor.comm.Streamer', function(){
	var Streamer,
		settings,
		Http;

	beforeEach(bMoor.test.injector(['bmoor.comm.Streamer','bmoor.comm.Stream','bmock.comm.Http', function( S, St, H ){
		Streamer = S;
		settings = St.settings;
		Http = H;
	}]));

	describe( 'permit allow multiple streams to be configured at once', function(){
		var http,
			Construct,
			instance;

		beforeEach(function(){
			http = new Http();
			settings.http = http.getConnector();
			Construct = bMoor.test.make({
				extend : [
					new Streamer({
						'callTest' : {
							url : 'test/test.htm'
						},
						'lingerTest' : {
							url : 'test/linger.htm'
						},
						'anotherTest' : {
							url : 'test/another.htm',
							linger : 0
						},
						'cachedTest' : {
							url : 'test/cached.htm',
							cached : true,
							linger : 0
						},
						'responseTest' : {
							url : 'test/response.htm',
							response : {
								test : '10-4'
							}
						}
					})
				]
			});

			instance = new Construct();
		});
		

		it ( 'should define service endpoints', function(){
			expect( Construct.prototype.callTest ).toBeDefined();
			expect( instance.callTest ).toBeDefined();
		});

		it ( 'should allow for a url to be requested and passed back data', function(){
			http.expect( 'test/test.htm' ).respond( 200, {
				foo : 'bar'
			});

			instance.callTest().then(function( data ){
				expect( data.foo ).toBe( 'bar' );
			});
		});
		
		it ( 'should not cache a url by default, with a linger', function(){
			http.expect( 'test/linger.htm' ).respond( 200, {
				eins : 'zwei'
			});

			instance.lingerTest().then(function( data ){
				expect( data.eins ).toBe( 'zwei' );
			});

			instance.lingerTest().then(function( data ){
				expect( data.eins ).toBe( 'zwei' );
			});

			http.hasMetExpectations();
		});

		it ( 'should not cache a url by default, without a linger', function(){
			http.expect( 'test/another.htm' ).respond( 200, {
				eins : 'zwei'
			});

			instance.anotherTest().then(function( data ){
				expect( data.eins ).toBe( 'zwei' );
			});

			instance.anotherTest().then(function( data ){
				expect( data.eins ).toBe( 'zwei' );
			});

			http.hasMetExpectations();
		});

		it ( 'should allow requests to be cached', function(){
			http.expect( 'test/cached.htm' ).respond( 200, {
				foo : 'bar'
			});

			instance.cachedTest().then(function( data ){
				expect( data.foo ).toBe( 'bar' );
			});

			instance.cachedTest().then(function( data ){
				expect( data.foo ).toBe( 'bar' );
			});

			http.hasMetExpectations();
		});

		it ( 'should allow responses to be injected', function(){
			instance.responseTest().then(function( data ){
				expect( data.test ).toBe( '10-4' );
			});

			http.hasMetExpectations();
		});
	});
});