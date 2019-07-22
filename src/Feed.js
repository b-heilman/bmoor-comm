
const {applyRoutes} = require('./connect/decorator.js');

const index = require('bmoor').Memory.use('comm-feeds');

class Feed {
	constructor(ops, settings = {}){
		if (settings.base){
			Object.assign(this, settings.base);
		}

		if (ops){
			this.addRoutes(ops, settings);
		}

		if (ops.name){
			index.register(ops.name, this);
		}
	}

	addRoutes(ops, settings = {}){
		applyRoutes(this, ops, settings);
	}
}

module.exports = {
	Feed,
	default: Feed,
	index
};
