const Parser = require('./Parser.js').Parser;

class Graph {
	constructor(){
		this.all = [];
		this.index = {};
	}
	
	addNode( connection ){
		var to = connection.to,
			from = connection.from,
			target = this.index[to.model];

		if ( this.index[from.model] ){
			this.index[from.model].head = false;
		}else{
			let t = {
				head: false,
				incoming: []
			};

			this.all.push( t );
			this.index[from.model] = t;
		}

		if ( target ){
			target.incoming.push( connection );
		}else{
			target = {
				head: connection.to.model,
				incoming: [ connection ]
			};

			this.all.push( target );
			this.index[to.model] = target;
		}
	}

	flip( node ){
		while( node.incoming.length ){
			let connection = node.incoming.pop(),
				to = connection.to,
				from = connection.from;

			connection.to = from;
			connection.from = to;

			this.index[connection.to.model]
				.incoming.push( connection );
		}
	}

	getHead(){
		var i, c,
			head;

		for( i = 0, c = this.all.length; i < c; i++ ){
			let d = this.all[i];

			if ( d.head ){
				if ( head ){
					this.flip( d );
				}else{
					head = d;
				}
			}
		}

		return head;
	}

	procIncoming( incoming ){
		return incoming.map( ( join ) => {
			var toField = `${join.to.table}.${join.to.field}`,
				fromField = `${join.from.table}.${join.from.field}`,
				next = this.index[join.from.model];

			return '\n\tINNER JOIN '+join.from.table+
				` ON ( ${toField} = ${fromField} )`+
				this.procIncoming( next.incoming );
		}).join('\n');
	}

	getJoins(){
		var head = this.getHead();

		return head.head+` ${this.procIncoming(head.incoming)}`;
	}
}

class Sql extends Parser {
	constructor( settings ){
		super( settings );

		this.structure = new Graph();

		this.graph.forEach( (relationship) => {
			this.structure.addNode( relationship );
		});

		let t = this.match.reduce(function( acc, m ){
				acc.query.push(`${m.field} ${m.op} ?`);
				acc.values.push(m.value);

				return acc;
			},{ query: [], values: []});

		this.select = this.fields.map(function( f ){
			return `${f.field} as \`${f.as}\``;
		}).join(',\n\t');

		this.from = this.structure.getJoins();

		this.where = t.query.join( ' AND ' );

		this.values = t.values;
	}
}

module.exports = {
	Sql: Sql
};
