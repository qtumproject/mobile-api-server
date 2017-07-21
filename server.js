"use strict";

global.ConfigPath = __dirname + '/config/main.json';

let async = require('async'),
	config = require(global.ConfigPath),
	log4js = require('log4js'),
	logger = log4js.getLogger('Server js'),
	dir = require('node-dir'),
	moment = require('moment');

const mongoose = require('mongoose');
const bluebird = require('bluebird');
const i18n = require("i18n");
const contractPurchaseWatcherInstance = require("./App/Components/ContractPurchaseWatcherInstance");

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
			this.setLocale,
            this.connectToDB,
			this.runControllers,
			this.bindDefault,
			this.run
		], function() {
			logger.info('Server runned');
		});
	},
	setLocale(cb) {
        i18n.configure({
            locales:['en', 'es', 'de', 'cn'],
            directory: __dirname + '/locales',
            objectNotation: true
        });

        return cb();
	},
    connectToDB(cb) {

        let configDB = config.DB,
            userUrl = (configDB['USER']) ? (configDB['USER'] + ':' + configDB['PASSWORD'] + '@') : '',
            url = 'mongodb://' + userUrl + configDB['HOST'] + ':' + configDB['PORT'] + '/' + configDB['DATABASE'];

        mongoose.Promise = bluebird;
        mongoose.connect(url, (err) => {

            if (err) {
                return cb(err);
            }

            return cb();

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
    	Server.controllers.api.init(config.PORT || 5931);
    	Server.controllers.socket.init(Server.controllers.api.server);

    	contractPurchaseWatcherInstance.start();

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
