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
				fn = function restfulRequest( args, datum, settings ){
					return req.go( args, datum, settings );
				};

				fn.$settings = def;

				obj[name] = fn;
			}
		}
	});
};