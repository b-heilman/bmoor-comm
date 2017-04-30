module.exports = {
	connect: require('./src/connect.js'),
	mock: require('./src/mock.js'),
	Requestor: require('./src/Requestor.js'),
	restful: require('./src/restful.js'),
	testing: {
		Requestor: require('./src/Requestor.mock.js')
	}
};