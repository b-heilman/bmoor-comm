var bmoor = require('bmoor'),
	Requestor = require('./Requestor.js');

module.exports = function( obj, definition ){
	bmoor.iterate( definition, function( def, name ){
		var fn,
			req;

		if ( bmoor.isFunction(def) ){
			obj[name] = def;
		}else{
			req = new Requestor( def );
			fn = function restfulRequest( args, datum, settings ){
				return req.go( args, datum, settings );
			};

			fn.$settings = def;

			obj[name] = fn;
		}
	});
};