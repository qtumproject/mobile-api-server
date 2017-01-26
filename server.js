"use strict";

global.ConfigPath = __dirname + '/config/main.json';

let async = require('async'),
	config = require(global.ConfigPath),
	log4js = require('log4js'),
	logger = log4js.getLogger('Server js'),
	dir = require('node-dir'),
	moment = require('moment');

// let Raven = null;
// if(!config.disableRaven) {
// 	Raven = require('raven');
// 	Raven.config('https://35b2581219364a37aa0261cc100cf13a:255b6373e8d34aebbc0cacdc5a43c415@sentry.io/123730').install();
// }

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

global.GlobalError = (key, err, cb) => {
	logger.error(key, err);
	cb('Unknown error');
};

try {
	Server.init();
} catch(e) {
	// if(!config.disableRaven)
	// 	Raven.captureException(e);
}
