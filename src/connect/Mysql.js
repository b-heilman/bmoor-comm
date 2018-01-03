const Sql = require('./Sql.js').Sql;

function returnOne( model, multiple ){
	return function( res ){
		var rtn = multiple ? res[res.length-1][0] : res[0];

		if ( model.inflate ){
			model.inflate( rtn );
		}

		return rtn;
	};
}

function returnMany( model, multiple ){
	return function( res ){
		var rtn = multiple ? res[res.length-1] : res;

		if ( model.inflate ){
			rtn.forEach( model.inflate );
		}

		return rtn;
	};
}

class Mysql extends Sql {
	eval( exec ){
		return this.model.execute( exec.query, exec.params );
	}

	read( id ){
		var exec = super.read( id );

		return this.eval( exec ).then( returnOne(this.model) );
	}

	readMany( ids ){
		var exec = super.readMany( ids );

		return this.eval( exec ).then( returnMany(this.model) );
	}

	all(){
		var exec = super.all();

		return this.eval( exec ).then( returnMany(this.model) );
	}

	list(){
		var exec = super.list();

		return this.eval( exec ).then( returnMany(this.model) );
	}

	search( datum, short ){
		var exec = super.search( datum, short ),
			rtn = this.eval( exec );

		return rtn.then( returnMany(this.model) );
	}

	create( datum ){
		if ( this.model.deflate ){
			this.model.deflate( datum );
		}

		let exec = super.create( datum );

		exec.query += `
			SELECT ${this.select}
			FROM ${this.model.table}
			WHERE ${this.model.id} = last_insert_id();
		`;

		return this.eval( exec ).then( returnOne(this.model,true) );
	}

	update( id, datum ){
		if ( this.model.deflate ){
			this.model.deflate( datum );
		}

		let exec = super.update( id, datum );

		exec.query += `
			SELECT ${this.select}
			FROM ${this.model.table}
			WHERE ${this.model.id} = ?;
		`;

		exec.params.push( id );

		return this.eval( exec ).then( returnOne(this.model,true) );
	}

	delete( id ){
		var exec = super.delete( id );

		return this.eval( exec ).then(function(){
			return 'OK';
		});
	}
}

module.exports = {
	Mysql: Mysql
};
