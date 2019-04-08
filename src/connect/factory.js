
const bmoor = require('bmoor');

function makeSwitchableUrl(){
	const ctx = {};
	const keys = [];

	const fn = function(args){
		let dex = null;

		for( let i = 0, c = keys.length; i < c && !dex; i++ ){
			if (keys[i] in args){
				dex = keys[i];
			}
		}

		let rtn = ctx[dex];

		if (bmoor.isFunction(rtn)){
			rtn = rtn(args);
		}

		return rtn;
	};

	fn.append = function(key, urlGenerator){
		ctx[key] = urlGenerator;
		keys.push(key);
	};

	return fn;
}

module.exports = {
	makeSwitchableUrl
};
