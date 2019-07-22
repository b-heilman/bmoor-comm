
const {defer} = require('rxjs');
const index = require('bmoor').Memory.use('comm-streams');

const overrides = [
	'read', 'readMany', 'all', 'list', 'query', 'search', 
	'create', 'update', 'delete'
];
function mapFeed(feed, stream){
	overrides.forEach(method => {
		if (feed[method]){
			stream[method] = function(...args){
				return defer(() => feed[method](...args));
			};
		}
	});
}

class Stream {
	constructor(feed, settings = {}){
		if (settings.base){
			Object.assign(this, settings.base);
		}

		mapFeed(feed, this);

		if (settings.name){
			index.register(settings.name, this);
		}
	}
}


module.exports = {
	Stream,
	default: Stream,
	index
};
