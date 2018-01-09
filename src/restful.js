var bmoor = require('bmoor'),
	Requestor = require('./Requestor.js');

module.exports = function( obj, definition ){
	bmoor.each( definition, function( def, name ){
		var fn,
			req;

		if ( def ){ // at least protect from undefined and null
			if ( bmoor.isFunction(def) ){
				obj[name] = def;
			}else{
				if ( bmoor.isString(def) ){
					def = { url: def };
				}

				req = new Requestor( def );

				if ( def.interface ){
					fn = function restfulRequest(){
						var commands = def.interface.apply( this, arguments );
						
						return req.go(
							commands.args,
							commands.datum,
							commands.settings
						);
					};
				}else{
					fn = function restfulRequest( args, datum, settings ){
						return req.go(
							args,
							datum,
							settings
						);
					};
				}

				fn.$settings = def;

				obj[name] = fn;
			}
		}
	});
};