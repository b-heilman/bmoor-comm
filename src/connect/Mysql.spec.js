function handleError( ex ){
	expect( true ).toBe( false );

	console.log( ex.message );
	console.log( ex );
}

describe('bmoor-comm::connect/Mysql', function(){
	var Mysql = bmoorComm.connect.mysql.Mysql;

	describe( 'sql constructors', function(){
		var fn,
			rtn,
			t = new Mysql({
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
			});

		it('should work for read', function( done ){
			fn = function( query, params ){
				expect( query.replace(/\s\s+/g, ' ').trim() )
				.toEqual('SELECT `field1`, `field2` FROM table WHERE id = ?;');

				expect( params )
				.toEqual([1234]);
			};

			rtn = [
				{time:9999,id:123}
			];

			try{
				t.read(1234)
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
			}catch( ex ){
				handleError( ex );
			}
		});

		it('should work for readMany', function( done ){
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

			t.readMany([1234,5678])
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

			t.all()
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

			t.list()
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

			t.search({name:'foo',junk:'bar'})
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

		it('should work for search as a list', function( done ){
			fn = function( query, params ){
				expect( query.replace(/\s\s+/g, ' ').trim() )
				.toEqual('SELECT `field1` FROM table WHERE name = ? AND junk = ?;');

				expect( params )
				.toEqual(['foo','bar']);
			};

			rtn = [
				{time:9999,id:123},
				{time:8888,id:456}
			];

			t.search({name:'foo',junk:'bar'},true)
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
			fn = function( query, params ){
				expect( query.replace(/\s\s+/g, ' ').trim() )
				.toEqual('INSERT INTO table (field1,field2,time) VALUES (?); SELECT `field1`, `field2` FROM table WHERE id = last_insert_id();');

				expect( params )
				.toEqual([['one',2,8000]]);
			};

			rtn = [
				[{time:9999,id:123}]
			];

			t.create({
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
			fn = function( query, params ){
				expect( query.replace(/\s\s+/g, ' ').trim() )
				.toEqual('UPDATE table SET ? WHERE id = ?; SELECT `field1`, `field2` FROM table WHERE id = ?;');

				expect( params )
				.toEqual([{time:8000,field1:'one',field2:2},123,123]);
			};

			rtn = [
				[{time:9999,id:123}]
			];

			t.update(123,{
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
			fn = function( query, params ){
				expect( query.replace(/\s\s+/g, ' ').trim() )
				.toEqual('DELETE FROM table WHERE id = ?;');

				expect( params )
				.toEqual([123]);
			};

			rtn = 'Yay';

			t.delete(123)
			.then(
				function( res ){
					expect( res ).toEqual('OK');

					done();
				}, 
				handleError
			);
		});
	});
});
