
const {Feed, index: feedIndex} = require('./Feed.js');
const {Stream} = require('./Stream.js');

class Sitemap {
	constructor(root){
		this.root = root;
		this.map = {};
	}

	/**
	 * {
	 *   [service]: {
	 *     routes: {
	 *     		read:
	 *     		readMany:
	 *     		all:
	 *     		query:,
	 *     		create:
	 *     		update:
	 *     		delete: 
	 *     },
	 *     joins: {
	 *       [param] : url:
	 *     }
	 *   }
	 * }
	 */
	ingest(config, settings = {}){
		for(let service in config){
			let feed = this.getFeed(service);

			let {routes, joins} = config[service];

			if (routes){
				routes = {
					read: routes.read ? this.root+routes.read : null,
					readMany: routes.readMany ? this.root+routes.readMany : null,
					all: routes.all ? this.root+routes.all : null,
					query: routes.query ? this.root+routes.query : null,
					create: routes.create ? this.root+routes.create : null,
					update: routes.update ? this.root+routes.update : null,
					delete: routes.delete ? this.root+routes.delete : null
				};
			} else {
				routes = {};
			}

			if (joins){
				const search = {};
				for(let join in joins){
					search[join] = this.root+joins[join];
				}

				routes.search = search;
			}

			feed.addRoutes(routes);

			if (settings.stream){
				this.addStream(feed, service);
			}
		}
	}

	getFeed(service){
		let feed = feedIndex.get(service);

		if (!feed){
			feed = new Feed({name: service});
		}

		return feed;
	}

	addStream(feed, service){
		return new Stream(feed, {name: service});
	}
}

module.exports = {
	Sitemap
};
