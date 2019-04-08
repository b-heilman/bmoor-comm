
const bmoor = require('bmoor');
const parser = /[\?&;]([^=]+)\=([^&;#]+)/g;
const getFormatter = bmoor.string.getFormatter;

function stack(old, variable, value){
	let rtn = null;

	const format = getFormatter(value);

	function fn(value){
		if (Array.isArray(value)){
			return format(value.join(','));
		} else {
			return format(value);
		}
	}

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

// TODO : I want to convert this to using and generating native URL.
/****
 * var url = new URL("https://geo.example.org/api"),
 * params = {lat:35.696233, long:139.570431}
 * Object.keys(params).forEach(key => url.searchParams.append(key, params[key]))
 * fetch(url).then(...)
 */
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
				path = getFormatter(url);
				query = null;
			}else{
				path = getFormatter(url.substring(0, pos));
				url = url.substring(pos);

				let match;
				while ((match = parser.exec(url)) !== null) {
					query = stack(query, match[1], match[2]);
				}
			}
		}

		this.path = path;
		this.query = query;
	}

	go(obj){
		var u = this.path(obj);

		if (this.query){
			if (bmoor.isArray(obj)){
				obj.forEach((v, i) => {
					if (i){
						u += '&';
					}else{
						u += '?';
					}

					u += this.query( v );
				});
			}else{
				u += '?'+this.query(obj);
			}
		}

		return u;
	}
}

module.exports = Url;
