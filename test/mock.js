describe('bmoor-comm::Requestor', function(){
	it('should enable something', function(){
		var mockery,
			called = false,
			stream = {},
			verify = function( url ){
				expect( url ).toBe('/users/1');
			},
			response = { hello: 'world' },
			mock = { foo: 'bar' };

		bmoorComm.Requestor.$settings.fetcher = function( url, ops ){
			verify( url );
			called = true;
			return Promise.resolve({
				json: function(){
					return response;
				},
				status: 200
			});
		};

		bmoorComm.restful( stream, {
			getUser: {
				url: function( ctx ){
					return '/users/'+ctx.user.id
				}
			}
		});

		mockery = bmoorComm.mock( stream, { getUser: mock } ); 

		stream.getUser( { user:{id:1} } ).then(function( res ){
			expect( res ).toBe( response );
			expect( called ).toBe( true );
		});

		called = false;
		mockery.enable(),
		stream.getUser( { user:{id:2} } ).then(function( res ){
			expect( res ).toBe( mock );
			expect( called ).toBe( false );
		});

		called = false;
		mockery.disable(),
		stream.getUser( { user:{id:1} } ).then(function( res ){
			expect( res ).toBe( response );
			expect( called ).toBe( true );
			done();
		});
	});
});