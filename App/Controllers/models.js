let Sequelize = require('sequelize'),
	config = require(ConfigPath).db,
	async = require('async'),
	dir = require('node-dir'),
	sequelize = new Sequelize(config.database, config.username, config.password);

let modelNameList = {};
let Controllers = getControllers();

let init = (globalCb) => {
	async.waterfall([
		(cb) => {
			dir.files(RootDir + '/App/Models', (err, files) => {
				if(err) throw err;
				files.forEach((file) => {
					let name = file.replace(/.*\/([A-z]+)\.js/, '$1');
					modelNameList[name] = {};
				});
				cb();
			});
		},
		(cb) => {
			let Models = {};
			async.forEachOf(modelNameList, (item, modelName, cb) => {
				Models[modelName] = require(__dirname + "/../Models/" + modelName + ".js")(sequelize);
				cb();
			}, (err) => {
				cb(err, Models);
			});
		}
	], globalCb);
};

Controllers.models = {
	init: init,
	mysql: sequelize
};