var bmoor = require('bmoor'),
	Requestor = require('./Requestor.js');

module.exports = function( obj, definition ){
	bmoor.iterate( definition, function( def, name ){
		var req = new Requestor( def ),
			fn = function restfulRequest( args, datum, settings ){
				return req.go( args, datum, settings );
			};

		fn.$settings = def;

		obj[name] = fn;
	});
};