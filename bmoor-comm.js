
module.exports = {
	connect: require('./src/connect.js'),
	mock: require('./src/mock.js'),
	Url: require('./src/Url.js'),
	Requestor: require('./src/Requestor.js'),
	restful: require('./src/restful.js'),
	Feed: require('./src/Feed.js').Feed,
	Stream: require('./src/Stream.js').Stream,
	Sitemap: require('./src/Sitemap.js').Sitemap,
	testing: {
		Requestor: require('./src/Requestor.mock.js')
	}
};
