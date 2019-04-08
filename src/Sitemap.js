
const Feed = require('./connect/Feed.js');

class Sitemap {
	constructor(root){
		this.root = root;
		this.map = {};
	}

	/**
	 * {
	 *   [service]: {
	 *     read:
	 *     readMany:
	 *     all:
	 *     query:
	 *     joins: {
	 *       [otherTable] : {
	 *         url:
	 *         param:
	 *       }
	 *     },
	 *     create:
	 *     update:
	 *     delete: 
	 *   }
	 * }
	 */
	ingest(config){
		for(let service in config){
			let feed = this.getFeed(service);

			let routes = config[service];
			feed.addRoutes({
				read: routes.read ? this.root+'/'+service+routes.read : null,
				readMany: routes.readMany ? this.root+'/'+service+routes.readMany : null,
				all: routes.all ? this.root+'/'+service+routes.all : null,
				query: routes.query ? this.root+'/'+service+routes.query : null,
				create: routes.create ? this.root+'/'+service+routes.create : null,
				update: routes.update ? this.root+'/'+service+routes.update : null,
				delete: routes.delete ? this.root+'/'+service+routes.delete : null
			});

			if (routes.joins){
				for(let join in routes.joins){
					let url = routes.joins[join];
					let [otherService, param] = join.split(':');
					let otherFeed = this.getFeed(otherService);

					let search =  {
						[service+(param?':'+param:'')]: this.root+'/'+service+url
					};

					otherFeed.addRoutes({search});
				}
			}
		}
	}

	getFeed(service){
		let feed = this.map[service];

		if (!feed){
			feed = new Feed();
			this.map[service] = feed;
		}

		return feed;
	}
}

module.exports = {
	Sitemap
};
