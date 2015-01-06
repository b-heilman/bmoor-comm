describe('bmoor.storage.Remote', function(){
	var Remote,
		settings,
		Http;

	beforeEach(bMoor.test.injector(['bmoor.storage.Remote','bmoor.comm.Stream','bmock.comm.Http', function( R, St, H ){
		Remote = R;
		settings = St.settings;
		Http = H;
	}]));

	it( 'should be defined', function(){
		expect( Remote ).toBeDefined();
	});

	describe( 'interaction with remote storage', function(){
		var http,
			instance;

		beforeEach(function(){
			http = new Http();
			settings.http = http.getConnector();
			instance = new Remote('user', '/user');
		});
		
		it('should define properties', function(){
			expect( instance.get ).toBeDefined();
		});

		it('should allow for writing', function(){
			var res;

			http.expect( 'POST', '/user' ).respond(200, {
				id : 'woot',
				foo : 'bar'
			});

			instance.create( 'id', {foo:'bar'} ).then(function( t ){
				res = t;
			});

			expect( res ).toEqual( {id:'woot',foo:'bar'} );
			http.hasMetExpectations();
		});

		it('should allow for getAll', function(){
			var res,
				response = [
					{'id':1,'num':'eins'},
					{'id':2,'num':'zwei'},
					{'id':3,'num':'drei'}
				];
			
			http.expect( 'GET', '/user' ).respond( 200, response );

			instance.getAll().then(function( t ){
				res = t;
			});

			expect( res ).toEqual( response );
			http.hasMetExpectations();
		});

		it('should allow to get by id', function(){
			var res,
				response = {'id':1,'num':'eins'};

			http.expect( 'GET', '/user/1' ).respond( 200, response );

			instance.get( 1 ).then(function( t ){
				res = t;
			});

			expect( res ).toEqual( response );
			http.hasMetExpectations();
		});

		it('should allow many to get by id', function(){
			var res,
				response = [{'id':3,'num':'drei'},{id:2,num:'zwei'}];

			http.expect( 'GET', '/user/3,2' ).respond( 200, response );

			instance.get( [3,2] ).then(function( t ){
				res = t;
			});

			expect( res ).toEqual( response );
			http.hasMetExpectations();
		});

		it('should allow removal', function(){
			var res;

			http.expect( 'DELETE', '/user/1' ).respond( 200, {
				eins : 1
			});

			instance.remove( 1 ).then(function( t ){
				res = t;
			});

			expect( res ).toEqual( {eins:1} );
			http.hasMetExpectations();
		});

		it('should destroy all content', function(){
			/*
			TODO
			o.destroy();

			expect( localStorage['helloWorld'] ).toBeUndefined();
			expect( localStorage['helloWorld-woot'] ).toBeUndefined();
			*/
		});
	});
});