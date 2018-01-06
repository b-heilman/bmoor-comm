const Sql = require('./Sql.js').Sql;

function returnOne( model, multiple ){
	return function( res ){
		var rtn = multiple ? res[res.length-1][0] : res[0],
			inflate = model.get('inflate');

		if ( inflate ){
			inflate( rtn );
		}

		return rtn;
	};
}

function returnMany( model, multiple ){
	return function( res ){
		var rtn = multiple ? res[res.length-1] : res,
			inflate = model.get('inflate');

		if ( inflate ){
			rtn.forEach( inflate );
		}

		return rtn;
	};
}

class Mysql extends Sql {
	eval( exec ){
		return this.model.get('execute')( exec.query, exec.params );
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
		var deflate = this.model.get('deflate');

		if ( deflate ){
			deflate( datum );
		}

		let exec = super.create( datum );

		exec.query += `
			SELECT ${this.select}
			FROM ${this.model.get('table')}
			WHERE ${this.model.get('id')} = last_insert_id();
		`;

		return this.eval( exec ).then( returnOne(this.model,true) );
	}

	update( id, datum ){
		var deflate = this.model.get('deflate');

		if ( deflate ){
			deflate( datum );
		}

		let exec = super.update( id, datum );

		exec.query += `
			SELECT ${this.select}
			FROM ${this.model.get('table')}
			WHERE ${this.model.get('id')} = ?;
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
