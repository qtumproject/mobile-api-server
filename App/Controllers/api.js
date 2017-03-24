"use strict";

let async = require('async'),
	logger = require('log4js').getLogger('API Controller'),
	moment = require('moment'),
	express = require('express'),
	extend = require('extend'),
	morgan = require('morgan'),
	bodyParser = require('body-parser'),
	crypto = require('crypto'),
	cors = require('cors'),
	multer = require('multer'),
	fs = require('fs');

let Controllers = getControllers();

let APIController = {
	app: {},
	io: null,
	init: function(port) {
		this.runServer(port);

		let corsOptions = {
			origin: function(origin, callback) {
				callback(null, true);
			},
			credentials: true,
			methods: ['GET', 'PUT', 'POST', 'OPTIONS', 'DELETE', 'PATCH'],
			headers: ['x-user', 'X-Signature', 'accept', 'content-type']
		};
		APIController.app.use(morgan('combined'));
		APIController.app.use(cors(corsOptions));
		APIController.app.use(bodyParser.urlencoded({extended: true}));
		APIController.app.use(bodyParser.json());
		APIController.app.options('*', cors());

        APIController.addHandler('post', '/contracts/generate-token-bytecode', Controllers.contracts.generateTokenBytecode);

        APIController.addHandler('post', '/send-raw-transaction', Controllers.transactions.sendRawTransaction);

        APIController.addHandler('get', '/history/:limit/:offset', Controllers.history.getAddressHistoryList);
        APIController.addHandler('get', '/history/:address/:limit/:offset', Controllers.history.getAddressHistory);

		APIController.addHandler('get', '/outputs/unspent/:address', Controllers.outputs.getUnspentByAddress.bind(Controllers.outputs));
		APIController.addHandler('get', '/outputs/unspent', Controllers.outputs.getUnspentByAddresses.bind(Controllers.outputs));

		APIController.addHandler('get', '/news/:lang', Controllers.news.getNews);

		APIController.addHandler('get', '/blockchain/info', Controllers.blockchain.getInfo);

        APIController.app.get('/test', function(req, res) {
            var path = require('path');
            res.sendFile(path.resolve('App/Views/index.html'));
        });

	},
	server: null,
	getServer: function() {
		return APIController.server;
	},
	runServer: function(port) {
		let express = require('express');
		APIController.app = express();
		APIController.server = require('http').Server(APIController.app);
		APIController.server.listen(port, '0.0.0.0');
		logger.info('API APP REST listen ' + port + ' Port');
	},
	/**
	 * Register new route.
	 */
	addHandler: (type, route, action) => {
		APIController.app[type](route, (req, res) => {
			async.waterfall([
				// run method
				(cb) => {
					action(cb, {
						_post: req.body,
						_get: extend({}, req.query, req.params),
						req: req,
						res: res,
						user: req.user
					});
				}
			], (err, result) => {
				res.header('Content-Type', 'text/json');
				if(err) {
					if(typeof err == 'string') {
						err = {
							message: err
						};
					}
					return res.status((result && !isNaN(parseInt(result))) ? result : 400).end(JSON.stringify(err));
				}
				if(typeof result != 'object') {
					result = {
						result: result
					};
				}
				return res.send(result);
			});
		});
	}
};

Controllers.api = APIController;