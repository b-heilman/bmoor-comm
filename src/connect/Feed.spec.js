describe('bmoor-comm::connect/Feed', function(){
	var Feed = bmoorComm.connect.Feed,
		httpMock = new bmoorComm.testing.Requestor();

	describe('basic structure', function(){
		var content,
			http = new Feed(
				{
					all: '/test/all/{{foDis}}',
					read: '/test/{{id}}',
					create: '/test/create',
					update: '/test/update/{{id}}'
				}
			);

		beforeEach(function(){
			httpMock.enable();
		});

		afterEach(function(){
			httpMock.verifyWasFulfilled();
		});

		it('should properly define http.read', function( done ){
			httpMock.expect('/test/101').respond('OK');

			http.read({id:101}).then(
				function( res ){
					expect( res ).toBe( 'OK' );
					done();
				},
				function( ex ){
					console.log( 'Feed.spec :: test - fail', ex );
				}
			);
		});

		it('should properly define http.all', function( done ){
			httpMock.expect('/test/all/1').respond('OK');

			http.all({foDis:1}).then(function( res ){
				expect( res ).toBe( 'OK' );
				done();
			});
		});

		it('should properly define http.list', function( done ){
			httpMock.expect('/test/all/2').respond('OK');

			http.list({foDis:2}).then(function( res ){
				expect( res ).toBe( 'OK' );
				done();
			});
		});

		it('should properly define http.create', function( done ){
			httpMock.expect('/test/create').respond('OK');
			content = {};

			http.create( null, content ).then(function( res ){
				expect( res ).toBe( 'OK' );
				done();
			});
		});

		it('should properly define http.update', function( done ){
			httpMock.expect('/test/update/1').respond('OK');
			content = {};

			http.update( {id:1}, content ).then(function( res ){
				expect( res ).toBe( 'OK' );
				done();
			});
		});
	});

	describe('list minimize',function(){
		it('should work correctly', function( done ){
			var wasCalled = false,
				http = new Feed(
					{
						all: {
							url: '/test/all',
							intercept: [
								{eins: '1', zwei: '2'},
								{eins: 'one', zwei: 'two'}
							]
						}
					},
					{
						minimize: function( obj ){
							return { foo: obj.eins };
						}
					}
				);

			bmoorComm.Requestor.clearCache();
			bmoorComm.Requestor.$settings.fetcher = function(){
				wasCalled = true;

				return ES6Promise.resolve({
					json: function(){
						return 'OK';
					},
					status: 200
				});
			};

			http.list().then(function( res ){
				expect( wasCalled ).toBe( false );
				expect( res ).toEqual([
					{ foo: '1' },
					{ foo: 'one' }
				]);

				done();
			},function( ex ){
				console.log( 'Feed.spec :: test - fail', ex );
			});
		});
	});

	describe('inflation', function(){
		var response,
			requestUrl,
			http = new Feed(
				{
					all: {
						url: '/test/all'
					},
					read: {
						url: '/test/get/{{id}}'
					}
				},
				{
					inflate: function( obj ){
						return { eins: obj.eins+1, zwei: obj.zwei+10 };
					}
				}
			);

		beforeEach(function(){
			bmoorComm.Requestor.clearCache();
			bmoorComm.Requestor.$settings.fetcher = function( url ){
				expect( url ).toBe( requestUrl );

				return ES6Promise.resolve({
					json: function(){
						return response;
					},
					status: 200
				});
			};
		});

		it('should work on an all call', function( done ){
			response = [
				{ eins: 1, zwei: 2 },
				{ eins: 10, zwei: 20 }
			];
			requestUrl = '/test/all';

			http.all().then(function( res ){
				expect( res ).toEqual([
					{ eins: 2, zwei: 12 },
					{ eins: 11, zwei: 30 }
				]);
				done();
			});
		});

		it('should work on an read call', function( done ){
			response = { eins: 1, zwei: 2 };
			requestUrl = '/test/get/1';

			http.read({id:1}).then(function( res ){
				expect( res ).toEqual(
					{ eins: 2, zwei: 12 }
				);
				done();
			});
		});
	});

	describe('deflation', function(){
		var requestUrl,
			requestObj,
			http = new Feed(
				{
					create: {
						url: '/test/create'
					},
					update: {
						url: '/test/update/{{id}}'
					}
				},
				{
					deflate: function( obj ){
						return { eins: obj.eins+1, zwei: obj.zwei+10 };
					}
				}
			);

		beforeEach(function(){
			bmoorComm.Requestor.clearCache();
			bmoorComm.Requestor.$settings.fetcher = function( url, obj ){
				expect( url ).toEqual( requestUrl );
				expect( obj.body ).toEqual( requestObj );

				return ES6Promise.resolve({
					json: function(){
						return 'OK';
					},
					status: 200
				});
			};
		});

		it('should work on an all call', function( done ){
			var obj = { eins: 1, zwei: 2 };

			requestObj = { eins: 2, zwei: 12 };
			requestUrl = '/test/create';

			http.create(obj).then(function( res ){
				expect( res ).toBe( 'OK' );
				done();
			});
		});

		it('should work on an update call', function( done ){
			var obj = { id: 1, eins: 1, zwei: 2 };

			requestObj = { eins: 2, zwei: 12 };
			requestUrl = '/test/update/1';

			http.update(obj).then(function( res ){
				expect( res ).toBe( 'OK' );
				done();
			});
		});
	});
});