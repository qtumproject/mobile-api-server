"use strict";

global.ConfigPath = __dirname + '/config/main.json';

let async = require('async'),
	config = require(global.ConfigPath),
	log4js = require('log4js'),
	logger = log4js.getLogger('Server js'),
	dir = require('node-dir'),
	moment = require('moment');

let Raven = null;
if(!config.disableRaven) {
	Raven = require('raven');
	Raven.config('https://5e107da476d548918506f173c1aeaf93:d15d9ecd7c53466fb1e7d80f257f2a4a@sentry.io/133897').install();
}

let Server = {
	models: {},
	controllers: {},
	init: function() {
		async.waterfall([
			// this.runModels,
			this.runControllers,
			this.bindDefault,
			this.run
		], function() {
			logger.info('Server runned');
		});
	},
	runControllers: (cb) => {
		dir.files(__dirname + '/App/Controllers', function(err, files) {
			if(err) throw err;
			files.forEach(function(file) {
				let name = file.replace(/.*\/([A-z]+)\.js/, '$1');
				logger.info(name);
				let r = require(file);
				if(typeof r == 'function') r();
			});
			cb();
		});
	},
	bindDefault: (cb) => cb(),
	run: function() {
		Server.controllers.models.init((err, Models) => {
			if(err) {
				return logger.error('Init models error', err);
			}
			
			Object.keys(Models).forEach(name => {
				Server.models[name] = Models[name];
			});
			
			Server.controllers.api.init(5931);
			
		});
	}
};

/**
 * @returns {{}}
 */
global.getModels = () => Server.models;

global.getControllers = () => Server.controllers;

global.RootDir = __dirname;

global.GlobalError = (key, err, cb = () => {}) => {
	logger.error(key, err);
	Raven.captureException(err, {
		key: key
	});
	cb('Unknown error');
};

try {
	Server.init();
} catch(e) {
	logger.error(e);
	if(!config.disableRaven)
		Raven.captureException(e);
}
