describe('bmoor.http.Router', function(){
	var Router;

	beforeEach(bMoor.test.injector(['bmoor.http.Router', function( R ){
		Router = R;
	}]));

	it('should be defined', function(){
		expect( Router ).toBeDefined();
	});

	describe('matching pathes', function(){
		var r;

		beforeEach(function(){
			r = new Router({
				'/foo/bar' : function(){
					return 'foobar-' + Array.prototype.slice.call(arguments).join('/');
				},
				'/foo/bar/more' : function(){
					return 'more';
				},
				'/some/thing' : function(){
					return 'something';
				}
			});
		}); 

		it('should match basics', function(){
			expect( r.match('/foo/bar') ).toBe( 'foobar-' );
		});
		
		it('should match children', function(){
			expect( r.match('/foo/bar/more') ).toBe( 'more' );
		});

		it('should match others', function(){
			expect( r.match('/some/thing') ).toBe( 'something' );
		});

		it('should match remainders', function(){
			expect( r.match('/foo/bar/eins/zwei') ).toBe( 'foobar-eins/zwei' );
		});
	});

	describe('with methods', function(){
		var r;

		beforeEach(function(){
			r = new Router({
				'/foo/bar' : function(){
					return 'foobar-' + Array.prototype.slice.call(arguments).join('/');
				},
				'/foo/bar/more' : function(){
					return 'more';
				},
				'/some/thing' : function(){
					return 'something';
				}
			}, { method : 'POST' } );

			r.addRoute( '/foo/bar', { method : 'GET' }, function(){
				return 'get some';
			});
		}); 

		it('POST - should match basics', function(){
			expect( r.match('POST','/foo/bar') ).toBe( 'foobar-' );
		});
		
		it('GET - should match basics', function(){
			expect( r.match('GET','/foo/bar') ).toBe( 'get some' );
		});
		
		it('GET - should be default', function(){
			expect( r.match('/foo/bar') ).toBe( 'get some' );
		});
		
		it('should match children', function(){
			expect( r.match('POST', '/foo/bar/more') ).toBe( 'more' );
		});

		it('should match others', function(){
			expect( r.match('post', '/some/thing') ).toBe( 'something' );
		});

		it('should match remainders', function(){
			expect( r.match('POST', '/foo/bar/eins/zwei') ).toBe( 'foobar-eins/zwei' );
		});
	});

});