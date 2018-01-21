const bmoor = require('bmoor'),
	schema = require('./schema.js'),
	ConnectModel = require('../connect/Model.js').Model;

function normalize( model, join ){
	return {
		model: model.name,
		table: model.get('table'),
		field: bmoor.isObject(join) ? join.field : join
	};
}

class Model extends ConnectModel {
	constructor( name, model, extend ){
		if ( !model.table ){
			model.table = name;
		}

		// model properties { joins }
		super( model, extend );

		this.name = name;

		if ( !this.mask.joins ){
			this.mask.joins = {};
		}

		schema.register( name, this );
	}

	getJoins(){
		return Object.keys( this.get('joins') ).reduce( ( acc, join ) => {
			acc.push( this.getJoin(join) );

			return acc;
		}, []);
	}

	getJoin( otherModelName ){
		var rtn,
			join = this.get('joins')[otherModelName],
			otherModel = schema.check( otherModelName ),
			otherJoin = otherModel.get('joins')[this.name];

		if( join ){
			if ( bmoor.isObject(join) ){
				rtn = {
					type: join.type
				};
			}else{
				rtn = { 
					type: 'oneway'
				};
			}

			rtn.from = normalize(
				this,
				join
			);
		}else{
			throw new Error('Missing join to: '+otherModelName);
		}

		// we know at this point the join is valid, does the other model have any info?
		if ( otherJoin ){
			rtn.to = normalize(
				otherModel,
				otherJoin
			);
		}else{
			rtn.to = normalize(
				otherModel,
				otherModel.get('id')
			);
		}

		return rtn;
	}
}

module.exports = {
	Model: Model
};
