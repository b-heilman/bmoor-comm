module.exports = {
	sql: require('./connect/Sql.js'),
	mysql: require('./connect/Mysql.js'),
	model: require('./connect/Model.js'),
	router: require('./connect/Router.js'),
	Feed: require('./connect/Feed.js'),
	Repo: require('./connect/Repo.js'),
	Storage: require('./connect/Storage.js')
};
