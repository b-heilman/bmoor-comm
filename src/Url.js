var bmoor = require('bmoor'),
	parser = /[\?&;]([^=]+)\=([^&;#]+)/g,
	getFormatter = bmoor.string.getFormatter;

function stack( old, variable, value ){
	var rtn,
		fn = getFormatter( value );

	if ( old ){
		rtn = function( obj ){
			return old(obj)+'&'+variable+'='+fn(obj);
		};
	}else{
		rtn = function( obj ){
			return variable+'='+fn(obj);
		};
	}

	return rtn;
}

class Url {
	constructor( url ){
		var pos,
			path,
			query;

		if ( !url || url.indexOf('{{') === -1 ){
			path = function(){
				return url;
			};
			query = null;
		}else{
			url = url.replace(/\}\}/g,'|url}}');

			pos = url.indexOf('?');

			if ( pos === -1 ){
				path = getFormatter( url );
				query = null;
			}else{
				path = getFormatter( url.substring(0,pos) );
				url = url.substring( pos );

				let match;
				while ( (match = parser.exec(url)) !== null ) {
					query = stack( query, match[1], match[2] );
				}
			}
		}

		this.go = function( obj ){
			var u = path( obj );

			if ( query ){
				if ( bmoor.isArray(obj) ){
					obj.forEach(function( v, i ){
						if ( i ){
							u += '&';
						}else{
							u += '?';
						}

						u += query( v );
					});
				}else{
					u += '?'+query( obj );
				}
			}

			return u;
		};
	}
}

module.exports = Url;