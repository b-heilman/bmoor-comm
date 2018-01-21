const Model = require('./Model.js').Model,
	Parser = require('./Parser.js').Parser;
	
describe('bmoor-comm::query.Parser', function(){
	describe('at very least', function(){
		new Model('model1', {
			id: 'tableId',
			table: 'table1',
			select: ['field1','field2'],
			alias: {
				'field1': 'parseInt({$})'
			}
		});

		new Model('model2', {
			table: 'table2',
			select: ['field1','field2', 'foreignId'],
			joins: {
				model1: 'foreignId'
			}
		});

		let select = new Parser({
			select: {
				'modelOne': 'model1',
				'field1': 'model2.field1',
				'fieldForeign': 'model2.foreignId'
			},
			where: {
				'model2.field2': '!value!'
			}
		});

		it('should properly define joins', function(){
			var target = [{
					type: 'oneway',
					from: {
						model: 'model2',
						table: 'table2',
						field: 'foreignId'
					},
					to: {
						model: 'model1',
						table: 'table1',
						field: 'tableId'
					}
				}];

			expect( select.joins ).toEqual( target );
		});

		it('should properly define mappings', function(){
			expect(select.mappings).toEqual({
				'modelOne.field1': 'table1.field1',
				'modelOne.field2': 'table1.field2',
				'field1': 'table2.field1',
				'fieldForeign': 'table2.foreignId'
			});
		});

		it('should properly define fields', function(){
			expect(select.fields).toEqual([
				{
				'as': 'modelOne.field1',
				'field': 'parseInt(table1.field1)'
				},
				{
				'as': 'modelOne.field2',
				'field': 'table1.field2'
				},
				{
				'as': 'field1',
				'field': 'table2.field1'
				},
				{
				'as': 'fieldForeign',
				'field': 'table2.foreignId'
				}
			]);
		});
		
		it('should properly define graph', function(){
			var target = [{
					type: 'oneway',
					from: {
						model: 'model2',
						table: 'table2',
						field: 'foreignId'
					},
					to: {
						model: 'model1',
						table: 'table1',
						field: 'tableId'
					}
				}];

			let t1 = JSON.stringify(select.graph,null,2),
				t2 = JSON.stringify(target,null,2);
			
			for ( let i = 0, c = t2.length; i < c; i++ ){
				if ( t1.charAt(i) !== t2.charAt(i) ){
					console.log( t1.charAt(i), '=>', t2.charAt(i) );
				}
			}

			console.log( JSON.stringify(select.graph,null,2) === JSON.stringify(target,null,2) );
			expect(select.graph).toEqual( target );
		});

		it('should properly define where', function(){
			expect(select.match).toEqual([{
				'op': '=',
				'field': 'table2.field2',
				'value': '!value!'
			}]);
		});
	});

	describe('complex join change', function(){
		new Model('modelNull', {
			select: ['field1','field2', 'foreignId'],
			joins: {
				model0: 'foreignId'
			}
		});

		new Model('model0', {
			select: ['field1','field2', 'foreignId'],
			joins: {
				model1: 'foreignId'
			}
		});

		new Model('model1', {
			select: ['field1','field2']
		});

		new Model('model2', {
			select: ['field1','field2', 'foreignId'],
			joins: {
				model1: 'foreignId'
			}
		});

		new Model('model3', {
			select: ['field1','field2', 'foreignId'],
			joins: {
				model2: 'foreignId',
				model6: 'id'
			}
		});

		new Model('model4', {
			select: ['field1','field2', 'foreignId'],
			joins: {
				model1: 'foreignId'
			}
		});

		new Model('model5', {
			select: ['field1','field2', 'foreignId'],
			joins: {
				model4: 'foreignId',
				model6: 'id'
			}
		});

		new Model('model6', {
			select: ['idOne', 'idTwo'],
			joins: {
				model3: 'idOne',
				model5: 'idTwo'
			}
		});

		let select = new Parser({
			select: {
				'modelZero': 'model0',
				'modelOne': 'model1',
				'modelTwo': 'model2',
				'modelThree': 'model3',
				'modelFour': 'model4',
				'modelFive': 'model5',
				'modelSix': 'model6'
			}
		});

		it('should properly define joins', function(){
			expect(select.joins).toEqual([
				{
					'type': 'oneway',
					'from': {
						'model': 'model0',
						'table': 'model0',
						'field': 'foreignId'
					},
					'to': {
						'model': 'model1',
						'table': 'model1',
						'field': 'id'
					}
				},
				{
					'type': 'oneway',
					'from': {
						'model': 'model2',
						'table': 'model2',
						'field': 'foreignId'
					},
					'to': {
						'model': 'model1',
						'table': 'model1',
						'field': 'id'
					}
				},
				{
					'type': 'oneway',
					'from': {
						'model': 'model3',
						'table': 'model3',
						'field': 'foreignId'
					},
					'to': {
						'model': 'model2',
						'table': 'model2',
						'field': 'id'
					}
				},
				{
					'type': 'oneway',
					'from': {
						'model': 'model3',
						'table': 'model3',
						'field': 'id'
					},
					'to': {
						'model': 'model6',
						'table': 'model6',
						'field': 'idOne'
					}
				},
				{
					'type': 'oneway',
					'from': {
						'model': 'model4',
						'table': 'model4',
						'field': 'foreignId'
					},
					'to': {
						'model': 'model1',
						'table': 'model1',
						'field': 'id'
					}
				},
				{
					'type': 'oneway',
					'from': {
						'model': 'model5',
						'table': 'model5',
						'field': 'foreignId'
					},
					'to': {
						'model': 'model4',
						'table': 'model4',
						'field': 'id'
					}
				},
				{
					'type': 'oneway',
					'from': {
						'model': 'model5',
						'table': 'model5',
						'field': 'id'
					},
					'to': {
						'model': 'model6',
						'table': 'model6',
						'field': 'idTwo'
					}
				},
				{
					'type': 'oneway',
					'from': {
						'model': 'model6',
						'table': 'model6',
						'field': 'idOne'
					},
					'to': {
						'model': 'model3',
						'table': 'model3',
						'field': 'id'
					}
				},
				{
					'type': 'oneway',
					'from': {
						'model': 'model6',
						'table': 'model6',
						'field': 'idTwo'
					},
					'to': {
						'model': 'model5',
						'table': 'model5',
						'field': 'id'
					}
				}
			]);
		});

		it('should properly define graph', function(){
			expect(select.graph).toEqual([
				{
					'type': 'oneway',
					'from': {
						'model': 'model0',
						'table': 'model0',
						'field': 'foreignId'
					},
					'to': {
						'model': 'model1',
						'table': 'model1',
						'field': 'id'
					}
				},
				{
					'type': 'oneway',
					'from': {
						'model': 'model2',
						'table': 'model2',
						'field': 'foreignId'
					},
					'to': {
						'model': 'model1',
						'table': 'model1',
						'field': 'id'
					}
				},
				{
					'type': 'oneway',
					'from': {
						'model': 'model3',
						'table': 'model3',
						'field': 'foreignId'
					},
					'to': {
						'model': 'model2',
						'table': 'model2',
						'field': 'id'
					}
				},
				{
					'type': 'oneway',
					'from': {
						'model': 'model3',
						'table': 'model3',
						'field': 'id'
					},
					'to': {
						'model': 'model6',
						'table': 'model6',
						'field': 'idOne'
					}
				},
				{
					'type': 'oneway',
					'from': {
						'model': 'model4',
						'table': 'model4',
						'field': 'foreignId'
					},
					'to': {
						'model': 'model1',
						'table': 'model1',
						'field': 'id'
					}
				},
				{
					'type': 'oneway',
					'from': {
						'model': 'model5',
						'table': 'model5',
						'field': 'foreignId'
					},
					'to': {
						'model': 'model4',
						'table': 'model4',
						'field': 'id'
					}
				}
			]);
		});
	});
});
