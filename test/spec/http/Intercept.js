describe('bmoor.http.Intercept', function(){
	var Intercept,
		Router,
		XHR = window.XMLHttpRequest;

	beforeEach( bMoor.test.injector(['bmoor.http.Intercept','bmoor.http.Router', function( I, R ){
		Intercept = I;
		Router = R;
	}]));

	it('should not override XMLHttpRequest without enabling', function(){
		expect( (new window.XMLHttpRequest()).$wrapped ).toBeUndefined();
	});

	it('should not override XMLHttpRequest without enabling', function(){
		Intercept.enable();
		expect( (new window.XMLHttpRequest()).$wrapped ).toBeDefined();
	});

	it('should allow for route specific interception', function(){
		var t,
			xhr;

		Intercept.enable();
		Intercept.routes({
			'/foobar' : function(){
				return {
					status : 200,
					response : {
						hello : 'world'
					}
				}
			}
		});

		xhr = new window.XMLHttpRequest();
		xhr.onload = function(){
			t = xhr.response;
		};

		xhr.open('GET', '/foobar');
		xhr.send();

		expect( t ).toEqual( {hello:'world'} );
	});

	describe('router', function(){
		var router,
			t,
			xhr;
			
		beforeEach(function(){
			Intercept.enable();
			router = new Router({
				'/foobar' : function(){
					return {
						status : 200,
						response : {
							hello : 'world'
						}
					}
				}
			}); 
			Intercept.router( router );
		});

		it('should allow for specific interception', function(){
			xhr = new window.XMLHttpRequest();
			xhr.onload = function(){
				t = xhr.response;
			};

			xhr.open('GET', '/foobar');
			xhr.send();

			expect( t ).toEqual( {hello:'world'} );
		});
	});
	
});