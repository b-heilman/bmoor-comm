
function buildSelect( model, type ){
	var alias = model.alias || {},
		fields = model[type].map(function(field){
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

	model[type].forEach(function( field ){
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
		this.setModel( model );

		// I don't want these to be defined by setModel
		this.select = buildSelect( model, 'select' );

		if ( model.short ){
			this.short = buildSelect( model, 'short' );
		}else{
			this.short = this.select;
		}

		this.cleanInsert = buildStack( model, 'insert', doInsert );
		this.cleanUpdate = buildStack( model, 'update', doUpdate );
	}

	setModel( model ){
		if ( !model.table ){
			throw new Error('table must be defined');
		}

		if ( !model.id ){
			model.id = 'id';
		}

		this.model = model;
	}

	read( id ){
		return {
			query: `
				SELECT ${this.select}
				FROM ${this.model.table}
				WHERE ${this.model.id} = ?;
			`,
			params: [id]
		};
	}

	readMany( ids ){
		return {
			query: `
				SELECT ${this.select}
				FROM ${this.model.table}
				WHERE ${this.model.id} IN (?);
			`,
			params: [ids]
		};
	}

	all(){
		return {
			query: `
				SELECT ${this.select}
				FROM ${this.model.table};
			`,
			params: []
		};
	}

	list(){
		return {
			query: `
				SELECT ${this.short}
				FROM ${this.model.table};
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
				FROM ${this.model.table}
				WHERE ${sql.join(' AND ')};
			`,
			params: params
		};
	}

	create( datum ){
		var t = this.cleanInsert(datum);

		return {
			query: `
				INSERT INTO ${this.model.table}
				(${t.fields.join(',')}) VALUES (?);
			`,
			params: [t.values]
		};
	}

	update( id, delta ){
		return {
			query: `
				UPDATE ${this.model.table} SET ?
				WHERE ${this.model.id} = ?;
			`,
			params: [this.cleanUpdate(delta), id]
		};
	}

	delete( id ){
		return {
			query: `
				DELETE FROM ${this.model.table}
				WHERE ${this.model.id} = ?;
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
