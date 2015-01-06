describe('bmoor.storage.Local', function(){
	var Local;

	beforeEach(bMoor.test.injector(['bmoor.storage.Local',function( L ){
		Local = L;
	}]));

	it('should be defined', function(){
		expect( Local ).toBeDefined();
	});

	describe('interaction with local storage', function(){
		var o;

		beforeEach(function(){
			o = new Local('helloWorld');
		});

		it('should allow for writing', function(){
			o.create( 'id', {'id':'woot',foo:'bar'} );

			expect( localStorage['helloWorld'] ).toBeDefined();
			expect( localStorage['helloWorld-woot'] ).toBeDefined();
		});

		it('should allow for getAll', function(){
			o.create( 'id', {'id':1,'num':'eins'} );
			o.create( 'id', {'id':2,'num':'zwei'} );
			o.create( 'id', {'id':3,'num':'drei'} );

			o.getAll().then(function( t ){
				expect( t.length ).toBe( 4 );
			});

			expect( localStorage['helloWorld-2'] ).toBeDefined();
		});

		it('should allow to get by id', function(){
			o.get( 1 ).then(function( t ){
				expect( t ).toEqual( {'id':1,'num':'eins'} );
			});
		});

		it('should allow many to get by id', function(){
			o.get( [3,2] ).then(function( t ){
				expect( t ).toEqual( [{'id':3,'num':'drei'},{'id':2,'num':'zwei'}] );
			});
		});

		it('should allow removal', function(){
			o.remove( 1 ).then(function( t ){
				expect( t ).toEqual( 1 );
			});

			o.getAll().then(function( t ){
				expect( t.length ).toBe( 3 );
			});

			expect( localStorage['helloWorld-1'] ).toBeUndefined();
		});

		it('should destroy all content', function(){
			o.destroy();

			expect( localStorage['helloWorld'] ).toBeUndefined();
			expect( localStorage['helloWorld-woot'] ).toBeUndefined();
		});
	});
});