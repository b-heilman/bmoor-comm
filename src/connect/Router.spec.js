function handleError( done ){
	return function( ex ){
		console.log( ex );
		expect( 'valid' ).toBe( false );

		done();
	};
}

describe('bmoor-comm::connect/Router', function(){
	var root = '//localhost:10001',
		Feed = bmoorComm.connect.Feed,
		Model = bmoorComm.connect.model.Model,
		model = require('../../test/model.js'),
		Router = bmoorComm.connect.router.Router,
		killSwitch = new Feed({
			read: root+'/env/router-kill'
		});

	describe('building routes', function(){
		const Mysql = bmoorComm.connect.mysql.Mysql;

		var fn,
			rtn,
			connector = new Mysql({
				table: 'table',
				select: ['field1','field2'],
				short: ['field1'],
				insert: ['field1','field2','time'],
				update: ['field1','field2','time'],
				execute: function( query, params ){
					fn( query, params );

					return Promise.resolve( rtn );
				},
				inflate: function( datum ){
					datum.time = parseInt(datum.time/1000,10); // conver to seconds
				},
				deflate: function( datum ){
					datum.time = datum.time * 1000; // conver to ms
				}
			}),
			routes = (new Router(connector)).getRoutes();

		it('should work for read', function( done ){
			var ops = routes.$index.read;

			expect( ops.url ).toEqual('/table/instance/:id');

			fn = function( query, params ){
				expect( query.replace(/\s\s+/g, ' ').trim() )
				.toEqual('SELECT `field1`, `field2` FROM table WHERE id = ?;');

				expect( params )
				.toEqual([1234]);
			};

			rtn = [
				{time:9999,id:123}
			];

			ops.fn({id:1234})
			.then(
				function( res ){
					expect( res ).toEqual({
						id: 123,
						time: 9
					});
					
					done();
				}, 
				handleError
			);
		});

		it('should work for readMany', function( done ){
			var ops = routes.$index.readMany;

			expect( ops.url ).toEqual('/table/many');

			fn = function( query, params ){
				expect( query.replace(/\s\s+/g, ' ').trim() )
				.toEqual('SELECT `field1`, `field2` FROM table WHERE id IN (?);');

				expect( params )
				.toEqual([[1234,5678]]);
			};

			rtn = [
				{time:9999,id:123},
				{time:8888,id:456}
			];

			ops.fn({},{id:[1234,5678]})
			.then(
				function( res ){
					expect( res[0] ).toEqual({
						id: 123,
						time: 9
					});

					expect( res[1] ).toEqual({
						id: 456,
						time: 8
					});

					done();
				}, 
				handleError
			);
		});

		it('should work for all', function( done ){
			var ops = routes.$index.all;

			expect( ops.url ).toEqual('/table');

			fn = function( query, params ){
				expect( query.replace(/\s\s+/g, ' ').trim() )
				.toEqual('SELECT `field1`, `field2` FROM table;');

				expect( params )
				.toEqual([]);
			};

			rtn = [
				{time:9999,id:123},
				{time:8888,id:456}
			];

			ops.fn()
			.then(
				function( res ){
					expect( res[0] ).toEqual({
						id: 123,
						time: 9
					});

					expect( res[1] ).toEqual({
						id: 456,
						time: 8
					});

					done();
				}, 
				handleError
			);
		});

		it('should work for list', function( done ){
			var ops = routes.$index.list;

			expect( ops.url ).toEqual('/table/list');

			fn = function( query, params ){
				expect( query.replace(/\s\s+/g, ' ').trim() )
				.toEqual('SELECT `field1` FROM table;');

				expect( params )
				.toEqual([]);
			};

			rtn = [
				{time:9999,id:123},
				{time:8888,id:456}
			];

			ops.fn()
			.then(
				function( res ){
					expect( res[0] ).toEqual({
						id: 123,
						time: 9
					});

					expect( res[1] ).toEqual({
						id: 456,
						time: 8
					});

					done();
				}, 
				handleError
			);
		});

		it('should work for search', function( done ){
			var ops = routes.$index.search;

			expect( ops.url ).toEqual('/table/search');

			fn = function( query, params ){
				expect( query.replace(/\s\s+/g, ' ').trim() )
				.toEqual('SELECT `field1`, `field2` FROM table WHERE name = ? AND junk = ?;');

				expect( params )
				.toEqual(['foo','bar']);
			};

			rtn = [
				{time:9999,id:123},
				{time:8888,id:456}
			];

			ops.fn({},{query:'{"name":"foo","junk":"bar"}'})
			.then(
				function( res ){
					expect( res[0] ).toEqual({
						id: 123,
						time: 9
					});

					expect( res[1] ).toEqual({
						id: 456,
						time: 8
					});

					done();
				}, 
				handleError
			);
		});

		it('should work for create', function( done ){
			var ops = routes.$index.create;

			expect( ops.url ).toEqual('/table');

			fn = function( query, params ){
				expect( query.replace(/\s\s+/g, ' ').trim() )
				.toEqual('INSERT INTO table (field1,field2,time) VALUES (?); SELECT `field1`, `field2` FROM table WHERE id = last_insert_id();');

				expect( params )
				.toEqual([['one',2,8000]]);
			};

			rtn = [
				[{time:9999,id:123}]
			];

			ops.fn({
				field1: 'one',
				field2: 2,
				field3: 3,
				time: 8
			})
			.then(
				function( res ){
					expect( res ).toEqual({
						id: 123,
						time: 9
					});

					done();
				}, 
				handleError
			);
		});

		it('should work for update', function( done ){
			var ops = routes.$index.update;

			expect( ops.url ).toEqual('/table/:id');

			fn = function( query, params ){
				expect( query.replace(/\s\s+/g, ' ').trim() )
				.toEqual('UPDATE table SET ? WHERE id = ?; SELECT `field1`, `field2` FROM table WHERE id = ?;');

				expect( params )
				.toEqual([{time:8000,field1:'one',field2:2},123,123]);
			};

			rtn = [
				[{time:9999,id:123}]
			];

			ops.fn({id:123},{
				field1: 'one',
				field2: 2,
				field3: 3,
				time: 8
			})
			.then(
				function( res ){
					expect( res ).toEqual({
						id: 123,
						time: 9
					});

					done();
				}, 
				handleError
			);
		});

		it('should work for delete', function( done ){
			var ops = routes.$index.delete;

			expect( ops.url ).toEqual('/table/:id');

			fn = function( query, params ){
				expect( query.replace(/\s\s+/g, ' ').trim() )
				.toEqual('DELETE FROM table WHERE id = ?;');

				expect( params )
				.toEqual([123]);
			};

			rtn = 'Yay';

			ops.fn({id:123})
			.then(
				function( res ){
					expect( res ).toEqual('OK');

					done();
				}, 
				handleError
			);
		});
	});

	try{
		require('../../config/mysql.js');

		describe('live testing', function(){
			var datum,
				service = new Feed( new Model(model,{
					path: root
				}) );

			beforeEach(function(){
				bmoorComm.Requestor.$settings.fetcher = fetch;
			});
			
			it('be able to create ', function( done ){
				service.create({name:'name'+Date.now(),text:'just some junk'})
				.then(function( res ){
					datum = res;

					expect( datum ).toBeDefined();

					done();
				}, handleError(done) );
			});

			it('should allow reading', function( done ){
				service.read( datum.id )
				.then(function( res ){
					expect( res ).toEqual( datum );

					done();
				}, handleError(done) );
			});

			it('should allow reading many', function( done ){
				service.readMany( [datum.id] )
				.then(function( res ){
					expect( res[0] ).toEqual( datum );

					done();
				}, handleError(done) );
			});

			it('should allow reading all', function( done ){
				service.all()
				.then(function( res ){
					expect( res.length ).not.toEqual( 0 );
					expect( res[res.length-1].text ).toBeDefined(); // jshint ignore:line

					done();
				}, handleError(done) );
			});

			it('should allow reading list', function( done ){
				service.list()
				.then(function( res ){
					expect( res.length ).not.toEqual( 0 );
					expect( res[res.length-1].text ).toBeUndefined(); // jshint ignore:line

					done();
				}, handleError(done) );
			});

			it('should allow searching', function( done ){
				service.search({name:datum.name})
				.then(function( res ){
					expect( res.length ).toEqual( 1 );
					expect( res[0] ).toEqual( datum );

					done();
				}, handleError(done) );
			});

			it('should allow updating', function( done ){
				service.update(datum.id,{name:'-'+datum.name+'-'})
				.then(function( res ){
					expect( res.name ).toEqual( '-'+datum.name+'-' );

					done();
				}, handleError(done) );
			});

			it('should allow reading changes after update', function( done ){
				service.read( datum.id )
				.then(function( res ){
					expect( res.name ).toEqual( '-'+datum.name+'-' );

					done();
				}, handleError(done) );
			});

			it('should allow deleting', function( done ){
				service.delete(datum.id)
				.then(function( res ){
					expect( res ).toBe( 'OK' );

					done();
				}, handleError(done) );
			});
			
			it('should kill the service', function( done ){
				killSwitch.read().then(function(){
					done();
				}, handleError(done) );
			});
		});
	}catch( ex ){
		console.log( ex.message );
	}
});