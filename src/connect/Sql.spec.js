describe('bmoor-comm::connect/Sql', function(){
	var Sql = bmoorComm.connect.sql.Sql;

	describe('default methods', function(){
		it('should fail if no table', function(){
			try{
				new Sql({
				});

				expect( true ).toBe( false );
			}catch( ex ){
				expect( ex.message ).toBeDefined();
			}
		});

		it('should fail if no select', function(){
			try{
				new Sql({
					table: 'table'
				});

				expect( true ).toBe( false );
			}catch( ex ){
				expect( ex.message ).toBeDefined();
			}
		});

		it('should fail if no insert', function(){
			try{
				new Sql({
					table: 'table',
					select: ['field1','field2']
				});

				expect( true ).toBe( false );
			}catch( ex ){
				expect( ex.message ).toBeDefined();
			}
		});

		it('should fail if no update', function(){
			try{
				new Sql({
					table: 'table',
					select: ['field1','field2'],
					insert: ['field1','field2']
				});

				expect( true ).toBe( false );
			}catch( ex ){
				expect( ex.message ).toBeDefined();
			}
		});

		it('should default id to "id"', function(){
			var t = new Sql({
					table: 'table',
					select: ['field1','field2'],
					insert: ['field1','field2'],
					update: ['field1','field2']
				});

			expect( t.model.id ).toBe( 'id' );
		});

		it('should clean data for insert', function(){
			var datum = {
					field1: null,
					field2: undefined,
					field3: 0,
					field0: 'hello',
					field4: 'world'
				},
				t = new Sql({
					table: 'table',
					select: ['field1','field2'],
					insert: ['field1','field2','field3'],
					update: ['field1','field2']
				});

			expect( t.cleanInsert(datum) ).toEqual({
				fields: ['field1','field2','field3'],
				values: [null,undefined,0]
			});
		});

		it('should clean data for update', function(){
			var datum = {
					field1: null,
					field2: undefined,
					field3: 0,
					field0: 'hello',
					field4: 'world'
				},
				t = new Sql({
					table: 'table',
					select: ['field1','field2'],
					insert: ['field1','field2'],
					update: ['field1','field2','field3']
				});

			expect( t.cleanUpdate(datum) ).toEqual({
				field1: null,
				field2: undefined,
				field3: 0
			});
		});

		it('should properly define select', function(){
			var t = new Sql({
					table: 'table',
					select: ['field1','field2'],
					insert: ['field1','field2'],
					update: ['field1','field2']
				});

			expect( t.select ).toBe( '`field1`, `field2`' );
		});

		it('should properly define select with alias', function(){
			var t = new Sql({
					table: 'table',
					select: ['field1','field2'],
					alias: {
						'field1': 'abc123'
					},
					insert: ['field1','field2'],
					update: ['field1','field2']
				});

			expect( t.select ).toBe( 'abc123 as field1, `field2`' );
		});

		it('should properly define short as select if not defined', function(){
			var t = new Sql({
					table: 'table',
					select: ['field1','field2'],
					insert: ['field1','field2'],
					update: ['field1','field2']
				});

			expect( t.short ).toBe( '`field1`, `field2`' );
		});

		it('should properly define short if defined', function(){
			var t = new Sql({
					table: 'table',
					select: ['field1','field2'],
					short: ['field1'],
					insert: ['field1','field2'],
					update: ['field1','field2']
				});

			expect( t.short ).toBe( '`field1`' );
		});

		it('should properly define short with alias if defined', function(){
			var t = new Sql({
					table: 'table',
					select: ['field1','field2'],
					short: ['field1'],
					alias: {
						'field1': 'abc123'
					},
					insert: ['field1','field2'],
					update: ['field1','field2']
				});

			expect( t.short ).toBe( 'abc123 as field1' );
		});
	});

	describe( 'sql constructors', function(){
		var t = new Sql({
				table: 'table',
				select: ['field1','field2'],
				short: ['field1'],
				insert: ['field1','field2'],
				update: ['field1','field2']
			});

		it('should work for read', function(){
			var exec = t.read(1234);

			expect( exec.query.replace(/\s\s+/g, ' ').trim() )
			.toEqual('SELECT `field1`, `field2` FROM table WHERE id = ?;');

			expect( exec.params )
			.toEqual([1234]);
		});

		it('should work for readMany', function(){
			var exec = t.readMany([1234,5678]);

			expect( exec.query.replace(/\s\s+/g, ' ').trim() )
			.toEqual('SELECT `field1`, `field2` FROM table WHERE id IN (?);');

			expect( exec.params )
			.toEqual([[1234,5678]]);
		});

		it('should work for all', function(){
			var exec = t.all();

			expect( exec.query.replace(/\s\s+/g, ' ').trim() )
			.toEqual('SELECT `field1`, `field2` FROM table;');

			expect( exec.params )
			.toEqual([]);
		});

		it('should work for list', function(){
			var exec = t.list();

			expect( exec.query.replace(/\s\s+/g, ' ').trim() )
			.toEqual('SELECT `field1` FROM table;');

			expect( exec.params )
			.toEqual([]);
		});

		it('should work for search', function(){
			var exec = t.search({name:'foo',junk:'bar'});

			expect( exec.query.replace(/\s\s+/g, ' ').trim() )
			.toEqual('SELECT `field1`, `field2` FROM table WHERE name = ? AND junk = ?;');

			expect( exec.params )
			.toEqual(['foo','bar']);
		});

		it('should work for search as a list', function(){
			var exec = t.search({name:'foo',junk:'bar'},true);

			expect( exec.query.replace(/\s\s+/g, ' ').trim() )
			.toEqual('SELECT `field1` FROM table WHERE name = ? AND junk = ?;');

			expect( exec.params )
			.toEqual(['foo','bar']);
		});

		it('should work for create', function(){
			var exec = t.create({
					field1: 'one',
					field2: 2,
					field3: 3
				});

			expect( exec.query.replace(/\s\s+/g, ' ').trim() )
			.toEqual('INSERT INTO table (field1,field2) VALUES (?);');

			expect( exec.params )
			.toEqual([ ['one',2] ]);
		});

		it('should work for update', function(){
			var exec = t.update(123,{
					field1: 'one',
					field2: 2,
					field3: 3
				});

			expect( exec.query.replace(/\s\s+/g, ' ').trim() )
			.toEqual('UPDATE table SET ? WHERE id = ?;');

			expect( exec.params )
			.toEqual([{
				field1: 'one',
				field2: 2
			},123]);
		});

		it('should work for delete', function(){
			var exec = t.delete(123);

			expect( exec.query.replace(/\s\s+/g, ' ').trim() )
			.toEqual('DELETE FROM table WHERE id = ?;');

			expect( exec.params )
			.toEqual([123]);
		});
	});
});
