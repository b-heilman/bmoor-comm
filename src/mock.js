var bmoor = require('bmoor');

module.exports = function( obj, interceptions ){
	var orig = {};

	bmoor.iterate( interceptions, function( intercept, name ){
		var fn = obj[name];

		if ( fn.$settings ){
			orig[name] = fn.$settings.intercept;
		}
	});

	return {
		disable: function(){
			bmoor.iterate( interceptions, function( intercept, name ){
				var fn = obj[name];

				if ( fn.$settings ){
					fn.$settings.intercept = orig[name];
				}
			});
		},
		enable: function(){
			bmoor.iterate( interceptions, function( intercept, name ){
				var fn = obj[name];

				if ( fn.$settings ){
					fn.$settings.intercept = intercept;
				}
			});
		}
	};
};