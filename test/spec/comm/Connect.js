describe('bmoor.comm.Connect', function(){
	var connect = bMoor.exists('bmoor.comm.Connect'),
		Interceptor = bMoor.exists('bmock.comm.XhrIntercept');

	describe( 'intercepting', function(){
		it( 'should would', function(){
			Interceptor.enable();
			Interceptor.expect({
				response : {
					foo : 'bar'
				}
			});

			connect({
				url : 'somewhere.htm',
				data : { woo : 'c-all' }
			}).then(function( results ){
				expect( results.data ).toEqual( {foo:'bar'} );
			});
		});

		it( 'should fail with status', function(){
			var t;

			Interceptor.enable();
			Interceptor.expect({
				response : {
					foo : 'bar'
				},
				status : 404
			});

			connect({
				url : 'somewhere.htm',
				data : { woo : 'c-all' }
			}).then(
				function(){
					t = false;
				},
				function(){
					t = true;
				}
			);

			expect( t ).toBe( true );
		});
	});
	
});