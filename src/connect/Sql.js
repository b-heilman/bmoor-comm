const ConnectionModel = require('./Model.js').Model;

function buildSelect( model, type ){
	var alias = model.get('alias') || {},
		fields = model.get(type).map(function(field){
			if ( alias[field] ){
				return alias[field]+' as '+field;
			}else{
				return '`'+field+'`';
			}
		});

	return fields.join(', ');
}

function buildStack( model, type, fn ){
	var prune;

	model.get(type).forEach(function( field ){
		if ( prune ){
			let old = prune;
			prune = function( obj ){
				var rtn = old( obj );

				fn(obj,field,rtn);

				return rtn;
			};
		}else{
			prune = function( obj ){
				var rtn = {};

				fn(obj,field,rtn);

				return rtn;
			};
		}
	});

	return prune;
}

function doInsert( obj, field, rtn ){
	if ( !rtn.fields ){
		rtn.fields = [ field ];
		rtn.values = [ obj[field] ];
	}else{
		rtn.fields.push( field );
		rtn.values.push( obj[field] );
	}
}

function doUpdate( obj, field, rtn ){
	if ( field in obj ){
		rtn[field] = obj[field];
	}
}

/* model
id: primary id field, assumed id
table: the fable to do this
select: fields that can be selected
list: fields that are a subset of select, defaults to select
alias: what the really call a field
insert: fields allows to be inserted
update: fields allowed to be updated
*/
class Sql {
	constructor( model ){
		if ( model instanceof ConnectionModel ){
			this.model = model;
		}else{
			this.model = new ConnectionModel( model );
		}

		// I don't want these to be defined by setModel
		this.select = buildSelect( this.model, 'select' );

		if ( this.model.get('short') ){
			this.short = buildSelect( this.model, 'short' );
		}else{
			this.short = this.select;
		}

		this.cleanInsert = buildStack( this.model, 'insert', doInsert );
		this.cleanUpdate = buildStack( this.model, 'update', doUpdate );
	}

	read( id ){
		return {
			query: `
				SELECT ${this.select}
				FROM ${this.model.get('table')}
				WHERE ${this.model.get('id')} = ?;
			`,
			params: [id]
		};
	}

	readMany( ids ){
		return {
			query: `
				SELECT ${this.select}
				FROM ${this.model.get('table')}
				WHERE ${this.model.get('id')} IN (?);
			`,
			params: [ids]
		};
	}

	all(){
		return {
			query: `
				SELECT ${this.select}
				FROM ${this.model.get('table')};
			`,
			params: []
		};
	}

	list(){
		return {
			query: `
				SELECT ${this.short}
				FROM ${this.model.get('table')};
			`,
			params: []
		};
	}

	search( datum, short ){
		var sql = [],
			params = [];

		Object.keys(datum).forEach(function( key ){
			sql.push(`${key} = ?`);
			params.push(datum[key]);
		});

		return {
			query: `
				SELECT ${short ? this.short : this.select}
				FROM ${this.model.get('table')}
				WHERE ${sql.join(' AND ')};
			`,
			params: params
		};
	}

	create( datum ){
		var t = this.cleanInsert(datum);

		return {
			query: `
				INSERT INTO ${this.model.get('table')}
				(${t.fields.join(',')}) VALUES (?);
			`,
			params: [t.values]
		};
	}

	update( id, delta ){
		return {
			query: `
				UPDATE ${this.model.get('table')} SET ?
				WHERE ${this.model.get('id')} = ?;
			`,
			params: [this.cleanUpdate(delta), id]
		};
	}

	delete( id ){
		return {
			query: `
				DELETE FROM ${this.model.get('table')}
				WHERE ${this.model.get('id')} = ?;
			`,
			params: [id]
		};
	}
}

module.exports = {
	Sql: Sql,
	buildSelect: buildSelect,
	buildInsert: function( model ){
		return buildStack( model, doInsert );
	},
	buildUpdate: function( model ){
		return buildStack( model, doUpdate );
	}
};
