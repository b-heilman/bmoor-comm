const schema = require('./schema.js'),
	aliasReplace = require('../connect/Sql.js').aliasReplace;
	
/*
	{
		select: {
			[nameAs] => '[model].[field]'
		},
		where: [{
			[[model].[field]] = value	
		}]
		sub: ???
	}
*/
function pushSelection( column, alias, nameAs, selections, mappings ){
	mappings[nameAs] = column;

	if ( alias ){
		column = aliasReplace( alias, column );
	}

	selections.push({
		as: nameAs,
		field: column
	});
}

class Parser{
	constructor( settings ){
		var from = [],
			joins = [],
			joined = {},
			mappings = {},
			selections = [],
			qualifiers = [];

		Object.keys( settings.select ).forEach(function(alias){
			var field,
				modelName,
				base = settings.select[alias];

			[ modelName, field ] = base.split('.');

			let model = schema.check(modelName);

			if ( !joined[modelName] ){
				joined[modelName] = true;
				joins = joins.concat( model.getJoins() );
			}

			let table = model.get('table'),
				subalias = model.get('alias') || {};

			if ( field ){
				pushSelection( table+'.'+field, subalias[field], alias, selections, mappings );
			}else{
				model.get('select').map(function( field ){
					pushSelection( table+'.'+field, subalias[field], alias+'.'+field, selections, mappings );
				});
			}
		});

		if ( settings.where ){
			Object.keys( settings.where ).forEach(function(base){
				var field,
					modelName;

				[ modelName, field ] = base.split('.');

				let model = schema.check(modelName);
				if ( !joined[modelName] ){
					joins = joins.concat( model.getJoins() );
				}

				qualifiers.push({
					op: '=',
					field: model.get('table')+'.'+field,
					value: settings.where[base]
				});
			});
		}

		joins.forEach(function( join ){
			if ( join.type === 'oneway' &&
				(joined[join.from.model] || joined[join.to.model])
			){
				from.push(join);

				joined[join.from.model] = false;
				joined[join.to.model] = false;
			}
		});

		this.joins = joins;
		this.mappings = mappings;

		this.fields = selections;
		this.graph = from;
		this.match = qualifiers;
	}
}

module.exports = {
	Parser: Parser
};
