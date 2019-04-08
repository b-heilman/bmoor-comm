
const bmoor = require('bmoor');
const {applyRoutes} = require('./decorator.js');

class Feed {
	constructor(ops, settings = {}){
		
		if (settings.base){
			bmoor.object.extend(this, settings.base);
		}

		if (ops){
			this.addRoutes(ops, settings);
		}
	}

	addRoutes(ops, settings = {}){
		applyRoutes(this, ops, settings);
	}
}

module.exports = Feed;
