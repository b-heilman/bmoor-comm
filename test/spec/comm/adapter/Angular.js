describe('bmoor.comm.adapter.Angular', function(){
	var http,
		root,
		connect = bMoor.exists('bmoor.comm.adapter.Angular');

	beforeEach(inject(function ( $rootScope, _$httpBackend_ ) {
        http = _$httpBackend_;
        root = $rootScope;
    }));

	it('should be defined', function(){
		expect( connect ).toBeDefined();
	});

	/*
	describe( 'intercepting', function(){
		it( 'should would', function(){
			var called;

			http.expectGET( 'angular.htm' )
				.respond({
					foo : 'bar'
				});

			root.$apply();

			connect({
				url : 'angular.htm',
				data : { woo : 'a-all' }
			}).then(
				function( results ){
					called = true;
					expect( results.data ).toEqual( {foo:'bar'} );
				},
				function(){
					called = false;
				}
			);

			root.$apply();
			//http.flush();

			expect( called ).toBe( true );
		});

		it( 'should fail with status', function(){
			var called;

			http.expectGET( 'angular.htm' )
				.respond( 404, {
					foo : 'bar'
				});

			connect({
				url : 'angular.htm',
				data : { woo : 'a-all' }
			}).then(
				function(){
					called = false;
				},
				function( results ){
					called = true;
					expect( results.data ).toEqual( {foo:'bar'} );
				}
			);

			http.flush();

			expect( t ).toBe( true );
		});
	});
	*/
});