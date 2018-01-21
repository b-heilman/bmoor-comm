const Model = require('./Model.js').Model,
	Sql = require('./Sql.js').Sql;
	
describe('bmoor-comm::query.Sql', function(){
	
	describe('formulating an string', function(){
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
			table: 'table1',
			select: ['field1','field2']
		});

		new Model('model2', {
			table: 'testTable',
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

		let q = new Sql({
			select: {
				'nodeZero': 'model0',
				'nodeOne': 'model1',
				'nodeTwo': 'model2',
				'nodeThree': 'model3',
				'nodeFour': 'model4',
				'nodeFive': 'model5',
				'nodeSix': 'model6'
			},
			where: {
				'model2.field2': '!value!'
			}
		});

		console.log( q.select );
		console.log( q.from );
		console.log( q.where );
		console.log( q.values );
	});
});
