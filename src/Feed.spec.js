
describe('bmoor-comm::connect/Feed', function(){
	var Feed = bmoorComm.connect.Feed,
		Model = bmoorComm.connect.model.Model,
		httpMock = new bmoorComm.testing.Requestor();

	describe('basic structure', function(){
		var content,
			http = new Feed({
				all: '/test/all/{{foDis}}',
				read: '/test/{{id}}',
				create: '/test/create',
				update: '/test/update/{{id}}'
			});

		beforeEach(function(){
			httpMock.enable();
		});

		afterEach(function(){
			httpMock.verifyWasFulfilled();
		});

		describe('::read', function(){
			it('should work correctly', function( done ){
				httpMock.expect('/test/101').respond('OK');

				http.read({id:101}).then(
					function( res ){
						expect( res ).toBe( 'OK' );
						done();
					},
					function( ex ){
						console.log( 'Feed.spec :: test - fail', ex.message );
					}
				);
			});

			it('should work correctly', function( done ){
				httpMock.expect('/test/101').reject('OK');

				http.read({id:101}).then(
					function(){
						expect(1).toBe(0);
						done();
					},
					function( ex ){
						expect(ex.message).toBe('OK');
						done();
					}
				);
			});
		});

		it('should properly define http.all', function( done ){
			httpMock.expect('/test/all/1').respond('OK');

			http.all({foDis:1}).then(function( res ){
				expect( res ).toBe( 'OK' );
				done();
			});
		});

		it('should properly define http.list', function( done ){
			httpMock.expect('/test/all/2',null,{method:function( m ){ expect(m).toBe('GET'); }})
			.respond('OK');

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

	describe('search functionality', function(){
		describe('via query', function(){
			var content,
				http = new Feed({
					query: '/test/query'
				});

			beforeEach(function(){
				httpMock.enable();
			});

			afterEach(function(){
				httpMock.verifyWasFulfilled();
			});
		
		
			it('should properly define http.query', function( done ){
				httpMock.expect('/test/query?id=1&foo.bar=OK').respond('OK');
				content = {};

				http.query({id:1, foo:{bar:'OK'}}).then(function( res ){
					expect( res ).toBe( 'OK' );
					done();
				});
			});
		});

		describe('via search as a string', function(){
			var content,
				http = new Feed({
					search: '/test/search/{{field1}}/{{field2}}'
				});

			beforeEach(function(){
				httpMock.enable();
			});

			afterEach(function(){
				httpMock.verifyWasFulfilled();
			});
		
		
			it('should properly define http.search', function( done ){
				httpMock.expect('/test/search/ok-1/ok-2').respond('OK');
				content = {};

				http.search({field1:'ok-1',field2:'ok-2'}).then(function( res ){
					expect( res ).toBe( 'OK' );
					done();
				});
			});
		});

		describe('via search as an object', function(){
			var content,
				http = new Feed({
					search: {
						'field1': '/test/search/{{field1}}/{{field3}}',
						'field2': '/test/search/{{field2}}/{{field3}}'
					}
				});

			beforeEach(function(){
				httpMock.enable();
			});

			afterEach(function(){
				httpMock.verifyWasFulfilled();
			});
		
		
			it('should properly define http.search for field1', function( done ){
				httpMock.expect('/test/search/ok-1/ok-3').respond('OK');
				content = {};

				http.search({field1:'ok-1', field3:'ok-3'}).then(function( res ){
					expect( res ).toBe( 'OK' );
					done();
				});
			});

			it('should properly define http.search for field2', function( done ){
				httpMock.expect('/test/search/ok-2/ok-3').respond('OK');
				content = {};

				http.search({field2:'ok-2', field3:'ok-3'}).then(function( res ){
					expect( res ).toBe( 'OK' );
					done();
				});
			});
		});
	});

	describe('list minimize', function(){
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
						},
						base: {
							hello: 'world'
						}
					}
				);

			expect( http.hello ).toBe('world');

			bmoorComm.Requestor.clearCache();
			bmoorComm.Requestor.settings.fetcher = function(){
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
				console.log(ex.message);
				console.log(ex.stack);

				expect(1).toBe(0);
				done();
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
					},
					query: '/test/query',
					create: '/test/create',
					update: '/test/update/{{id}}',
					search: '/test/search/{{field1}}/{{field2}}'
				},
				{
					inflate: function( obj ){
						return { eins: obj.eins+1, zwei: obj.zwei+10 };
					}
				}
			);

		beforeEach(function(){
			bmoorComm.Requestor.clearCache();
			bmoorComm.Requestor.settings.fetcher = function( url ){
				expect( url ).toBe( requestUrl );

				return ES6Promise.resolve({
					json: function(){
						return response;
					},
					status: 200
				});
			};
		});

		it('should properly define http.query', function( done ){
			response = [{ eins: 1, zwei: 2 }];
			requestUrl = '/test/query?foo=bar';

			http.query({foo:'bar'}).then(function( res ){
				expect( res ).toEqual([
					{ eins: 2, zwei: 12 }
				]);

				done();
			});
		});

		it('should properly define http.search', function( done ){
			response = [{ eins: 1, zwei: 2 }];
			requestUrl = '/test/search/ok-1/ok-2';

			http.search( {field1:'ok-1',field2:'ok-2'} ).then(function( res ){
				expect( res ).toEqual([
					{ eins: 2, zwei: 12 }
				]);

				done();
			});
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

		it('should properly define http.create', function( done ){
			response = { eins: 1, zwei: 2 };
			requestUrl = '/test/create';

			http.create( null, {} ).then(function( res ){
				expect( res ).toEqual(
					{ eins: 2, zwei: 12 }
				);

				done();
			});
		});

		it('should properly define http.update', function( done ){
			response = { eins: 1, zwei: 2 };
			requestUrl = '/test/update/1';

			http.update( {id:1}, {} ).then(function( res ){
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
			bmoorComm.Requestor.settings.fetcher = function( url, obj ){
				expect( url ).toEqual( requestUrl );
				expect( obj.body ).toEqual( 
					JSON.stringify(requestObj)
				);

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

	describe('working with live server',function(){
		var comm;

		beforeEach(function(){
			bmoorComm.Requestor.clearCache();
			bmoorComm.Requestor.settings.fetcher = function( url, obj ){
				return fetch( url, obj );
			};

			comm = new Feed({
				all: 'http://localhost:10001/test',
				create: 'http://localhost:10001/test-json',
				update: {
					url: 'http://localhost:10001/test-form/{{id}}',
					method: 'POST'
				},
				read: 'http://localhost:10001/test/{{id}}'
			});
		});

		it('should be able to get all', function( done ){
			comm.all().then(
				function( res ){
					expect( res ).toEqual( [] );
					done();
				},
				function( err ){
					console.log( 'fail', err.message, err );
				}
			);
		});

		it('should be able to create with json', function( done ){
			var t = {'foo':'bar'};

			comm.create( t ).then(
				function( res ){
					expect( res.id ).toBeDefined();
					expect( res.$sanity ).toEqual( t );

					done();
				},
				function( err ){
					console.log( 'fail', err.message, err );
				}
			);
		});

		it('should be able to create with FormData', function( done ){
			var t = new FormData();

			t.set('foo','bar');

			comm.update( {id:1},t ).then(
				function( res ){
					expect( res.id ).toBeDefined();
					expect( res.$sanity ).toEqual( {'foo':'bar'} );

					done();
				},
				function( err ){
					console.log( 'fail', err.message, err );
				}
			);
		});
	});

	describe('readMany, via test server', function(){
		var comm;

		beforeEach(function(){
			bmoorComm.Requestor.clearCache();
			bmoorComm.Requestor.settings.fetcher = function( url, obj ){
				return fetch( url, obj );
			};

			comm = new Feed({
				readMany: 'http://localhost:10001/test-many?test[]={{myId}}'
			},{
				id: 'myId'
			});
		});

		it('should accept single values as ids', function( done ){
			comm.readMany([1,2,3,4])
			.then(function( res ){
				expect( res.length ).toBe( 4 );

				expect( res[0].id ).toBe( 1 );
				expect( res[1].id ).toBe( 2 );
				expect( res[2].id ).toBe( 3 );
				expect( res[3].id ).toBe( 4 );

				done();
			});
		});

		it('should accept objects and pull the ids', function( done ){
			comm.readMany([
				{myId:1},
				{myId:2},
				{myId:3},
				{myId:4}
			]).then(function( res ){
				expect( res.length ).toBe( 4 );

				expect( res[0].id ).toBe( 1 );
				expect( res[1].id ).toBe( 2 );
				expect( res[2].id ).toBe( 3 );
				expect( res[3].id ).toBe( 4 );

				done();
			});
		});

		describe('route url generation', function(){
			it('should work with an array of ids', function(done){
				httpMock.expect('http://localhost:10001/test-many?test[]=1&test[]=2&test[]=3&test[]=4')
				.respond([{foo:'bar'}]);

				comm.readMany([1,2,3,4])
				.then(() => {
					done();
				}).catch(ex => {
					console.log(ex.message);
					expect(0).toBe(1);

					done();
				});
			});

			it('should work with an array of objects', function(done){
				httpMock.expect('http://localhost:10001/test-many?test[]=1&test[]=2&test[]=3&test[]=4')
				.respond([{foo:'bar'}]);

				comm.readMany([
					{myId:1},
					{myId:2},
					{myId:3},
					{myId:4}
				]).then(() => {
					done();
				}).catch(ex => {
					console.log(ex.message);
					expect(0).toBe(1);

					done();
				});
			});

			it('should work with an array as the id', function(done){
				httpMock.expect('http://localhost:10001/test-many?test[]=1,2,3,4')
				.respond([{foo:'bar'}]);

				comm.readMany({myId:[1,2,3,4]})
				.then(() => {
					done();
				}).catch(ex => {
					console.log(ex.message);
					expect(0).toBe(1);

					done();
				});
			});
		});
	});

	describe('using a connect/Model', function(){
		var content,
			http = new Feed( new Model({table:'test',path:''}) );

		beforeEach(function(){
			httpMock.enable();
		});

		afterEach(function(){
			httpMock.verifyWasFulfilled();
		});

		it('should properly define http.read', function( done ){
			httpMock.expect('/test/instance/101').respond('OK');

			http.read({id:101}).then(
				function( res ){
					expect( res ).toBe( 'OK' );
					done();
				},
				function( ex ){
					console.log( 'Feed.spec :: test - fail', ex.message );
				}
			);
		});

		it('should properly define http.readMany', function( done ){
			httpMock.expect('/test/many?id[]=101',null,{
				method: function( m ){ expect(m).toBe('GET'); }
			}).respond('OK');

			http.readMany([101]).then(
				function( res ){
					expect( res ).toBe( 'OK' );
					done();
				},
				function( ex ){
					console.log( 'Feed.spec :: test - fail', ex.message );
				}
			);
		});

		it('should properly define http.readMany via objects', function( done ){
			httpMock.expect('/test/many?id[]=101',null,{
				method: function( m ){ expect(m).toBe('GET'); }
			}).respond('OK');

			http.readMany([{id:101}]).then(
				function( res ){
					expect( res ).toBe( 'OK' );
					done();
				},
				function( ex ){
					console.log( 'Feed.spec :: test - fail', ex.message );
				}
			);
		});

		it('should properly define http.all', function( done ){
			httpMock.expect('/test',null,{
				method: function( m ){ expect(m).toBe('GET'); }
			}).respond('OK');

			http.all().then(function( res ){
				expect( res ).toBe( 'OK' );
				done();
			});
		});

		it('should properly define http.list', function( done ){
			httpMock.expect('/test/list',null,{
				method: function( m ){ expect(m).toBe('GET'); }
			}).respond('OK');

			http.list().then(function( res ){
				expect( res ).toBe( 'OK' );
				done();
			});
		});

		it('should properly define http.query', function( done ){
			httpMock.expect('/test?foo=bar',null,{
				method: function( m ){ expect(m).toBe('GET'); }
			})
			.respond('OK');

			http.query({foo:'bar'}).then(function( res ){
				expect( res ).toBe( 'OK' );
				done();
			});
		});

		it('should properly define http.create', function( done ){
			httpMock.expect('/test',null,{
				method: function( m ){ expect(m).toBe('POST'); }
			}).respond('OK');
			content = {};

			http.create( null, content ).then(function( res ){
				expect( res ).toBe( 'OK' );
				done();
			});
		});

		it('should properly define http.update', function( done ){
			httpMock.expect('/test/1',null,{
				method: function( m ){ expect(m).toBe('PATCH'); }
			}).respond('OK');
			content = {};

			http.update( {id:1}, content ).then(function( res ){
				expect( res ).toBe( 'OK' );
				done();
			});
		});

		it('should properly define http.delete', function( done ){
			httpMock.expect('/test/1',null,{
				method: function( m ){ expect(m).toBe('DELETE'); }
			}).respond('OK');
			content = {};

			http.delete( {id:1}, content ).then(function( res ){
				expect( res ).toBe( 'OK' );
				done();
			});
		});
	});
});