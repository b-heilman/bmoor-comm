describe('bmoor-comm::connect/Storage', function(){
	var Storage = bmoorComm.connect.Storage,
		Feed = bmoorComm.connect.Feed;

	describe('localStorage', function(){
		var store;

		beforeEach(function(){
			localStorage.removeItem('test');
			
			store = new Storage('test');
		});
		
		it('should allow saving', function( done ){
			var t = { hello: '1', world: '2' };

			expect( store.$collection.length ).toBe( 0 );
			store.list().then(function( res ){
				expect( res.length ).toBe( 0 );
			
				return store.create( t ).then(function(){
					expect( t.id ).toBeDefined();
					expect( store.$collection.length ).toBe( 1 );

					return store.list().then(function( res2 ){
						expect( res2.length ).toBe( 1 );

						return store.update( res2[0].id, { partial: true } ).then(function(){
							var s = new Storage('test');

							expect( s.$collection.length ).toBe( 1 );

							return s.list().then(function( res3 ){
								expect( res3.length ).toBe( 1 );
								expect( res3[0].partial ).toBe( true );

								done();
							});
						});
					});
				});
			},
			function( ex ){
				console.log( 'Storage.spec :: test - fail', ex );
			});
		});
	});

	describe('feed pass through', function(){
		var feed,
			storage,
			wasCalled,
			requestUrl;

		beforeEach(function(){
			feed = new Feed({
				all: '/test/all',
				create: '/test/create',
				update: '/test/update/{{id}}'
			});

			wasCalled = false;

			bmoorComm.Requestor.clearCache();
			bmoorComm.Requestor.settings.fetcher = function( url ){
				wasCalled = true;

				expect( url ).toBe( requestUrl );

				return ES6Promise.resolve({
					json: function(){
						return [{id:1,value:'woot'}];
					},
					status: 200
				});
			};
		});

		it('should work - all', function( done ){
			requestUrl = '/test/all';

			storage = new Storage('test-storage',{
				feed: feed,
				clear: true,
				session: true
			});

			storage.all().then(function(){
				expect( wasCalled ).toBe( true );

				done();
			});
		});

		it('should work - read', function( done ){
			requestUrl = '/test/all';

			storage = new Storage('test-storage',{
				feed: feed,
				clear: true,
				session: true
			});

			storage.read({id:1}).then(function( res ){
				expect( res.id ).toBe( 1 );
				expect( wasCalled ).toBe( true );

				done();
			});
		});

		it('should work - create', function( done ){
			requestUrl = '/test/create';

			storage = new Storage('test-storage',{
				feed: feed,
				clear: true,
				session: true
			});

			storage.create({id:1}).then(function(){
				expect( wasCalled ).toBe( true );

				done();
			});
		});

		it('should work - update', function( done ){
			requestUrl = '/test/update/1';

			storage = new Storage('test-storage',{
				feed: feed,
				clear: true,
				session: true
			});

			storage.update({id:1}).then(function(){
				expect( wasCalled ).toBe( true );

				done();
			});
		});

		describe('when mocked', function(){
			var mock;

			beforeEach(function(){
				mock = bmoorComm.mock( feed, { 
					all: [{ 
						id: 'test-1', 
						foo: 'bar'
					}] 
				});
			});

			it('should still work', function( done ){
				mock.enable();

				storage = new Storage('test-storage',{
					feed: feed,
					clear: true,
					session: true
				});

				storage.all().then(function( res ){
					expect( wasCalled ).toBe( false );
					expect( res ).toEqual([
						{ 
							id: 'test-1', 
							foo: 'bar'
						}
					]);

					done();
				});
			});
		});
	});
});