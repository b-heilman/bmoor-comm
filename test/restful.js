describe('bmoor-comm::Requestor', function(){
	it('should enable something', function(){
		var called = false,
			stream = {},
			verify = function( url ){
				expect( url ).toBe('/users/1');
			},
			response = { hello: 'world' };

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

		stream.getUser( { user:{id:1} } ).then(function( res ){
			expect( res ).toBe( response );
			expect( called ).toBe( true );
			done();
		});
	});
});