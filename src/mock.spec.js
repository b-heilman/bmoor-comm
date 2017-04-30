describe('bmoor-comm::mock', function(){
	it('should enable something', function( done ){
		var mockery,
			called = false,
			stream = {},
			userId = 1,
			verify = function( url ){
				expect( url ).toBe('/users/'+userId);
			},
			response = { hello: 'world' },
			mock = { foo: 'bar' };

		bmoorComm.Requestor.$settings.fetcher = function( url ){
			verify( url );
			called = true;
			return ES6Promise.resolve({
				json: function(){
					return response;
				},
				status: 200
			});
		};

		bmoorComm.restful( stream, {
			getUser: {
				url: function( ctx ){
					return '/users/'+ctx.user.id;
				}
			}
		});

		mockery = bmoorComm.mock( stream, { getUser: mock } ); 

		userId = 1;
		stream.getUser( { user:{id:1} } ).then(function( res ){
			expect( res ).toBe( response );
			expect( called ).toBe( true );
		
			called = false;
			mockery.enable();
			userId = 2;
			stream.getUser( { user:{id:2} } ).then(function( res ){
				expect( res ).toBe( mock );
				expect( called ).toBe( false );
			
				called = false;
				mockery.disable();
				userId = 1;
				stream.getUser( { user:{id:1} } ).then(function( res ){
					expect( res ).toBe( response );
					expect( called ).toBe( true );
					done();
				});
			});
		});
	});
});