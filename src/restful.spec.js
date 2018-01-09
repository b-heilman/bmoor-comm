describe('bmoor-comm::restful', function(){
	it('should enable something', function( done ){
		var called = false,
			stream = {},
			verify = function( url ){
				expect( url ).toBe('/users/1');
			},
			response = { hello: 'world' };

		bmoorComm.Requestor.clearCache();
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

		stream.getUser( { user:{id:1} } ).then(function( res ){
			expect( res ).toBe( response );
			expect( called ).toBe( true );
			done();
		});
	});

	it('should allow an inteface to be defined', function( done ){
		var called = false,
			stream = {},
			verify = function( url ){
				expect( url ).toBe('/users/foo/bar');
			},
			response = { hello: 'world' };

		bmoorComm.Requestor.clearCache();
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
			get: {
				url: function( ctx ){
					return '/users/'+ctx.team+'/'+ctx.id;
				},
				interface: function( team, id ){
					return {
						args: {
							team: team,
							id: id
						}
					};
				}
			}
		});

		stream.get( 'foo', 'bar' ).then(function( res ){
			expect( res ).toBe( response );
			expect( called ).toBe( true );
			done();
		});
	});
});